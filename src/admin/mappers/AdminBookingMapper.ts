import type { AdminBookingRow } from '../interfaces/admin-booking.interface.js';

export class AdminBookingMapper {
  static toPublic(row: AdminBookingRow): AdminBookingRow {
    if (row.isSeed) return row;
    return {
      ...row,
      customerName: this.shortName(row.customerName),
      customerEmail: this.maskEmail(row.customerEmail),
    };
  }

  static shortName(name: string): string {
    const [first, ...rest] = name.trim().split(/\s+/);
    const lastInitial = rest.at(-1)?.charAt(0);
    if (!lastInitial) return first;
    return `${first} ${lastInitial.toUpperCase()}.`;
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***';
    return `${local.charAt(0)}***@${domain}`;
  }
}
