import { Injectable } from '@nestjs/common';
import { AdminBookingsRepository } from '../repositories/admin-bookings.repository.js';
import { AdminBookingMapper } from '../mappers/AdminBookingMapper.js';
import type {
  AdminBookingRow,
  AdminSummary,
} from '../interfaces/admin-booking.interface.js';

const RECENT_LIMIT = 200;

@Injectable()
export class AdminBookingsService {
  constructor(private readonly repository: AdminBookingsRepository) {}

  async getBookings(): Promise<AdminBookingRow[]> {
    const rows = await this.repository.findRecent(RECENT_LIMIT);
    return rows.map((row) => AdminBookingMapper.toPublic(row));
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
