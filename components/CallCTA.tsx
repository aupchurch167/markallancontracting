import { CallButton } from './PhoneLink';

/**
 * Closing call CTA. Every page ends with one — no exceptions. A full-bleed
 * ink band with cream text, left-aligned.
 */
export function CallCTA({
  phone,
  phoneRaw,
  heading = 'Got a space that needs work?',
  body = "Call us. We'll come walk it and tell you what we think it'll take.",
}: {
  phone: string;
  phoneRaw: string;
  heading?: string;
  body?: string;
}) {
  return (
    <section className="bg-ink py-24 text-cream sm:py-28">
      <div className="container-page">
        <h2 className="max-w-3xl text-3xl font-bold uppercase tracking-heading text-cream sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-cream-muted">{body}</p>
        <div className="mt-10">
          <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
        </div>
      </div>
    </section>
  );
}
