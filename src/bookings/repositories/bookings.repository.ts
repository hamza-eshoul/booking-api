import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import {
  bookingSelect,
  type BookingRow,
  type CreateBookingInput,
} from '../interfaces/booking.interface.js';
import type { BookingStatusRow } from '../interfaces/booking-status.interface.js';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTokenHash(manageTokenHash: string): Promise<BookingRow | null> {
    return this.prisma.booking.findUnique({
      where: { manageTokenHash },
      select: bookingSelect,
    });
  }

  findStatus(id: string): Promise<BookingStatusRow | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  }

  create(input: CreateBookingInput): Promise<BookingRow> {
    return this.prisma.booking.create({ data: input, select: bookingSelect });
  }

  setStripeSession(id: string, stripeSessionId: string): Promise<BookingRow> {
    return this.prisma.booking.update({
      where: { id },
      data: { stripeSessionId },
      select: bookingSelect,
    });
  }

  confirm(
    id: string,
    stripePaymentIntentId: string | null,
  ): Promise<BookingRow> {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        stripePaymentIntentId,
      },
      select: bookingSelect,
    });
  }

  expire(id: string): Promise<BookingRow> {
    return this.prisma.booking.update({
      where: { id },
      data: { status: 'expired' },
      select: bookingSelect,
    });
  }
}
