import { Module } from '@nestjs/common';
import { StripeClientService } from './services/stripe-client.service.js';
import { StripeCheckoutService } from './services/stripe-checkout.service.js';

@Module({
  providers: [StripeClientService, StripeCheckoutService],
  exports: [StripeClientService, StripeCheckoutService],
})
export class StripeModule {}
