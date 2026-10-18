import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import { createTestApp, resetDatabase } from './app.factory.js';
import { signedWebhook } from './stripe.helpers.js';

let app: INestApplication;
let prisma: PrismaService;
let serviceId: string;

const firstSlot = async (): Promise<string> => {
  const response = await request(app.getHttpServer()).get(
    `/services/${serviceId}/slots`,
  );
  return response.body[0].startsAt;
};

const createBooking = async (startsAt: string) =>
  request(app.getHttpServer()).post('/bookings').send({
    serviceId,
    startsAt,
    customerName: 'Test Visitor',
    customerEmail: 'visitor@example.com',
  });

const postWebhook = (payload: string, signature: string) =>
  request(app.getHttpServer())
    .post('/stripe/webhook')
    .set('stripe-signature', signature)
    .set('content-type', 'application/json')
    .send(payload);

beforeAll(async () => {
  app = await createTestApp();
  prisma = app.get(PrismaService);
  const services = await prisma.service.findMany();
  serviceId = services[0].id;
});

beforeEach(() => resetDatabase(app));

afterAll(() => app.close());

describe('POST /bookings', () => {
  it('creates a pending booking and returns a checkout url', async () => {
    const startsAt = await firstSlot();
    const response = await createBooking(startsAt);
    expect(response.status).toBe(201);
    expect(response.body.checkoutUrl).toContain('checkout.stripe.com');
    const booking = await prisma.booking.findUnique({
      where: { id: response.body.bookingId },
    });
    expect(booking?.status).toBe('pending_payment');
  });

  it('refuses a slot that is already held', async () => {
    const startsAt = await firstSlot();
    await createBooking(startsAt);
    const response = await createBooking(startsAt);
    expect(response.status).toBe(400);
  });

  it('is blocked by the database when two bookings race for one slot', async () => {
    const startsAt = new Date(await firstSlot());
    const data = {
      serviceId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 30 * 60_000),
      customerName: 'A',
      customerEmail: 'a@example.com',
    };
    await prisma.booking.create({ data: { ...data, manageTokenHash: 'h1' } });
    await expect(
      prisma.booking.create({ data: { ...data, manageTokenHash: 'h2' } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});

describe('POST /stripe/webhook', () => {
  it('rejects a bad signature', async () => {
    const response = await postWebhook('{}', 't=1,v1=bad');
    expect(response.status).toBe(400);
    expect(await prisma.stripeEvent.count()).toBe(0);
  });

  it('confirms the booking on checkout.session.completed', async () => {
    const { body } = await createBooking(await firstSlot());
    const hook = signedWebhook(
      'checkout.session.completed',
      'cs_1',
      body.bookingId,
    );
    const response = await postWebhook(hook.payload, hook.signature);
    expect(response.status).toBe(200);
    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
    });
    expect(booking?.status).toBe('confirmed');
    expect(booking?.stripePaymentIntentId).toBe('pi_test_123');
  });

  it('handles the same event only once', async () => {
    const { body } = await createBooking(await firstSlot());
    const hook = signedWebhook(
      'checkout.session.completed',
      'cs_2',
      body.bookingId,
    );
    await postWebhook(hook.payload, hook.signature);
    const second = await postWebhook(hook.payload, hook.signature);
    expect(second.body.duplicate).toBe(true);
    expect(await prisma.stripeEvent.count()).toBe(1);
  });

  it('frees the slot on checkout.session.expired', async () => {
    const startsAt = await firstSlot();
    const { body } = await createBooking(startsAt);
    const hook = signedWebhook(
      'checkout.session.expired',
      'cs_3',
      body.bookingId,
    );
    await postWebhook(hook.payload, hook.signature);
    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
    });
    expect(booking?.status).toBe('expired');
    expect(await firstSlot()).toBe(startsAt);
  });
});
