# booking-api

Backend for the booking demo at https://demos.hamzaeshoul.com/booking. NestJS 12, Prisma 7, Postgres, Stripe Checkout (test mode), Resend.

## Run locally

```bash
cp .env.example .env
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Needs Node 24 and a local Postgres (`createdb booking`).

## Checks

```bash
npm run check-types
npm run lint
npm test
```
