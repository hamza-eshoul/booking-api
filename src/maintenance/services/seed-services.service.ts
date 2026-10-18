import { Injectable } from '@nestjs/common';
import { MaintenanceRepository } from '../repositories/maintenance.repository.js';
import { SeedServices } from '../constants/seed-services.constants.js';

@Injectable()
export class SeedServicesService {
  constructor(private readonly repository: MaintenanceRepository) {}

  async ensure(): Promise<void> {
    for (const spec of SeedServices.SPECS)
      await this.repository.upsertService(spec);
  }
}
