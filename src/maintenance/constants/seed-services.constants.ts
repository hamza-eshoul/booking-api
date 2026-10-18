export interface SeedServiceSpec {
  slug: string;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
}

export class SeedServices {
  static readonly SPECS: SeedServiceSpec[] = [
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
}
