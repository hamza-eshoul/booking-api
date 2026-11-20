import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import type { Prisma } from '@/generated/prisma/client.js';

@Injectable()
export class EmailLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  countSentSince(since: Date): Promise<number> {
    return this.prisma.emailLog.count({
      where: { status: 'sent', createdAt: { gte: since } },
    });
  }

  countSentForBooking(bookingId: string): Promise<number> {
    return this.prisma.emailLog.count({ where: { status: 'sent', bookingId } });
  }

  async create(data: Prisma.EmailLogUncheckedCreateInput): Promise<void> {
    await this.prisma.emailLog.create({ data });
  }
}
