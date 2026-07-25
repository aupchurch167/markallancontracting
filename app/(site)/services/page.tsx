import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { SERVICE_LINES } from '@/lib/site-data';
import { CallCTA } from '@/components/CallCTA';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Our Services — Commercial Contractor in Metro Atlanta',
  description:
    'How we take on a project: pre-construction, general contracting, remodeling, and new construction. Family-owned commercial GC since 1999.',
  path: '/services',
});

export default async function ServicesHub() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Services
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            How we take a project on
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Four ways we engage — from a number before you commit, through the whole
            build. Family-owned commercial general contractor since 1999.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICE_LINES.map((line, i) => (
            <Link
              key={line.slug}
              href={line.href}
              className="group flex flex-col rounded-xl border border-stone-200 bg-paper p-7 transition-colors hover:border-accent hover:bg-stone-50"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="text-xl font-bold text-navy group-hover:text-accent">
                  {line.name}
                </div>
              </div>
              <p className="mt-3 text-stone-600">{line.blurb}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-accent">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Cross-link to project types */}
      <Section muted>
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-stone-200 bg-paper p-7 sm:flex-row sm:items-center">
          <div>
            <Eyebrow>Looking for a specific kind of space?</Eyebrow>
            <p className="mt-2 max-w-2xl text-stone-600">
              Tenant improvements, restaurant and retail buildouts, office
              renovation, warehouse conversion, building repair, and interior
              trades.
            </p>
          </div>
          <Link href="/project-types" className="btn-ghost shrink-0">
            Browse project types →
          </Link>
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
