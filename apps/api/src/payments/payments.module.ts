import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeWebhookService } from './stripe.webhook.service';

@Module({
  controllers: [PaymentsController, StripeWebhookController],
  providers: [PaymentsService, StripeWebhookService],
})
export class PaymentsModule {}
