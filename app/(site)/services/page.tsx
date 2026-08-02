import type { Metadata } from 'next';

// Dynamic so admin-set section covers appear immediately.
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/queries';
import { SERVICE_LINES } from '@/lib/site-data';
import { getSectionCovers } from '@/lib/content';
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
  const { services: covers } = await getSectionCovers();

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
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {SERVICE_LINES.map((line, i) => {
            const cover = covers[line.slug];
            return (
              <Link
                key={line.slug}
                href={line.href}
                className="group block border-2 border-brass/40 bg-bone transition-colors hover:border-brass"
              >
                {cover ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                    <Image
                      src={cover}
                      alt={line.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5 sm:p-7">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-bold text-brass">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="text-xl font-bold uppercase tracking-heading text-oxblood group-hover:text-brass">
                      {line.name}
                    </div>
                  </div>
                  <p className="mt-3 text-oxblood/65">{line.blurb}</p>
                  <span className="mt-4 inline-block text-[10px] font-medium uppercase tracking-label text-brass">
                    Learn more →
                  </span>
                </div>
              </Link>
            );
          })}
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
