import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { SERVICES, MARKETS } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { CallCTA } from '@/components/CallCTA';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Commercial Construction Services | Metro Atlanta & the Southeast',
  description:
    'Tenant improvements, restaurant and retail buildouts, office renovation, warehouse conversion, building repair, and interior trades across GA, TN, AL, SC.',
  path: '/services',
});

export default async function ServicesHub() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            What we build
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Commercial interiors and repairs across Georgia, Tennessee, Alabama,
            and South Carolina. Projects from $50K to $500K.
          </p>
        </div>
      </section>

      <Section>
        {/* Start here — pre-construction as a sold, entry-point service */}
        <Link
          href="/pre-construction"
          className="group flex flex-col justify-between gap-4 rounded-xl border border-accent bg-navy p-7 text-white transition-colors hover:bg-navy-600 sm:flex-row sm:items-center"
        >
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-accent">
              Start here
            </div>
            <div className="mt-1 text-xl font-bold text-white">Pre-Construction</div>
            <p className="mt-2 max-w-2xl text-stone-100/90">
              A defined, paid engagement for a defensible budget and a real schedule
              before you build — and the fee credits back if we do the work.
            </p>
          </div>
          <span className="shrink-0 font-semibold text-white">
            See the engagement →
          </span>
        </Link>

        <div className="mt-12">
          <Eyebrow>Build services</Eyebrow>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {SERVICES.map((s) => {
            const c = SERVICE_CONTENT[s.slug];
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
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

      <Section muted>
        <Eyebrow>Who we work with</Eyebrow>
        <h2 className="mt-3 text-3xl font-bold text-navy">Built for your side of the deal</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETS.map((m) => (
            <Link
              key={m.slug}
              href={`/markets/${m.slug}`}
              className="rounded-lg border border-stone-200 bg-paper p-5 font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
            >
              {m.name}
            </Link>
          ))}
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
