import { Module } from '@nestjs/common';
import { EmailSenderService } from './services/email-sender.service.js';
import { BookingEmailsService } from './services/booking-emails.service.js';
import { EmailLogRepository } from './repositories/email-log.repository.js';

@Module({
  providers: [EmailSenderService, BookingEmailsService, EmailLogRepository],
  exports: [BookingEmailsService],
})
export class EmailsModule {}
