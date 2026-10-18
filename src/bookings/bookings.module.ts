import { Module } from '@nestjs/common';
import { ServicesModule } from '@/services/services.module.js';
import { StripeModule } from '@/stripe/stripe.module.js';
import { EmailsModule } from '@/emails/emails.module.js';
import { BookingsController } from './controllers/bookings.controller.js';
import { StripeWebhookController } from './controllers/stripe-webhook.controller.js';
import { BookingsService } from './services/bookings.service.js';
import { BookingPaymentsService } from './services/booking-payments.service.js';
import { BookingsRepository } from './repositories/bookings.repository.js';
import { StripeEventsRepository } from './repositories/stripe-events.repository.js';

@Module({
  imports: [ServicesModule, StripeModule, EmailsModule],
  controllers: [BookingsController, StripeWebhookController],
  providers: [
    BookingsService,
    BookingPaymentsService,
    BookingsRepository,
    StripeEventsRepository,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
