import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { OpeningHours } from '@/services/constants/opening-hours.constants.js';
import { TimeZoneUtils } from '@/services/utils/TimeZoneUtils.js';
import { ManageTokenUtils } from '@/bookings/utils/ManageTokenUtils.js';
import { MaintenanceRepository } from '../repositories/maintenance.repository.js';
import { SeedBookings } from '../constants/seed-bookings.constants.js';
import { SeedServicesService } from './seed-services.service.js';
import type { Prisma } from '@/generated/prisma/client.js';

const MINUTE_MS = 60 * 1000;

@Injectable()
export class SeedBookingsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedBookingsService.name);

  constructor(
    private readonly repository: MaintenanceRepository,
    private readonly seedServices: SeedServicesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedServices.ensure();
    if ((await this.repository.countSeedBookings()) > 0) return;
    await this.reseed();
  }

  async reseed(): Promise<void> {
    await this.repository.deleteSeedBookings();
    const services = await this.repository.findServiceIdsBySlug();
    const rows = SeedBookings.SPECS.flatMap((spec) => {
      const service = services.find((entry) => entry.slug === spec.serviceSlug);
      if (!service) return [];
      const startsAt = this.nextWeekdayAt(spec.dayOffset, spec.hour);
      const row: Prisma.BookingCreateManyInput = {
        serviceId: service.id,
        startsAt,
        endsAt: new Date(startsAt.getTime() + service.durationMin * MINUTE_MS),
        customerName: spec.customerName,
        customerEmail: spec.customerEmail,
        status: 'confirmed',
        confirmedAt: new Date(),
        stripePaymentIntentId: `pi_seed_${randomUUID().slice(0, 8)}`,
        manageTokenHash: ManageTokenUtils.hash(ManageTokenUtils.generate()),
        isSeed: true,
      };
      return [row];
    });
    await this.repository.createSeedBookings(rows);
    this.logger.log(`Seeded ${rows.length} example bookings`);
  }

  private nextWeekdayAt(dayOffset: number, hour: number): Date {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() + dayOffset);
    while (!OpeningHours.OPEN_WEEKDAYS.includes(day.getUTCDay()))
      day.setUTCDate(day.getUTCDate() + 1);
    return TimeZoneUtils.zonedToUtc(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      hour,
      OpeningHours.TIME_ZONE,
    );
  }
}
