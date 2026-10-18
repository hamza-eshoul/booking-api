import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import {
  bookingSelect,
  type BookingRow,
  type CreateBookingInput,
} from '../interfaces/booking.interface.js';

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTokenHash(manageTokenHash: string): Promise<BookingRow | null> {
    return this.prisma.booking.findUnique({
      where: { manageTokenHash },
      select: bookingSelect,
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
}
