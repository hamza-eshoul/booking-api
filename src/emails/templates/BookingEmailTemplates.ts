import type { EmailKind } from '@/generated/prisma/client.js';
import { EmailConstants } from '../constants/email.constants.js';
import type {
  BookingEmailContext,
  EmailContent,
} from '../interfaces/email.interface.js';

type Template = (context: BookingEmailContext) => EmailContent;

const TEMPLATE_BY_KIND: Record<EmailKind, Template> = {
  confirmation: (context) => ({
    subject: `Booking confirmed: ${context.serviceName} on ${BookingEmailTemplates.formatDate(context.startsAt)}`,
    html: BookingEmailTemplates.layout(
      'Your booking is confirmed',
      `Hi ${BookingEmailTemplates.escape(context.customerName)}, thanks for booking. Here are the details.`,
      context,
    ),
  }),
  reschedule: (context) => ({
    subject: `Booking moved: ${context.serviceName} now on ${BookingEmailTemplates.formatDate(context.startsAt)}`,
    html: BookingEmailTemplates.layout(
      'Your booking has moved',
      `Hi ${BookingEmailTemplates.escape(context.customerName)}, your booking now has a new time.`,
      context,
    ),
  }),
  cancellation: (context) => ({
    subject: `Booking cancelled: ${context.serviceName} on ${BookingEmailTemplates.formatDate(context.startsAt)}`,
    html: BookingEmailTemplates.layout(
      'Your booking is cancelled',
      `Hi ${BookingEmailTemplates.escape(context.customerName)}, this booking has been cancelled. No further action is needed.`,
      context,
    ),
  }),
};

export class BookingEmailTemplates {
  static render(kind: EmailKind, context: BookingEmailContext): EmailContent {
    return TEMPLATE_BY_KIND[kind](context);
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

  static escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  static layout(
    title: string,
    intro: string,
    context: BookingEmailContext,
  ): string {
    const rows = [
      ['Service', this.escape(context.serviceName)],
      ['When', `${this.formatDate(context.startsAt)} (Paris time)`],
      ['Price', this.formatPrice(context.priceCents, context.currency)],
      ['Reference', context.bookingId.slice(0, 8)],
    ]
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#6b7280">${label}</td><td style="padding:6px 0">${value}</td></tr>`,
      )
      .join('');
    return `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f7f9;font-family:Helvetica,Arial,sans-serif;color:#111827">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
<h1 style="margin:0 0 12px;font-size:20px">${title}</h1>
<p style="margin:0 0 20px;line-height:1.5">${intro}</p>
<table style="border-collapse:collapse;font-size:14px">${rows}</table>
<p style="margin:24px 0 0;line-height:1.5"><a href="${context.manageUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none">Reschedule or cancel</a></p>
<p style="margin:24px 0 0;font-size:12px;color:#6b7280">This is a demo booking. No real money moved and no real appointment exists.</p>
</div></body></html>`;
  }
}
