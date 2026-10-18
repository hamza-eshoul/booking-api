import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceRepository } from './repositories/maintenance.repository.js';
import { SeedServicesService } from './services/seed-services.service.js';
import { SeedBookingsService } from './services/seed-bookings.service.js';
import { DemoResetService } from './services/demo-reset.service.js';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    MaintenanceRepository,
    SeedServicesService,
    SeedBookingsService,
    DemoResetService,
  ],
})
export class MaintenanceModule {}
