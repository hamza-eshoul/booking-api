import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller.js';
import { AdminBookingsService } from './services/admin-bookings.service.js';
import { AdminBookingsRepository } from './repositories/admin-bookings.repository.js';

@Module({
  controllers: [AdminController],
  providers: [AdminBookingsService, AdminBookingsRepository],
})
export class AdminModule {}
