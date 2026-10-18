import type { Prisma } from '@/generated/prisma/client.js';

export const bookingSelect = {
  id: true,
  startsAt: true,
  endsAt: true,
  customerName: true,
  customerEmail: true,
  status: true,
  stripeSessionId: true,
  createdAt: true,
  confirmedAt: true,
  cancelledAt: true,
  service: {
    select: {
      id: true,
      slug: true,
      name: true,
      durationMin: true,
      priceCents: true,
      currency: true,
    },
  },
  emails: {
    select: {
      id: true,
      kind: true,
      to: true,
      subject: true,
      html: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.BookingSelect;

export type BookingRow = Prisma.BookingGetPayload<{
  select: typeof bookingSelect;
}>;

export interface CreateBookingInput {
  serviceId: string;
  startsAt: Date;
  endsAt: Date;
  customerName: string;
  customerEmail: string;
  manageTokenHash: string;
}
