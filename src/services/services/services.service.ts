import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../repositories/services.repository.js';
import type { ServiceRow } from '../interfaces/service.interface.js';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  getServices(): Promise<ServiceRow[]> {
    return this.servicesRepository.findAll();
  }

  async getService(id: string): Promise<ServiceRow> {
    const service = await this.servicesRepository.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
