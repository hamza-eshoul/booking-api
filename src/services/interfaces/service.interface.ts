import type { Prisma } from '@/generated/prisma/client.js';

export const serviceSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  durationMin: true,
  priceCents: true,
  currency: true,
} satisfies Prisma.ServiceSelect;

export type ServiceRow = Prisma.ServiceGetPayload<{
  select: typeof serviceSelect;
}>;
