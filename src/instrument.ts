import * as Sentry from '@sentry/nestjs';
import type { ErrorEvent } from '@sentry/nestjs';

const MANAGE_TOKEN_PATTERN = /\/manage\/[^/?#]+/g;

const scrub = (event: ErrorEvent): ErrorEvent => {
  if (!event.request) return event;
  delete event.request.data;
  delete event.request.cookies;
  event.request.url = event.request.url?.replace(
    MANAGE_TOKEN_PATTERN,
    '/manage/[token]',
  );
  if (event.transaction)
    event.transaction = event.transaction.replace(
      MANAGE_TOKEN_PATTERN,
      '/manage/[token]',
    );
  return event;
};

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.SENTRY_ENVIRONMENT ?? 'production',
  tracesSampleRate: 0,
  beforeSend: scrub,
});
