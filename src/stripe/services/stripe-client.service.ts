import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { EnvConfig } from '@/common/config/env.config.js';

@Injectable()
export class StripeClientService {
  readonly client: Stripe;

  constructor(config: ConfigService<EnvConfig, true>) {
    this.client = new Stripe(config.get('STRIPE_SECRET_KEY', { infer: true }));
  }
}
