import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { getService } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial Remodeling & Renovation in Metro Atlanta',
  description:
    'Commercial remodels and renovations phased around a space that’s still in use — office, retail, restaurant, and building repair. Real numbers, on-schedule crews.',
  path: '/remodeling',
});

// Remodeling draws on the relevant project types.
const RELATED = ['office-renovation', 'retail-buildout', 'building-repair', 'flooring-interior-trades'] as const;

const APPROACH = [
  { title: 'Phased around you', body: 'We sequence the work so the parts of the space still in use keep working. Disruptive trades get scheduled for off-hours where it matters.' },
  { title: 'Dust and noise contained', body: 'We wall off and protect the active areas — the goal is a remodel your tenants and staff barely notice.' },
  { title: 'One number, no surprises', body: 'A scoped estimate up front, and any change priced and approved before it happens.' },
];

export default async function RemodelingPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Remodeling', path: '/remodeling' },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: 'Commercial Remodeling',
          description:
            'Commercial remodeling and renovation phased around occupied space across GA, TN, AL, and SC.',
        })}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Remodeling
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Remodels that work around your operation
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Refreshing an office, reworking a retail space, updating a restaurant, or
            repairing a building — commercial remodeling, phased so the space keeps
            running while we work.
          </p>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The problem</Eyebrow>
          <p className="mt-3 text-2xl font-semibold text-navy sm:text-3xl">
            The space still has to work while you remodel it.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            A remodel isn’t a fresh box — it’s a space with tenants, staff, or
            customers still in it, and a business that can’t stop. The hard part isn’t
            the drywall; it’s sequencing the work so the remodel doesn’t become a
            shutdown. That’s the part we plan first.
          </p>
        </div>
      </Section>

      {/* What we remodel — related project types */}
      <Section muted>
        <Eyebrow>What we remodel</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          Where remodeling usually lands
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {RELATED.map((slug) => {
            const def = getService(slug);
            const c = SERVICE_CONTENT[slug];
            if (!def) return null;
            return (
              <Link
                key={slug}
                href={`/project-types/${slug}`}
                className="group rounded-lg border border-stone-200 bg-paper p-7 transition-colors hover:border-accent hover:bg-stone-50"
              >
                <div className="text-xl font-bold text-navy group-hover:text-accent">
                  {def.name}
                </div>
                <p className="mt-2 line-clamp-2 text-stone-600">{c.problem}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-accent">
                  See {def.name.toLowerCase()} →
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Approach */}
      <Section>
        <Eyebrow>How we keep you running</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">
          A remodel your business barely feels
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {APPROACH.map((a) => (
            <div key={a.title} className="rounded-lg border border-stone-200 bg-paper p-6">
              <h3 className="font-bold text-navy">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Plan */}
      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <p className="mt-2 max-w-2xl text-stone-600">
          We scope the phasing before the price, so there are no surprises once work
          starts.
        </p>
        <div className="mt-8">
          <PlanSteps />
        </div>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Remodeling a space that’s still in use?"
        body="Call us. We’ll walk it and tell you how we’d phase it."
      />
    </>
  );
}
