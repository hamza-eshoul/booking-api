export interface SeedBookingSpec {
  serviceSlug: string;
  dayOffset: number;
  hour: number;
  customerName: string;
  customerEmail: string;
}

export class SeedBookings {
  static readonly RESET_CRON = '0 3 * * *';
  static readonly RESET_TIME_ZONE = 'Africa/Casablanca';
  static readonly STALE_PENDING_MINUTES = 40;
  static readonly SPECS: SeedBookingSpec[] = [
    {
      serviceSlug: 'discovery-call',
      dayOffset: 1,
      hour: 9,
      customerName: 'Nora Haddad',
      customerEmail: 'nora@example.com',
    },
    {
      serviceSlug: 'consultation',
      dayOffset: 1,
      hour: 14,
      customerName: 'Louis Martin',
      customerEmail: 'louis@example.com',
    },
    {
      serviceSlug: 'discovery-call',
      dayOffset: 2,
      hour: 10,
      customerName: 'Amina Zerouali',
      customerEmail: 'amina@example.com',
    },
    {
      serviceSlug: 'workshop',
      dayOffset: 3,
      hour: 9,
      customerName: 'Studio Lumen',
      customerEmail: 'hello@lumen.example.com',
    },
    {
      serviceSlug: 'consultation',
      dayOffset: 4,
      hour: 11,
      customerName: 'Sofia Reyes',
      customerEmail: 'sofia@example.com',
    },
    {
      serviceSlug: 'discovery-call',
      dayOffset: 7,
      hour: 15,
      customerName: 'Yann Le Goff',
      customerEmail: 'yann@example.com',
    },
  ];
}
