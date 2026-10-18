import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@/common/config/env.config.js';
import { ServicesService } from '@/services/services/services.service.js';
import { SlotsService } from '@/services/services/slots.service.js';
import { StripeCheckoutService } from '@/stripe/services/stripe-checkout.service.js';
import { BookingsRepository } from '../repositories/bookings.repository.js';
import { BookingMapper } from '../mappers/BookingMapper.js';
import { ManageTokenUtils } from '../utils/ManageTokenUtils.js';
import { BookingUrls } from '../constants/booking-urls.constants.js';
import type { CreateBookingDto } from '../dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  private readonly appUrl: string;

  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly servicesService: ServicesService,
    private readonly slotsService: SlotsService,
    private readonly stripeCheckout: StripeCheckoutService,
    config: ConfigService<EnvConfig, true>,
  ) {
    this.appUrl = config.get('APP_URL', { infer: true });
  }

  async getByToken(token: string) {
    const booking = await this.bookingsRepository.findByTokenHash(
      ManageTokenUtils.hash(token),
    );
    if (!booking) throw new NotFoundException('Booking not found');
    return BookingMapper.toResponse(booking);
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
