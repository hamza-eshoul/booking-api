import type { BookingEmailContext } from '@/emails/interfaces/email.interface.js';
import type { BookingRow } from '../interfaces/booking.interface.js';

export class BookingEmailContextMapper {
  static fromRow(row: BookingRow, manageUrl: string): BookingEmailContext {
    return {
      bookingId: row.id,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      serviceName: row.service.name,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      priceCents: row.service.priceCents,
      currency: row.service.currency,
      manageUrl,
    };
  }
}
