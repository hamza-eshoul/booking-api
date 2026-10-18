const PART_TYPES = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
] as const;

export class TimeZoneUtils {
  static zonedToUtc(
    year: number,
    month: number,
    day: number,
    hour: number,
    timeZone: string,
  ): Date {
    const naive = new Date(Date.UTC(year, month - 1, day, hour));
    const offset = this.offsetMs(naive, timeZone);
    const guess = new Date(naive.getTime() - offset);
    const correction = this.offsetMs(guess, timeZone) - offset;
    return new Date(guess.getTime() - correction);
  }

  private static offsetMs(at: Date, timeZone: string): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = formatter.formatToParts(at);
    const [year, month, day, hour, minute, second] = PART_TYPES.map((type) =>
      Number(parts.find((part) => part.type === type)?.value),
    );
    const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    return asUtc - at.getTime();
  }
}
