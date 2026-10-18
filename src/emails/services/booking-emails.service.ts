import { Injectable, Logger } from '@nestjs/common';
import type { EmailStatus } from '@/generated/prisma/client.js';
import { EmailConstants } from '../constants/email.constants.js';
import { EmailLogRepository } from '../repositories/email-log.repository.js';
import { BookingEmailTemplates } from '../templates/BookingEmailTemplates.js';
import { EmailSenderService } from './email-sender.service.js';
import type { SendBookingEmailInput } from '../interfaces/email.interface.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingEmailsService {
  private readonly logger = new Logger(BookingEmailsService.name);

  constructor(
    private readonly emailLogRepository: EmailLogRepository,
    private readonly emailSender: EmailSenderService,
  ) {}

  async send(input: SendBookingEmailInput): Promise<void> {
    const content = BookingEmailTemplates.render(input.kind, input.context);
    const status = await this.deliver(input.context.customerEmail, content);
    await this.emailLogRepository.create({
      bookingId: input.context.bookingId,
      kind: input.kind,
      to: input.context.customerEmail,
      subject: content.subject,
      html: content.html,
      resendId: status.resendId,
      status: status.status,
    });
  }

  private async deliver(
    to: string,
    content: { subject: string; html: string },
  ): Promise<{ status: EmailStatus; resendId: string | null }> {
    const sentToday = await this.emailLogRepository.countSince(
      new Date(Date.now() - DAY_MS),
    );
    if (sentToday >= EmailConstants.DAILY_CAP)
      return { status: 'skipped_cap', resendId: null };
    try {
      const result = await this.emailSender.send(to, content);
      if (result.error) return { status: 'failed', resendId: null };
      return { status: 'sent', resendId: result.id };
    } catch (error) {
      this.logger.error(`Email to ${to} failed: ${String(error)}`);
      return { status: 'failed', resendId: null };
    }
  }
}
