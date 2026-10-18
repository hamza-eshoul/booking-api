import { Module } from '@nestjs/common';
import { StripeClientService } from './services/stripe-client.service.js';
import { StripeCheckoutService } from './services/stripe-checkout.service.js';
import { StripeWebhookService } from './services/stripe-webhook.service.js';

@Module({
  providers: [StripeClientService, StripeCheckoutService, StripeWebhookService],
  exports: [StripeClientService, StripeCheckoutService, StripeWebhookService],
})
export class StripeModule {}
