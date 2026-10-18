import type { Prisma } from '@/generated/prisma/client.js';

export const adminBookingSelect = {
  id: true,
  startsAt: true,
  endsAt: true,
  customerName: true,
  customerEmail: true,
  status: true,
  isSeed: true,
  createdAt: true,
  service: {
    select: { id: true, name: true, priceCents: true, currency: true },
  },
  emails: { select: { kind: true, status: true, createdAt: true } },
} satisfies Prisma.BookingSelect;

export type AdminBookingRow = Prisma.BookingGetPayload<{
  select: typeof adminBookingSelect;
}>;

export interface StatusCount {
  status: string;
  count: number;
}

export interface AdminSummary {
  revenueCents: number;
  currency: string;
  confirmed: number;
  pending: number;
  cancelled: number;
  expired: number;
  upcoming: number;
}
