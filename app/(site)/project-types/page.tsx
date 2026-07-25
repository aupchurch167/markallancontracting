import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { SERVICES } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { CallCTA } from '@/components/CallCTA';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial Project Types | Metro Atlanta & the Southeast',
  description:
    'The kinds of commercial space we build: tenant improvements, restaurant and retail buildouts, office renovation, warehouse conversion, building repair, and interior trades.',
  path: '/project-types',
});

export default async function ProjectTypesHub() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Project types
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            The kinds of space we build
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Commercial interiors and repairs across Georgia, Tennessee, Alabama,
            and South Carolina. Projects from $50K to $500K.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => {
            const c = SERVICE_CONTENT[s.slug];
            return (
              <Link
                key={s.slug}
                href={`/project-types/${s.slug}`}
                className="group rounded-lg border border-stone-200 bg-paper p-7 transition-colors hover:border-accent hover:bg-stone-50"
              >
                <div className="text-xl font-bold text-navy group-hover:text-accent">
                  {s.name}
                </div>
                <p className="mt-2 line-clamp-2 text-stone-600">{c.problem}</p>
                <div className="mt-4 text-sm font-medium text-stone-400">
                  Typical range {c.typicalRange}
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* Cross-sell to the service lines and audiences */}
      <Section muted>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/services"
            className="group rounded-xl border border-stone-200 bg-paper p-7 transition-colors hover:border-accent"
          >
            <Eyebrow>How we engage</Eyebrow>
            <div className="mt-2 text-xl font-bold text-navy group-hover:text-accent">
              Our services
            </div>
            <p className="mt-2 text-stone-600">
              Pre-construction, general contracting, remodeling, and new
              construction — the ways we take a project on.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-accent">
              See our services →
            </span>
          </Link>
          <Link
            href="/markets"
            className="group rounded-xl border border-stone-200 bg-paper p-7 transition-colors hover:border-accent"
          >
            <Eyebrow>Who we work for</Eyebrow>
            <div className="mt-2 text-xl font-bold text-navy group-hover:text-accent">
              Built for your side of the deal
            </div>
            <p className="mt-2 text-stone-600">
              Brokers, property managers, franchise and restaurant operators,
              multifamily, and facility managers.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-accent">
              Who we work for →
            </span>
          </Link>
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
