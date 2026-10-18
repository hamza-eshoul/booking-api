import { Controller, Get } from '@nestjs/common';
import { AdminBookingsService } from '../services/admin-bookings.service.js';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminBookings: AdminBookingsService) {}

  @Get('bookings')
  getBookings() {
    return this.adminBookings.getBookings();
  }

  @Get('summary')
  getSummary() {
    return this.adminBookings.getSummary();
  }
}
