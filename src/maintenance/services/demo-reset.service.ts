import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MaintenanceRepository } from '../repositories/maintenance.repository.js';
import { SeedBookingsService } from './seed-bookings.service.js';
import { SeedBookings } from '../constants/seed-bookings.constants.js';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

@Injectable()
export class DemoResetService {
  private readonly logger = new Logger(DemoResetService.name);

  constructor(
    private readonly repository: MaintenanceRepository,
    private readonly seedBookings: SeedBookingsService,
  ) {}

  @Cron('*/10 * * * *')
  async expireStalePending(): Promise<void> {
    const olderThan = new Date(
      Date.now() - SeedBookings.STALE_PENDING_MINUTES * MINUTE_MS,
    );
    const count = await this.repository.expireStalePending(olderThan);
    if (count > 0) this.logger.log(`Expired ${count} stale pending bookings`);
  }

  @Cron(SeedBookings.RESET_CRON, { timeZone: SeedBookings.RESET_TIME_ZONE })
  async nightlyReset(): Promise<void> {
    const deleted = await this.repository.deleteVisitorBookings();
    await this.repository.deleteOldStripeEvents(
      new Date(Date.now() - 7 * DAY_MS),
    );
    await this.seedBookings.reseed();
    this.logger.log(`Nightly reset: removed ${deleted} visitor bookings`);
  }
}
