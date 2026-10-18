import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BookingsService } from '../services/bookings.service.js';
import { CreateBookingDto } from '../dto/create-booking.dto.js';
import { RescheduleBookingDto } from '../dto/reschedule-booking.dto.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('manage/:token')
  getByToken(@Param('token') token: string) {
    return this.bookingsService.getByToken(token);
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Patch('manage/:token')
  reschedule(@Param('token') token: string, @Body() dto: RescheduleBookingDto) {
    return this.bookingsService.reschedule(token, dto);
  }

  @Delete('manage/:token')
  cancel(@Param('token') token: string) {
    return this.bookingsService.cancel(token);
  }
}
