import { createElement } from 'react';
import { render } from 'react-email';
import type { EmailKind } from '@/generated/prisma/client.js';
import { EmailConstants } from '../constants/email.constants.js';
import { CalendarUtils, type CalendarEvent } from '../utils/CalendarUtils.js';
import type {
  BookingEmailContext,
  EmailAttachment,
  EmailContent,
} from '../interfaces/email.interface.js';
import BookingEmail, { type BookingEmailProps } from './BookingEmail.js';

const SUBJECT: Record<EmailKind, (service: string, when: string) => string> = {
  confirmation: (service, when) => `Confirmed: ${service}, ${when}`,
  reschedule: (service, when) => `Rescheduled: ${service}, now ${when}`,
  cancellation: (service, when) => `Cancelled: ${service} on ${when}`,
};

const MINUTE_MS = 60 * 1000;

export class BookingEmailTemplates {
  static async render(
    kind: EmailKind,
    context: BookingEmailContext,
  ): Promise<EmailContent> {
    const props = this.props(kind, context);
    const element = createElement(BookingEmail, props);
    return {
      subject: SUBJECT[kind](
        context.serviceName,
        this.formatDate(context.startsAt),
      ),
      html: await render(element),
      text: await render(element, { plainText: true }),
      attachments: kind === 'cancellation' ? [] : [this.icsAttachment(context)],
    };
  }

  static formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: EmailConstants.DISPLAY_TIME_ZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  static formatPrice(priceCents: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(priceCents / 100);
  }

  static enquiryUrl(reference: string): string {
    const body = [
      'Hi Hamza,',
      '',
      `I just tried your booking demo (ref ${reference}). I'm interested in something similar for my business.`,
      '',
      'What I need:',
      'Timeline:',
      '',
      'Thanks,',
    ].join('\r\n');
    const query = `subject=${encodeURIComponent(EmailConstants.ENQUIRY_SUBJECT)}&body=${encodeURIComponent(body)}`;
    return `mailto:${EmailConstants.OWNER_EMAIL}?${query}`;
  }

  private static props(
    kind: EmailKind,
    context: BookingEmailContext,
  ): BookingEmailProps {
    const reference = context.bookingId.slice(0, 8);
    const when = this.formatDate(context.startsAt);
    return {
      kind,
      preview: this.preview(kind, reference, when),
      firstName: context.customerName.trim().split(/\s+/)[0],
      serviceName: context.serviceName,
      when: `${when} (${EmailConstants.DISPLAY_TIME_ZONE_LABEL})`,
      duration: `${Math.round((context.endsAt.getTime() - context.startsAt.getTime()) / MINUTE_MS)} min`,
      price: this.formatPrice(context.priceCents, context.currency),
      reference,
      manageUrl: context.manageUrl,
      bookUrl: context.bookUrl,
      calendarUrl: CalendarUtils.googleUrl(this.calendarEvent(context)),
      enquiryUrl: this.enquiryUrl(reference),
      ownerEmail: EmailConstants.OWNER_EMAIL,
      ownerSiteUrl: EmailConstants.OWNER_SITE_URL,
      demosUrl: EmailConstants.DEMOS_URL,
    };
  }

  private static preview(
    kind: EmailKind,
    reference: string,
    when: string,
  ): string {
    if (kind === 'cancellation')
      return `Booking ${reference} is cancelled. The slot is free again.`;
    if (kind === 'reschedule')
      return `Booking ${reference} now starts ${when}. Update your calendar below.`;
    return `Booking ${reference} is confirmed. Add it to your calendar or manage it below.`;
  }

  private static calendarEvent(context: BookingEmailContext): CalendarEvent {
    return {
      uid: `${context.bookingId}@hamzaeshoul.com`,
      title: `${context.serviceName} (demo booking)`,
      description: `Reschedule or cancel: ${context.manageUrl}`,
      startsAt: context.startsAt,
      endsAt: context.endsAt,
    };
  }

  private static icsAttachment(context: BookingEmailContext): EmailAttachment {
    return {
      filename: 'booking.ics',
      content: CalendarUtils.ics(this.calendarEvent(context)),
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
    };
  }
}
