import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import type { Prisma } from '@/generated/prisma/client.js';
import type { SeedServiceSpec } from '../constants/seed-services.constants.js';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertService(spec: SeedServiceSpec): Promise<void> {
    await this.prisma.service.upsert({
      where: { slug: spec.slug },
      update: spec,
      create: spec,
    });
  }

  async expireStalePending(olderThan: Date): Promise<number> {
    const result = await this.prisma.booking.updateMany({
      where: { status: 'pending_payment', createdAt: { lt: olderThan } },
      data: { status: 'expired' },
    });
    return result.count;
  }

  async deleteVisitorBookings(): Promise<number> {
    const result = await this.prisma.booking.deleteMany({
      where: { isSeed: false },
    });
    return result.count;
  }

  async deleteSeedBookings(): Promise<void> {
    await this.prisma.booking.deleteMany({ where: { isSeed: true } });
  }

  async deleteOldStripeEvents(olderThan: Date): Promise<void> {
    await this.prisma.stripeEvent.deleteMany({
      where: { receivedAt: { lt: olderThan } },
    });
  }

  countSeedBookings(): Promise<number> {
    return this.prisma.booking.count({ where: { isSeed: true } });
  }

  findServiceIdsBySlug(): Promise<
    { id: string; slug: string; durationMin: number }[]
  > {
    return this.prisma.service.findMany({
      select: { id: true, slug: true, durationMin: true },
    });
  }

  async createSeedBookings(
    data: Prisma.BookingCreateManyInput[],
  ): Promise<void> {
    await this.prisma.booking.createMany({ data, skipDuplicates: true });
  }
}
