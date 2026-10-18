import type { EmailKind } from '@/generated/prisma/client.js';

export interface BookingEmailContext {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  currency: string;
  manageUrl: string;
}

export interface EmailContent {
  subject: string;
  html: string;
}

export interface SendBookingEmailInput {
  kind: EmailKind;
  context: BookingEmailContext;
}
