import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const SERVICES = [
  {
    slug: 'discovery-call',
    name: 'Discovery call',
    description: 'A 30-minute call to talk through your project.',
    durationMin: 30,
    priceCents: 2500,
  },
  {
    slug: 'consultation',
    name: 'Consultation',
    description: 'One hour of focused advice on your product or stack.',
    durationMin: 60,
    priceCents: 8000,
  },
  {
    slug: 'workshop',
    name: 'Workshop',
    description: 'A two-hour hands-on session with your team.',
    durationMin: 120,
    priceCents: 18000,
  },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

for (const service of SERVICES) {
  await prisma.service.upsert({
    where: { slug: service.slug },
    update: service,
    create: service,
  });
}

await prisma.$disconnect();
