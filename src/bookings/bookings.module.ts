import { Module } from '@nestjs/common';
import { ServicesModule } from '@/services/services.module.js';
import { StripeModule } from '@/stripe/stripe.module.js';
import { BookingsController } from './controllers/bookings.controller.js';
import { BookingsService } from './services/bookings.service.js';
import { BookingsRepository } from './repositories/bookings.repository.js';

@Module({
  imports: [ServicesModule, StripeModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService],
})
export class BookingsModule {}
