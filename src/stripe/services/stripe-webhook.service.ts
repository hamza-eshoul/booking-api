import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Stripe from 'stripe';
import type { EnvConfig } from '@/common/config/env.config.js';
import { StripeClientService } from './stripe-client.service.js';

@Injectable()
export class StripeWebhookService {
  private readonly webhookSecret: string;

  constructor(
    private readonly stripe: StripeClientService,
    config: ConfigService<EnvConfig, true>,
  ) {
    this.webhookSecret = config.get('STRIPE_WEBHOOK_SECRET', { infer: true });
  }

  parseEvent(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ): Stripe.Event {
    if (!rawBody || !signature)
      throw new BadRequestException('Missing body or Stripe signature');
    try {
      return this.stripe.client.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }
  }
}
