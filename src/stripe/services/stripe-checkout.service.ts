import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { StripeClientService } from './stripe-client.service.js';
import { StripeConstants } from '../constants/stripe.constants.js';
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
} from '../interfaces/checkout-session.interface.js';

@Injectable()
export class StripeCheckoutService {
  constructor(private readonly stripe: StripeClientService) {}

  async createSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSession> {
    const expiresAt =
      Math.floor(Date.now() / 1000) +
      StripeConstants.CHECKOUT_EXPIRES_MINUTES * 60;
    const session = await this.stripe.client.checkout.sessions.create({
      mode: 'payment',
      customer_email: input.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency,
            unit_amount: input.priceCents,
            product_data: {
              name: input.serviceName,
              description: input.serviceDescription,
            },
          },
        },
      ],
      metadata: { bookingId: input.bookingId, manageToken: input.manageToken },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: expiresAt,
    });
    if (!session.url)
      throw new ServiceUnavailableException('Stripe returned no checkout URL');
    return { id: session.id, url: session.url };
  }
}
