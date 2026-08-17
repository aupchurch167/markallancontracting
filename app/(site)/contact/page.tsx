import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { SITE, CONTACT, telHref } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact — Call or Send Us Your Scope',
  description:
    'Call Mark Allan Contracting to walk your commercial space. Serving Georgia, Tennessee, Alabama, and South Carolina since 1999.',
  path: '/contact',
});

const NEXT_STEPS = [
  { n: '01', body: 'A ten-minute call about the space, your timeline, and what has to be true for this to be a win.' },
  { n: '02', body: "If it's a fit, we walk the space that week — measurements, conditions, real estimate." },
  { n: '03', body: 'We walk you through the estimate, every line, before you sign anything.' },
];

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { phone, phoneRaw, email, raw } = settings;

  return (
    <div className="container-page py-16 sm:py-[72px]">
      <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-[72px]">
        {/* Left */}
        <div>
          <div className="kicker mb-5 text-maroon">Contact</div>
          <h1 className="mb-6 font-display text-[13vw] leading-[0.92] sm:text-[64px] lg:text-[80px]">You&apos;ve got a space that needs to be ready.</h1>
          <p className="mb-9 max-w-[48ch] text-[18px] leading-relaxed text-body">
            We&apos;ve been doing this since 1999. Call or fill out the form. We&apos;ll get back to you within one business day — and if we&apos;re not the right fit for your project, we&apos;ll tell you that on the first call.
          </p>
          <a href={telHref(phoneRaw)} data-tracked-phone className="btn-ink mb-9">
            Call {phone}
          </a>

          <div className="grid gap-7 border-t border-hairline pt-7 text-[15px] leading-relaxed text-body sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-label text-faint">Office</div>
              {raw?.addressStreet || CONTACT.address.street}
              <br />
              {(raw?.addressCity || CONTACT.address.city) + ', ' + (raw?.addressState || CONTACT.address.state) + ' ' + (raw?.addressZip || CONTACT.address.zip)}
            </div>
            <div>
              <div className="mb-2 text-[13px] font-semibold uppercase tracking-label text-faint">Reach us</div>
              <a href={telHref(phoneRaw)} data-tracked-phone className="text-maroon hover:text-maroon-light">
                {phone}
              </a>
              <br />
              <a href={`mailto:${email}`} className="text-maroon hover:text-maroon-light">
                {email}
              </a>
              <div className="mt-2 text-faint">{raw?.hours || CONTACT.hours}</div>
            </div>
          </div>

          <div className="mt-7 border-t border-hairline pt-7">
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-label text-faint">What happens next</div>
            <div className="flex flex-col gap-3.5">
              {NEXT_STEPS.map((s) => (
                <div key={s.n} className="flex items-baseline gap-4">
                  <span className="w-8 flex-none font-display text-[24px] font-bold text-maroon">{s.n}</span>
                  <span className="text-[15px] text-body">{s.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form card */}
        <form
          className="flex flex-col gap-[18px] border border-hairline bg-[#FFFFFF] p-10 shadow-[0_16px_40px_rgba(29,21,23,0.06)]"
          action={`mailto:${email}`}
          method="post"
          encType="text/plain"
          data-lead-form
        >
          <div className="font-display text-[26px] font-semibold uppercase text-ink">Send it over</div>
          <div className="grid gap-[18px] sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="field-label">Name</span>
              <input name="name" type="text" required className="field-input" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="field-label">Phone</span>
              <input name="phone" type="tel" className="field-input" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="field-label">Email</span>
            <input name="email" type="email" required className="field-input" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="field-label">What&apos;s the project?</span>
            <textarea name="scope" rows={6} required placeholder="Space, location, rough timeline" className="field-input resize-y" />
          </label>
          <button type="submit" className="btn-maroon w-full">
            Send it over
          </button>
          <div className="text-center text-[13px] text-faint">Response within one business day.</div>
        </form>
      </div>
    </div>
  );
}
