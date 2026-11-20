export interface CalendarEvent {
  uid: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
}

export class CalendarUtils {
  static googleUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.utcStamp(event.startsAt)}/${this.utcStamp(event.endsAt)}`,
      details: event.description,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  static ics(event: CalendarEvent, now = new Date()): string {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hamza Eshoul//Booking demo//EN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.uid}`,
      `SEQUENCE:${Math.floor(now.getTime() / 1000)}`,
      `DTSTAMP:${this.utcStamp(now)}`,
      `DTSTART:${this.utcStamp(event.startsAt)}`,
      `DTEND:${this.utcStamp(event.endsAt)}`,
      `SUMMARY:${this.escapeText(event.title)}`,
      `DESCRIPTION:${this.escapeText(event.description)}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
  }

  private static utcStamp(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  private static escapeText(value: string): string {
    return value
      .replaceAll('\\', '\\\\')
      .replaceAll(';', '\\;')
      .replaceAll(',', '\\,')
      .replaceAll('\n', '\\n');
  }
}
