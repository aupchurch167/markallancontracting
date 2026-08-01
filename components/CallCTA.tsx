import { CallButton } from './PhoneLink';

/**
 * Closing call CTA. Every page ends with one — no exceptions. A full-bleed
 * oxblood band with bone text, left-aligned.
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
    <section className="bg-oxblood py-24 text-bone sm:py-28">
      <div className="container-page">
        <h2 className="max-w-3xl text-3xl font-bold uppercase tracking-heading text-bone sm:text-4xl">
          {heading}
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-bone/60">{body}</p>
        <div className="mt-10">
          <CallButton phone={phone} phoneRaw={phoneRaw} className="btn-call-ondark" />
        </div>
      </div>
    </section>
  );
}
