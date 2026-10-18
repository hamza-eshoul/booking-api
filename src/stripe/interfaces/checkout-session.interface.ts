export interface CreateCheckoutSessionInput {
  bookingId: string;
  manageToken: string;
  serviceName: string;
  serviceDescription: string;
  priceCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}
