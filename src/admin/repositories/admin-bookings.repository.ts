import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import {
  adminBookingSelect,
  type AdminBookingRow,
  type StatusCount,
} from '../interfaces/admin-booking.interface.js';

@Injectable()
export class AdminBookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRecent(limit: number): Promise<AdminBookingRow[]> {
    return this.prisma.booking.findMany({
      select: adminBookingSelect,
      orderBy: { startsAt: 'asc' },
      take: limit,
    });
  }

  async countByStatus(): Promise<StatusCount[]> {
    const groups = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return groups.map((group) => ({
      status: group.status,
      count: group._count._all,
    }));
  }

  async sumConfirmedRevenue(): Promise<number> {
    const rows = await this.prisma.booking.findMany({
      where: { status: 'confirmed' },
      select: { service: { select: { priceCents: true } } },
    });
    return rows.reduce((total, row) => total + row.service.priceCents, 0);
  }

  countUpcoming(now: Date): Promise<number> {
    return this.prisma.booking.count({
      where: { status: 'confirmed', startsAt: { gte: now } },
    });
  }
}
