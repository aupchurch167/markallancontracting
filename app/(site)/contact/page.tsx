import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries';
import { CallButton, PhoneLink } from '@/components/PhoneLink';
import { BookingEmbed } from '@/components/BookingEmbed';
import { Section, Eyebrow } from '@/components/Section';
import { SITE, CONTACT } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact — Call or Send Us Your Scope',
  description:
    'Call Mark Allan Contracting to walk your commercial space. Serving Georgia, Tennessee, Alabama, and South Carolina since 1999.',
  path: '/contact',
});

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { phone, phoneRaw, email, raw } = settings;

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Call us. We&apos;ll come walk it.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            The fastest way to a real number is a phone call and a site walk.
          </p>
          {/* Phone first, large, tap-to-call. The button is the action; the big
              number is the tap target — so the button label omits the number to
              avoid showing it twice. */}
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <CallButton phone={phone} phoneRaw={phoneRaw} label="Call now" className="btn-call-ondark" />
            <PhoneLink
              phone={phone}
              phoneRaw={phoneRaw}
              className="text-2xl font-bold text-bone underline decoration-brass decoration-2 underline-offset-4 hover:text-brass"
            />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Secondary path — send us your scope */}
          <div>
            <Eyebrow>Prefer to send it over?</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold text-navy">Send us your scope</h2>
            <p className="mt-2 text-stone-600">
              Drawings, a lease exhibit, or a few sentences about the space and the
              date it needs to be ready. We&apos;ll get you a number back.
            </p>
            <form
              className="mt-6 space-y-4"
              action={`mailto:${email}`}
              method="post"
              encType="text/plain"
              data-lead-form
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-navy">Name</span>
                  <input
                    name="name"
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-navy">Phone</span>
                  <input
                    name="phone"
                    type="tel"
                    className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-navy">Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-navy">The space and the scope</span>
                <textarea
                  name="scope"
                  rows={5}
                  required
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </label>
              <button type="submit" className="btn-ghost">
                Send it over
              </button>
            </form>
          </div>

          {/* NAP block — must match GBP exactly */}
          <div>
            <Eyebrow>Where we are</Eyebrow>
            <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 p-6">
              <div className="text-lg font-bold text-navy">{SITE.name}</div>
              <address className="mt-3 space-y-1 text-stone-600 not-italic">
                <div>{raw?.addressStreet || CONTACT.address.street}</div>
                <div>
                  {(raw?.addressCity || CONTACT.address.city) +
                    ', ' +
                    (raw?.addressState || CONTACT.address.state) +
                    ' ' +
                    (raw?.addressZip || CONTACT.address.zip)}
                </div>
                <div className="pt-3">
                  <PhoneLink phone={phone} phoneRaw={phoneRaw} className="font-semibold text-navy hover:text-accent" />
                </div>
                <div>
                  <a href={`mailto:${email}`} className="hover:text-accent">{email}</a>
                </div>
                <div className="pt-2 text-sm text-stone-500">{raw?.hours || CONTACT.hours}</div>
              </address>
            </div>

            <div className="mt-6">
              <Eyebrow>Service area</Eyebrow>
              <p className="mt-2 text-stone-600">
                Based in Metro Atlanta, working across {SITE.statesServed.join(', ')}.
                Regional projects in Chattanooga, Nashville, Birmingham, Huntsville,
                Greenville, and Columbia.
              </p>
            </div>
          </div>
        </div>

        {/* Optional site-walk scheduler (hidden until a Calendly URL is set) */}
        <div className="mt-12">
          <BookingEmbed />
        </div>
      </Section>
    </>
  );
}
