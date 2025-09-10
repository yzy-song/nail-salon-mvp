import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeWebhookService.name);

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

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async handlePaymentIntentSucceeded(appointmentId: string) {
    if (!appointmentId) {
      this.logger.error(
        'Webhook received for payment_intent.succeeded without an appointmentId in metadata.',
      );
      return;
    }

    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'paid',
        status: 'CONFIRMED', // Automatically confirm the appointment on successful payment
      },
    });
    this.logger.log(`Payment succeeded for appointment ${appointmentId}`);
  }

  async handlePaymentIntentFailed(appointmentId: string) {
    if (!appointmentId) {
      this.logger.error(
        'Webhook received for payment_intent.payment_failed without an appointmentId in metadata.',
      );
      return;
    }

    // Update the appointment to reflect the failed payment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'failed',
        // We keep the status as PENDING so the user can try to pay again
      },
    });
    this.logger.log(`Payment failed for appointment ${appointmentId}`);
  }

  async handlePaymentIntentCanceled(appointmentId: string) {
    if (!appointmentId) {
      this.logger.error(
        'Webhook received for payment_intent.canceled without an appointmentId in metadata.',
      );
      return;
    }

    // Update the appointment to reflect the canceled payment
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'canceled',
      },
    });
    this.logger.log(`Payment canceled for appointment ${appointmentId}`);
  }

  async handleChargeRefunded(appointmentId: string) {
    if (!appointmentId) {
      this.logger.error(
        'Webhook received for charge.refunded without an appointmentId in metadata.',
      );
      return;
    }

    // Update the appointment to reflect the refunded charge
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'refunded',
      },
    });
    this.logger.log(`Charge refunded for appointment ${appointmentId}`);
  }
}
