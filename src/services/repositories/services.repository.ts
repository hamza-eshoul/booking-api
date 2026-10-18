import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import {
  serviceSelect,
  type ServiceRow,
} from '../interfaces/service.interface.js';

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ServiceRow[]> {
    return this.prisma.service.findMany({
      select: serviceSelect,
      orderBy: { priceCents: 'asc' },
    });
  }

  findById(id: string): Promise<ServiceRow | null> {
    return this.prisma.service.findUnique({
      where: { id },
      select: serviceSelect,
    });
  }
}
