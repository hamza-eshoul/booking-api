import { SlotUtils } from './SlotUtils.js';

const monday = new Date('2026-11-02T00:00:00.000Z');
const sunday = new Date('2026-11-01T00:00:00.000Z');
const earlyMorning = new Date('2026-11-01T06:00:00.000Z');

describe('SlotUtils.generate', () => {
  it('fills a weekday from 09:00 to 17:00 Paris time in service-length steps', () => {
    const slots = SlotUtils.generate({
      durationMin: 60,
      from: monday,
      to: new Date('2026-11-02T23:59:59.000Z'),
      now: earlyMorning,
      takenStarts: new Set(),
    });
    expect(slots).toHaveLength(8);
    expect(slots[0].startsAt.toISOString()).toBe('2026-11-02T08:00:00.000Z');
    expect(slots[7].endsAt.toISOString()).toBe('2026-11-02T16:00:00.000Z');
  });

  it('skips weekends', () => {
    const slots = SlotUtils.generate({
      durationMin: 30,
      from: sunday,
      to: new Date('2026-11-01T23:59:59.000Z'),
      now: earlyMorning,
      takenStarts: new Set(),
    });
    expect(slots).toHaveLength(0);
  });

  it('removes taken slots and slots too close to now', () => {
    const taken = new Date('2026-11-02T10:00:00.000Z').getTime();
    const slots = SlotUtils.generate({
      durationMin: 60,
      from: monday,
      to: new Date('2026-11-02T23:59:59.000Z'),
      now: new Date('2026-11-02T08:30:00.000Z'),
      takenStarts: new Set([taken]),
    });
    const starts = slots.map((slot) => slot.startsAt.toISOString());
    expect(starts).not.toContain('2026-11-02T08:00:00.000Z');
    expect(starts).not.toContain('2026-11-02T09:00:00.000Z');
    expect(starts).not.toContain('2026-11-02T10:00:00.000Z');
    expect(starts[0]).toBe('2026-11-02T11:00:00.000Z');
  });
});

describe('SlotUtils.clampRange', () => {
  const now = new Date('2026-11-02T10:00:00.000Z');

  it('keeps any request inside today and the booking horizon', () => {
    const range = SlotUtils.clampRange(now, {
      from: new Date('1970-01-01T00:00:00.000Z'),
      to: new Date('9999-12-31T00:00:00.000Z'),
    });
    expect(range.from.toISOString()).toBe('2026-11-02T00:00:00.000Z');
    expect(range.to.toISOString()).toBe('2026-11-16T00:00:00.000Z');
  });

  it('returns no slots for a start beyond the horizon', () => {
    const farFuture = new Date('2099-01-05T09:00:00.000Z');
    const range = SlotUtils.clampRange(now, { from: farFuture, to: farFuture });
    const slots = SlotUtils.generate({
      durationMin: 30,
      ...range,
      now,
      takenStarts: new Set(),
    });
    expect(slots).toHaveLength(0);
  });
});
