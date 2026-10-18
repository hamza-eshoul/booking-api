import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';

@Injectable()
export class StripeEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isProcessed(id: string): Promise<boolean> {
    const event = await this.prisma.stripeEvent.findUnique({
      where: { id },
      select: { processedAt: true },
    });
    return event?.processedAt !== null && event?.processedAt !== undefined;
  }

  async record(id: string, type: string): Promise<void> {
    await this.prisma.stripeEvent.upsert({
      where: { id },
      create: { id, type },
      update: {},
    });
  }

  async markProcessed(id: string): Promise<void> {
    await this.prisma.stripeEvent.update({
      where: { id },
      data: { processedAt: new Date() },
    });
  }
}
