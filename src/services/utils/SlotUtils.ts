import { OpeningHours } from '../constants/opening-hours.constants.js';
import type {
  Slot,
  SlotGenerationInput,
} from '../interfaces/slot.interface.js';
import { TimeZoneUtils } from './TimeZoneUtils.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export class SlotUtils {
  static generate(input: SlotGenerationInput): Slot[] {
    const earliest =
      input.now.getTime() + OpeningHours.MIN_LEAD_MINUTES * MINUTE_MS;
    const slots: Slot[] = [];
    for (const day of this.calendarDays(input.from, input.to)) {
      if (!this.isOpenDay(day)) continue;
      slots.push(...this.daySlots(day, input, earliest));
    }
    return slots;
  }

  static defaultRange(now: Date): { from: Date; to: Date } {
    const from = new Date(now);
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from.getTime() + OpeningHours.HORIZON_DAYS * DAY_MS);
    return { from, to };
  }

  private static calendarDays(from: Date, to: Date): Date[] {
    const days: Date[] = [];
    const cursor = new Date(from);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor.getTime() <= to.getTime()) {
      days.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }

  private static isOpenDay(day: Date): boolean {
    return OpeningHours.OPEN_WEEKDAYS.includes(day.getUTCDay());
  }

  private static daySlots(
    day: Date,
    input: SlotGenerationInput,
    earliest: number,
  ): Slot[] {
    const open = this.wallClock(day, OpeningHours.OPEN_HOUR);
    const close = this.wallClock(day, OpeningHours.CLOSE_HOUR);
    const step = input.durationMin * MINUTE_MS;
    const slots: Slot[] = [];
    for (let start = open; start + step <= close; start += step) {
      if (start < earliest) continue;
      if (start < input.from.getTime() || start > input.to.getTime()) continue;
      if (input.takenStarts.has(start)) continue;
      slots.push({ startsAt: new Date(start), endsAt: new Date(start + step) });
    }
    return slots;
  }

  private static wallClock(day: Date, hour: number): number {
    return TimeZoneUtils.zonedToUtc(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      hour,
      OpeningHours.TIME_ZONE,
    ).getTime();
  }
}
