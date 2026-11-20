import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';
import type { CSSProperties, ReactNode } from 'react';
import type { EmailKind } from '@/generated/prisma/client.js';

export interface BookingEmailProps {
  kind: EmailKind;
  preview: string;
  firstName: string;
  serviceName: string;
  when: string;
  duration: string;
  price: string;
  reference: string;
  manageUrl: string;
  bookUrl: string;
  calendarUrl: string;
  enquiryUrl: string;
  ownerEmail: string;
  ownerSiteUrl: string;
  demosUrl: string;
}

const COLOR = {
  page: '#f4f5f7',
  card: '#fffffe',
  text: '#111827',
  muted: '#6b7280',
  border: '#e5e7eb',
  brand: '#4f46e5',
  brandSoft: '#eef2ff',
  brandBorder: '#c7d2fe',
};

const BADGE: Record<
  EmailKind,
  { label: string; color: string; background: string }
> = {
  confirmation: { label: 'Confirmed', color: '#047857', background: '#ecfdf5' },
  reschedule: {
    label: 'Updated',
    color: COLOR.brand,
    background: COLOR.brandSoft,
  },
  cancellation: { label: 'Cancelled', color: '#4b5563', background: '#f3f4f6' },
};

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const DARK_MODE_CSS = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  .page { background-color: #0f1115 !important; }
  .card { background-color: #171a21 !important; border-color: #2a2f3a !important; }
  .pitch { background-color: #1e1b4b !important; border-color: #3730a3 !important; }
  .text { color: #e5e7eb !important; }
  .muted { color: #9ca3af !important; }
}`;

const styles = {
  body: {
    backgroundColor: COLOR.page,
    fontFamily: FONT,
    margin: 0,
    padding: '24px 12px',
  },
  container: { maxWidth: '600px', margin: '0 auto' },
  wordmark: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLOR.text,
    margin: '0 0 16px 4px',
  },
  card: {
    backgroundColor: COLOR.card,
    border: `1px solid ${COLOR.border}`,
    borderRadius: '12px',
    padding: '28px 24px',
  },
  badge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '999px',
    padding: '3px 10px',
    margin: '0 0 12px',
  },
  h1: {
    fontSize: '22px',
    lineHeight: '1.3',
    color: COLOR.text,
    margin: '0 0 8px',
  },
  lead: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: COLOR.muted,
    margin: '0 0 20px',
  },
  detailsBox: {
    border: `1px solid ${COLOR.border}`,
    borderRadius: '10px',
    padding: '4px 16px',
  },
  row: {
    margin: '0',
    padding: '10px 0',
    fontSize: '15px',
    lineHeight: '1.4',
    color: COLOR.text,
  },
  label: { color: COLOR.muted, fontSize: '13px' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  actions: { margin: '20px 0 0' },
  outlineButton: {
    display: 'inline-block',
    textAlign: 'center',
    border: `1px solid ${COLOR.border}`,
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: 600,
    color: COLOR.text,
    backgroundColor: COLOR.card,
  },
  small: {
    fontSize: '13px',
    lineHeight: '1.5',
    color: COLOR.muted,
    margin: '12px 0 0',
  },
  link: { color: COLOR.brand, textDecoration: 'underline' },
  hr: { borderColor: COLOR.border, margin: '28px 0' },
  pitch: {
    backgroundColor: COLOR.brandSoft,
    border: `1px solid ${COLOR.brandBorder}`,
    borderRadius: '12px',
    padding: '24px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: COLOR.brand,
    margin: '0 0 8px',
  },
  h2: {
    fontSize: '18px',
    lineHeight: '1.35',
    color: COLOR.text,
    margin: '0 0 8px',
  },
  body15: {
    fontSize: '15px',
    lineHeight: '1.55',
    color: COLOR.text,
    margin: '0 0 18px',
  },
  primaryButton: {
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    textAlign: 'center',
    backgroundColor: COLOR.brand,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fffffe',
  },
  footer: {
    fontSize: '12px',
    lineHeight: '1.6',
    color: COLOR.muted,
    margin: '20px 4px 0',
    textAlign: 'center',
  },
} satisfies Record<string, CSSProperties>;

const HEADLINE: Record<EmailKind, (firstName: string) => string> = {
  confirmation: (firstName) => `You're booked, ${firstName}`,
  reschedule: () => 'Your booking has moved',
  cancellation: () => 'Your booking is cancelled',
};

const LEAD: Record<EmailKind, string> = {
  confirmation: 'Your spot is saved. Everything you need is below.',
  reschedule: 'Here is your new time. The calendar link below has the update.',
  cancellation: 'Nothing else to do. The slot is free again for someone else.',
};

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <Text style={styles.row} className="text">
    <span style={styles.label} className="muted">
      {label}
    </span>
    <br />
    {children}
  </Text>
);

const BookingActions = (props: BookingEmailProps) => {
  if (props.kind === 'cancellation')
    return (
      <Section style={styles.actions}>
        <Button href={props.bookUrl} style={styles.outlineButton}>
          Book another slot
        </Button>
      </Section>
    );

  return (
    <Section style={styles.actions}>
      <Button href={props.calendarUrl} style={styles.outlineButton}>
        Add to Google Calendar
      </Button>
      <Text style={styles.small} className="muted">
        Apple Calendar or Outlook? Open the attached .ics file.
        <br />
        Need a different time?{' '}
        <Link href={props.manageUrl} style={styles.link}>
          Reschedule or cancel
        </Link>
      </Text>
    </Section>
  );
};

const PitchPanel = (props: BookingEmailProps) => {
  if (props.kind === 'cancellation')
    return (
      <Text style={styles.body15} className="text">
        Curious how this works under the hood? I build systems like this for
        small businesses.{' '}
        <Link href={props.enquiryUrl} style={styles.link}>
          Get in touch →
        </Link>
      </Text>
    );

  return (
    <Section style={styles.pitch} className="pitch">
      <Text style={styles.eyebrow}>ABOUT THIS DEMO</Text>
      <Heading as="h2" style={styles.h2} className="text">
        Need something like this for your business?
      </Heading>
      <Text style={styles.body15} className="text">
        I'm Hamza, a full-stack developer. I built this booking flow, from the
        payment to this email, and I build similar tools for small businesses
        and startups.
      </Text>
      <Button href={props.enquiryUrl} style={styles.primaryButton}>
        Tell me about your project
      </Button>
      <Text style={styles.small} className="muted">
        Or email {props.ownerEmail}
      </Text>
    </Section>
  );
};

const BookingEmail = (props: BookingEmailProps) => {
  const badge = BADGE[props.kind];

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{DARK_MODE_CSS}</style>
      </Head>
      <Preview>{props.preview}</Preview>
      <Body style={styles.body} className="page">
        <Container style={styles.container}>
          <Text style={styles.wordmark} className="text">
            Hamza Eshoul · Booking demo
          </Text>
          <Section style={styles.card} className="card">
            <Text
              style={{
                ...styles.badge,
                color: badge.color,
                backgroundColor: badge.background,
              }}
            >
              {badge.label}
            </Text>
            <Heading as="h1" style={styles.h1} className="text">
              {HEADLINE[props.kind](props.firstName)}
            </Heading>
            <Text style={styles.lead} className="muted">
              {LEAD[props.kind]}
            </Text>
            <Section style={styles.detailsBox}>
              <DetailRow label="Service">{props.serviceName}</DetailRow>
              <DetailRow label="When">{props.when}</DetailRow>
              <DetailRow label="Duration">{props.duration}</DetailRow>
              <DetailRow
                label={props.kind === 'cancellation' ? 'Refund' : 'Paid'}
              >
                {props.kind === 'cancellation'
                  ? 'None needed, Stripe test mode'
                  : `${props.price}, Stripe test mode`}
              </DetailRow>
              <DetailRow label="Reference">
                <span style={styles.mono}>{props.reference}</span>
              </DetailRow>
            </Section>
            <BookingActions {...props} />
            <Hr style={styles.hr} />
            <PitchPanel {...props} />
          </Section>
          <Text style={styles.footer} className="muted">
            This is a demo. No real appointment was made and no money was
            charged.
            <br />
            <Link href={props.ownerSiteUrl} style={styles.link}>
              hamzaeshoul.com
            </Link>
            {' · '}
            <Link href={props.demosUrl} style={styles.link}>
              Live demos
            </Link>
            <br />
            You received this because you booked on demos.hamzaeshoul.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingEmail;
