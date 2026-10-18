import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@/common/config/env.config.js';
import { BookingEmailsService } from '@/emails/services/booking-emails.service.js';
import { ServicesService } from '@/services/services/services.service.js';
import { SlotsService } from '@/services/services/slots.service.js';
import { StripeCheckoutService } from '@/stripe/services/stripe-checkout.service.js';
import { BookingsRepository } from '../repositories/bookings.repository.js';
import { BookingMapper } from '../mappers/BookingMapper.js';
import { ManageTokenUtils } from '../utils/ManageTokenUtils.js';
import { BookingUrls } from '../constants/booking-urls.constants.js';
import { BookingEmailContextMapper } from '../mappers/BookingEmailContextMapper.js';
import type { CreateBookingDto } from '../dto/create-booking.dto.js';
import type { RescheduleBookingDto } from '../dto/reschedule-booking.dto.js';
import type { BookingRow } from '../interfaces/booking.interface.js';

@Injectable()
export class BookingsService {
  private readonly appUrl: string;

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly servicesService: ServicesService,
    private readonly slotsService: SlotsService,
    private readonly stripeCheckout: StripeCheckoutService,
    private readonly bookingEmails: BookingEmailsService,
    config: ConfigService<EnvConfig, true>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true });
  }

  async getByToken(token: string) {
    return BookingMapper.toResponse(await this.findByToken(token));
  }

  async create(dto: CreateBookingDto) {
    const service = await this.servicesService.getService(dto.serviceId);
    const startsAt = new Date(dto.startsAt);
    const slot = await this.findOpenSlot(service.id, startsAt);
    const token = ManageTokenUtils.generate();
    const booking = await this.bookingsRepository.create({
      serviceId: service.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      manageTokenHash: ManageTokenUtils.hash(token),
    });
    const session = await this.stripeCheckout.createSession({
      bookingId: booking.id,
      manageToken: token,
      serviceName: service.name,
      serviceDescription: service.description,
      priceCents: service.priceCents,
      currency: service.currency,
      customerEmail: dto.customerEmail,
      successUrl: BookingUrls.confirmed(this.appUrl, token),
      cancelUrl: BookingUrls.cancelled(this.appUrl, token),
    });
    await this.bookingsRepository.setStripeSession(booking.id, session.id);
    return { bookingId: booking.id, token, checkoutUrl: session.url };
  }

  async reschedule(token: string, dto: RescheduleBookingDto) {
    const booking = await this.findByToken(token);
    if (booking.status !== 'confirmed')
      throw new ConflictException('Only a confirmed booking can be moved');
    const slot = await this.findOpenSlot(
      booking.service.id,
      new Date(dto.startsAt),
    );
    const moved = await this.bookingsRepository.reschedule(
      booking.id,
      slot.startsAt,
      slot.endsAt,
    );
    await this.sendEmail('reschedule', moved, token);
    return this.getByToken(token);
  }

  async cancel(token: string) {
    const booking = await this.findByToken(token);
    if (booking.status === 'cancelled' || booking.status === 'expired')
      return BookingMapper.toResponse(booking);
    const wasConfirmed = booking.status === 'confirmed';
    const cancelled = await this.bookingsRepository.cancel(booking.id);
    if (wasConfirmed) await this.sendEmail('cancellation', cancelled, token);
    return this.getByToken(token);
  }

  private async findByToken(token: string): Promise<BookingRow> {
    const booking = await this.bookingsRepository.findByTokenHash(
      ManageTokenUtils.hash(token),
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private sendEmail(
    kind: 'reschedule' | 'cancellation',
    booking: BookingRow,
    token: string,
  ): Promise<void> {
    return this.bookingEmails.send({
      kind,
      context: BookingEmailContextMapper.fromRow(
        booking,
        BookingUrls.manage(this.appUrl, token),
      ),
    });
  }

  private async findOpenSlot(serviceId: string, startsAt: Date) {
    const slots = await this.slotsService.getSlots(serviceId, {
      from: startsAt.toISOString(),
      to: startsAt.toISOString(),
    });
    const slot = slots.find(
      (candidate) => candidate.startsAt.getTime() === startsAt.getTime(),
    );
    if (!slot) throw new BadRequestException('This slot is not available');
    return slot;
  }
}
