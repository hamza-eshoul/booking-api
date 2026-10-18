import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { EnvConfig } from '@/common/config/env.config.js';
import type { EmailContent } from '../interfaces/email.interface.js';

export interface SendResult {
  id: string | null;
  error: string | null;
}

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(config: ConfigService<EnvConfig, true>) {
    this.resend = new Resend(config.get('RESEND_API_KEY', { infer: true }));
    this.from = config.get('EMAIL_FROM', { infer: true });
  }

  async send(to: string, content: EmailContent): Promise<SendResult> {
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: content.subject,
      html: content.html,
    });
    if (error) {
      this.logger.warn(`Resend refused email to ${to}: ${error.message}`);
      return { id: null, error: error.message };
    }
    return { id: data?.id ?? null, error: null };
  }
}
