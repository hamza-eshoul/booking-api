import type { BookingRow } from '../interfaces/booking.interface.js';

export class BookingMapper {
  static toResponse(row: BookingRow) {
    const { stripeSessionId, ...booking } = row;
    return { ...booking, hasCheckout: stripeSessionId !== null };
  }
}
