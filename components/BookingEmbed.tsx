import Script from 'next/script';
import { BOOKING } from '@/lib/constants';
import { Eyebrow } from './Section';

/**
 * Inline Calendly scheduler for booking a site walk. Renders nothing until
 * NEXT_PUBLIC_CALENDLY_URL is set, so the phone stays the primary CTA and this
 * is a purely additive secondary path.
 */
export function BookingEmbed() {
  if (!BOOKING.calendlyUrl) return null;
  return (
    <div>
      <Eyebrow>Prefer to book a time?</Eyebrow>
      <h2 className="mt-2 text-2xl font-bold text-ink">Schedule a site walk</h2>
      <p className="mt-2 text-body">
        Pick a time that works and we&apos;ll come look at the space.
      </p>
      <div
        className="calendly-inline-widget mt-6 overflow-hidden rounded-[2px] border border-hairline"
        data-url={BOOKING.calendlyUrl}
        style={{ minWidth: 320, height: 660 }}
      />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
    </div>
  );
}
