import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { SERVICES } from '@/lib/site-data';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial General Contractor in Metro Atlanta',
  description:
    'Family-owned commercial general contractor since 1999. We run the whole build — self-performed interior trades, one team accountable. Projects from $50K to $500K.',
  path: '/general-contracting',
});

const VALUE = [
  {
    name: 'One team accountable',
    body: 'The people who price your job stay on it through the build — you’re not handed off to a crew you never met.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
  },
  {
    name: 'Self-performed trades',
    body: 'Framing, drywall, paint, ceilings, and flooring with our own crews — fewer separate subs to coordinate.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />,
  },
  {
    name: 'A real number',
    body: 'A scoped estimate you can hand to your owner or lender — not a range that turns into change orders.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    name: 'Owner’s-side perspective',
    body: 'We’ve developed and operated our own commercial property, so we scope for what an owner actually worries about.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />,
  },
];

const SELF_PERFORM = ['Metal stud framing', 'Drywall & finish', 'Acoustical ceilings (ACT)', 'Interior & exterior paint', 'Commercial flooring', 'Doors, frames & hardware'];
const MANAGED = ['Electrical', 'Plumbing', 'HVAC / mechanical', 'Fire protection', 'Specialty equipment', 'Low-voltage & data'];

export default async function GeneralContractingPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'General Contracting', path: '/general-contracting' },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: 'Commercial General Contracting',
          description:
            'Full-service commercial general contractor self-performing interior trades across GA, TN, AL, and SC.',
        })}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-maroon">
            General contracting
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            We run the whole build
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream-muted">
            Your commercial general contractor from the first walk to the
            certificate of occupancy. Family-owned since 1999, self-performing the
            interior trades, across Georgia, Tennessee, Alabama, and South Carolina.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Value */}
      <Section>
        <Eyebrow>Why us</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          What you get with a GC like us
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE.map((v) => (
            <div key={v.name} className="rounded-[2px] border border-hairline bg-paper p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-[2px] bg-ink/5 text-ink">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  {v.icon}
                </svg>
              </span>
              <h3 className="mt-4 font-bold text-ink">{v.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-body">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Self-perform vs. manage */}
      <Section muted>
        <Eyebrow>How the work gets done</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          What we self-perform, and what we manage
        </h2>
        <p className="mt-3 max-w-2xl text-body">
          Running the interior trades in-house means fewer subs to chase and one
          party accountable for the finish. Licensed specialty trades are scheduled
          and supervised the same way.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2px] border border-maroon bg-paper p-7 ring-1 ring-accent/20">
            <h3 className="text-lg font-bold text-ink">We self-perform</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {SELF_PERFORM.map((t) => (
                <li key={t} className="flex items-start gap-2 text-body">
                  <span aria-hidden className="mt-1 text-maroon">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2px] border border-hairline bg-paper p-7">
            <h3 className="text-lg font-bold text-ink">We manage & supervise</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {MANAGED.map((t) => (
                <li key={t} className="flex items-start gap-2 text-body">
                  <span aria-hidden className="mt-1 text-faint">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Project types we take on */}
      <Section>
        <Eyebrow>What we build</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
          The kinds of space we take on
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/project-types/${s.slug}`}
              className="rounded-full border border-hairline bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-maroon hover:text-maroon"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </Section>

      {/* How a job runs */}
      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <p className="mt-2 max-w-2xl text-body">
          Same three steps on every job — what changes is the scope, not the process.
        </p>
        <div className="mt-8">
          <PlanSteps />
        </div>
        <Link
          href="/construction-process"
          className="mt-8 inline-block font-semibold text-maroon hover:text-maroon-dark"
        >
          See how a job runs day to day →
        </Link>
      </Section>

      {/* Range */}
      <Section>
        <div className="mx-auto max-w-3xl rounded-[2px] border border-navy/15 bg-ink/[0.03] p-8 text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-faint">
            Project range
          </div>
          <div className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
            {SITE.projectRange}
          </div>
          <p className="mt-3 text-body">
            Commercial interiors, repairs, and shell work across the Southeast.
          </p>
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
