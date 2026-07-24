import { CallButton } from './PhoneLink';

/**
 * Closing call CTA. Every page ends with one — no exceptions. Copy can be
 * overridden per page; the default is the approved homepage closing copy.
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
    <section className="bg-navy py-16 text-white sm:py-20">
      <div className="container-page text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">{heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-100/90">{body}</p>
        <div className="mt-8 flex justify-center">
          <CallButton phone={phone} phoneRaw={phoneRaw} />
        </div>
      </div>
    </section>
  );
}
