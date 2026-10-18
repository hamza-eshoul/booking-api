import { Injectable } from '@nestjs/common';
import { BookedSlotsRepository } from '../repositories/booked-slots.repository.js';
import { ServicesService } from './services.service.js';
import { SlotUtils } from '../utils/SlotUtils.js';
import type { Slot } from '../interfaces/slot.interface.js';
import type { GetSlotsQueryDto } from '../dto/get-slots-query.dto.js';

@Injectable()
export class SlotsService {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly bookedSlotsRepository: BookedSlotsRepository,
  ) {}

  async getSlots(serviceId: string, query: GetSlotsQueryDto): Promise<Slot[]> {
    const service = await this.servicesService.getService(serviceId);
    const now = new Date();
    const range = SlotUtils.defaultRange(now);
    const from = query.from ? new Date(query.from) : range.from;
    const to = query.to ? new Date(query.to) : range.to;
    const taken = await this.bookedSlotsRepository.findActiveStarts(
      serviceId,
      from,
      to,
    );
    return SlotUtils.generate({
      durationMin: service.durationMin,
      from,
      to,
      now,
      takenStarts: new Set(taken.map((date) => date.getTime())),
    });
  }
}
