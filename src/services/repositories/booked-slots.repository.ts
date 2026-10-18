import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';

@Injectable()
export class BookedSlotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveStarts(
    serviceId: string,
    from: Date,
    to: Date,
  ): Promise<Date[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        serviceId,
        status: { in: ['pending_payment', 'confirmed'] },
        startsAt: { gte: from, lte: to },
      },
      select: { startsAt: true },
    });
    return rows.map((row) => row.startsAt);
  }
}
