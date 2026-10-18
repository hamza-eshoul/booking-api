import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '@/app.module.js';
import { PrismaExceptionFilter } from '@/common/filters/prisma-exception.filter.js';
import { PrismaService } from '@/common/prisma/prisma.service.js';
import { StripeCheckoutService } from '@/stripe/services/stripe-checkout.service.js';

export const FAKE_CHECKOUT = {
  id: 'cs_test_fake',
  url: 'https://checkout.stripe.com/c/pay/cs_test_fake',
};

export const createTestApp = async (): Promise<INestApplication> => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(StripeCheckoutService)
    .useValue({ createSession: async () => FAKE_CHECKOUT })
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    rawBody: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());
  await app.init();
  return app;
};

export const resetDatabase = async (app: INestApplication): Promise<void> => {
  const prisma = app.get(PrismaService);
  await prisma.emailLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.stripeEvent.deleteMany();
};
