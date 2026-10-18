import {
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { BookingPaymentsService } from '../services/booking-payments.service.js';

@Controller('stripe')
export class StripeWebhookController {
  constructor(private readonly bookingPayments: BookingPaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
  @SkipThrottle()
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    return this.bookingPayments.handleWebhook(request.rawBody, signature);
  }
}
