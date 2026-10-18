import Stripe from 'stripe';

const stripe = new Stripe('sk_test_placeholder');

export const signedWebhook = (
  type: string,
  sessionId: string,
  bookingId: string,
  eventId = `evt_${sessionId}_${type}`,
) => {
  const payload = JSON.stringify({
    id: eventId,
    object: 'event',
    type,
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        payment_intent: 'pi_test_123',
        metadata: { bookingId },
      },
    },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  });
  return { payload, signature };
};
