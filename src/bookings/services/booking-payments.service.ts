import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Stripe from 'stripe';
import type { EnvConfig } from '@/common/config/env.config.js';
import { BookingEmailsService } from '@/emails/services/booking-emails.service.js';
import { StripeWebhookService } from '@/stripe/services/stripe-webhook.service.js';
import { BookingsRepository } from '../repositories/bookings.repository.js';
import { StripeEventsRepository } from '../repositories/stripe-events.repository.js';
import { BookingEmailContextMapper } from '../mappers/BookingEmailContextMapper.js';
import { BookingUrls } from '../constants/booking-urls.constants.js';

type Handler = (session: Stripe.Checkout.Session) => Promise<void>;

@Injectable()
export class BookingPaymentsService {
  private readonly logger = new Logger(BookingPaymentsService.name);
  private readonly handlerByType: Record<string, Handler> = {
    'checkout.session.completed': (session) => this.confirm(session),
    'checkout.session.expired': (session) => this.expire(session),
  };

  private readonly appUrl: string;

  constructor(
    private readonly stripeWebhook: StripeWebhookService,
    private readonly bookingsRepository: BookingsRepository,
    private readonly stripeEventsRepository: StripeEventsRepository,
    private readonly bookingEmails: BookingEmailsService,
    config: ConfigService<EnvConfig, true>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true });
  }

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
    const manageToken = session.metadata?.manageToken;
    if (!booking || !manageToken) return;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);
    const confirmed = await this.bookingsRepository.confirm(
      booking.id,
      paymentIntentId,
    );
    await this.bookingEmails.send({
      kind: 'confirmation',
      context: BookingEmailContextMapper.fromRow(
        confirmed,
        BookingUrls.manage(this.appUrl, manageToken),
      ),
    });
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
