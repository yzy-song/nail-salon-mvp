import { Controller, Post, Headers, Req } from '@nestjs/common';
import { StripeWebhookService } from './stripe.webhook.service';
import { Stripe } from 'stripe';
import type { Request } from 'express';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request, // We need the raw body
  ) {
    if (!req.rawBody) {
      throw new Error('Stripe webhook error: rawBody is missing from request.');
    }
    const event = this.webhookService.constructEventFromPayload(
      signature,
      req.rawBody, // Use the raw body buffer
    );

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = paymentIntent.metadata.appointmentId;

    // 👇 --- Use a switch statement to handle different events --- 👇
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.webhookService.handlePaymentIntentSucceeded(appointmentId);
        break;
      case 'payment_intent.payment_failed':
        await this.webhookService.handlePaymentIntentFailed(appointmentId);
        break;
      case 'payment_intent.canceled':
        await this.webhookService.handlePaymentIntentCanceled(appointmentId);
        break;
      case 'charge.refunded':
        await this.webhookService.handleChargeRefunded(appointmentId);
        break;
      // You could add more cases here in the future, e.g., 'charge.refunded'
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
