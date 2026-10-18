export class BookingUrls {
  static confirmed(appUrl: string, token: string): string {
    return `${appUrl}/booking/confirmed?token=${token}`;
  }

  static cancelled(appUrl: string, token: string): string {
    return `${appUrl}/booking/cancelled?token=${token}`;
  }

  static manage(appUrl: string, token: string): string {
    return `${appUrl}/booking/manage/${token}`;
  }
}
