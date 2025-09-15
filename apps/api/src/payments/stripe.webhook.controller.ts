import { Controller, Post, Headers, Req } from '@nestjs/common';
import { StripeWebhookService } from './stripe.webhook.service';
import { Stripe } from 'stripe';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponses } from 'src/common/decorators/api-common-responses.decorator';

@ApiTags('Stripe Webhooks')
@ApiBearerAuth()
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiCommonResponses()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request, // We need the raw body
  ) {
    const event = this.webhookService.constructEventFromPayload(signature, req.body);

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
