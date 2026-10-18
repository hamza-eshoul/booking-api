import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeWebhookService } from '@/stripe/services/stripe-webhook.service.js';
import { BookingsRepository } from '../repositories/bookings.repository.js';
import { StripeEventsRepository } from '../repositories/stripe-events.repository.js';

type Handler = (session: Stripe.Checkout.Session) => Promise<void>;

@Injectable()
export class BookingPaymentsService {
  private readonly logger = new Logger(BookingPaymentsService.name);
  private readonly handlerByType: Record<string, Handler> = {
    'checkout.session.completed': (session) => this.confirm(session),
    'checkout.session.expired': (session) => this.expire(session),
  };

  constructor(
    private readonly stripeWebhook: StripeWebhookService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly stripeEventsRepository: StripeEventsRepository,
  ) {}

  async handleWebhook(
    rawBody: Buffer | undefined,
    signature: string | undefined,
  ) {
    const event = this.stripeWebhook.parseEvent(rawBody, signature);
    if (await this.stripeEventsRepository.isProcessed(event.id))
      return { received: true, duplicate: true };
    await this.stripeEventsRepository.record(event.id, event.type);
    const handler = this.handlerByType[event.type];
    if (handler) await handler(event.data.object as Stripe.Checkout.Session);
    await this.stripeEventsRepository.markProcessed(event.id);
    return { received: true, duplicate: false };
  }

  private async confirm(session: Stripe.Checkout.Session): Promise<void> {
    const booking = await this.findPending(session);
    if (!booking) return;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);
    await this.bookingsRepository.confirm(booking.id, paymentIntentId);
  }

  private async expire(session: Stripe.Checkout.Session): Promise<void> {
    const booking = await this.findPending(session);
    if (!booking) return;
    await this.bookingsRepository.expire(booking.id);
  }

  private async findPending(session: Stripe.Checkout.Session) {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      this.logger.warn(`Checkout session ${session.id} has no bookingId`);
      return null;
    }
    const booking = await this.bookingsRepository.findStatus(bookingId);
    if (!booking || booking.status !== 'pending_payment') return null;
    return booking;
  }
}
