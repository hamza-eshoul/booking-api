import { Injectable } from '@nestjs/common';
import { AdminBookingsRepository } from '../repositories/admin-bookings.repository.js';
import type {
  AdminBookingRow,
  AdminSummary,
} from '../interfaces/admin-booking.interface.js';

const RECENT_LIMIT = 200;

@Injectable()
export class AdminBookingsService {
  constructor(private readonly repository: AdminBookingsRepository) {}

  getBookings(): Promise<AdminBookingRow[]> {
    return this.repository.findRecent(RECENT_LIMIT);
  }

  async getSummary(): Promise<AdminSummary> {
    const [revenueCents, counts, upcoming] = await Promise.all([
      this.repository.sumConfirmedRevenue(),
      this.repository.countByStatus(),
      this.repository.countUpcoming(new Date()),
    ]);
    const count = (status: string) =>
      counts.find((entry) => entry.status === status)?.count ?? 0;
    return {
      revenueCents,
      currency: 'eur',
      confirmed: count('confirmed'),
      pending: count('pending_payment'),
      cancelled: count('cancelled'),
      expired: count('expired'),
      upcoming,
    };
  }
}
