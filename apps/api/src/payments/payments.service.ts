import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

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

    const amountInCents = appointment.service.price * 100;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur', // Or your currency
      metadata: { appointmentId: appointment.id },
    });

    // Update our appointment with the payment intent ID
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return { clientSecret: paymentIntent.client_secret };
  }
}
