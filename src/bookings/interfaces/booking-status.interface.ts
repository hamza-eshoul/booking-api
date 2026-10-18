import type { BookingStatus } from '@/generated/prisma/client.js';

export interface BookingStatusRow {
  id: string;
  status: BookingStatus;
}
