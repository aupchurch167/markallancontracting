import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { MARKETS } from '@/lib/site-data';
import { MARKET_CONTENT } from '@/lib/fallback-markets';
import { CallCTA } from '@/components/CallCTA';
import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Who We Work For — Commercial Contractor for Brokers, PMs & Operators',
  description:
    'We build for the people on the hook for a date: commercial real estate brokers, property managers, franchise and restaurant operators, multifamily, and facility managers.',
  path: '/markets',
});

export default async function MarketsHub() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Who we work for
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Built for whoever’s on the hook for the date
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Construction is the tax you pay to get the space open and producing. We
            build for the people who have to answer for it.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {MARKETS.map((m) => {
            const c = MARKET_CONTENT[m.slug];
            return (
              <Link
                key={m.slug}
                href={`/markets/${m.slug}`}
                className="group rounded-xl border border-stone-200 bg-paper p-7 transition-colors hover:border-accent hover:bg-stone-50"
              >
                <div className="text-xl font-bold text-navy group-hover:text-accent">
                  {m.name}
                </div>
                <p className="mt-2 line-clamp-3 text-stone-600">{c.problem}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-accent">
                  How we help →
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
