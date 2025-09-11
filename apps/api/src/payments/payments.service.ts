import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // 幂等校验：如果已有 paymentIntentId，直接返回
    if (appointment.paymentIntentId) {
      const existingIntent = await this.stripe.paymentIntents.retrieve(appointment.paymentIntentId);
      // 只有在 intent 还未支付的情况下才复用
      if (
        existingIntent &&
        existingIntent.status !== 'succeeded' &&
        existingIntent.status !== 'canceled'
      ) {
        this.logger.log(`Reused payment intent for appointment ${appointmentId}`);
        return { clientSecret: existingIntent.client_secret };
      }
    }

    const amountInCents = appointment.service.price * 100;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: { appointmentId: appointment.id },
    });
    this.logger.log(`Created payment intent for appointment ${appointmentId}`);

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return { clientSecret: paymentIntent.client_secret };
  }
}
