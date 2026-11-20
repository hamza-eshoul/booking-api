import { CalendarUtils } from './CalendarUtils.js';

const event = {
  uid: 'abc@hamzaeshoul.com',
  title: 'Discovery call, demo booking',
  description: 'Manage; https://example.com/manage/x',
  startsAt: new Date('2026-11-23T09:00:00.000Z'),
  endsAt: new Date('2026-11-23T09:30:00.000Z'),
};

describe('CalendarUtils', () => {
  it('builds a Google Calendar link with UTC start and end', () => {
    const url = new URL(CalendarUtils.googleUrl(event));
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe(
      '20261123T090000Z/20261123T093000Z',
    );
  });

  it('builds a publish-only ics event with escaped text', () => {
    const ics = CalendarUtils.ics(event, new Date('2026-11-20T00:00:00.000Z'));
    expect(ics).toContain('METHOD:PUBLISH');
    expect(ics).toContain('DTSTART:20261123T090000Z');
    expect(ics).toContain('SUMMARY:Discovery call\\, demo booking');
    expect(ics).toContain('DESCRIPTION:Manage\\; https');
    expect(ics.split('\r\n')).toContain('END:VCALENDAR');
  });
});
