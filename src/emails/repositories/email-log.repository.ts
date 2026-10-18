import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import type { Prisma } from '@/generated/prisma/client.js';

@Injectable()
export class EmailLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  countSince(since: Date): Promise<number> {
    return this.prisma.emailLog.count({ where: { createdAt: { gte: since } } });
  }

  async create(data: Prisma.EmailLogUncheckedCreateInput): Promise<void> {
    await this.prisma.emailLog.create({ data });
  }
}
