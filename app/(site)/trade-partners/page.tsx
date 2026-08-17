import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/queries';
import { TRADES } from '@/lib/trade-partners';
import { FEATURES } from '@/lib/site-data';
import { CallCTA } from '@/components/CallCTA';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

/**
 * GATED. noindex until real capability values arrive and the schedule-reliability
 * question is resolved. Not in nav.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Trade Partners — Interior Trades for GCs',
  description:
    'Self-performed interior trades for general contractors: framing, drywall, paint, ACT, and flooring under one contract.',
  path: '/trade-partners',
  noindex: !FEATURES.tradePartnersPublished,
});

export default async function TradePartnersPage() {
  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <Eyebrow>For general contractors</Eyebrow>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Interior crews that make your schedule
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream-muted">
            25+ years self-performing interior trades — framing, drywall, paint,
            ACT, flooring — under one contract. Send us the scope and the dates.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.map((t) => (
            <Link
              key={t.slug}
              href={`/trade-partners/${t.slug}`}
              className="group rounded-[2px] border border-hairline p-6 transition-colors hover:border-maroon hover:bg-paper"
            >
              <div className="text-lg font-semibold text-ink group-hover:text-maroon">{t.name}</div>
              <p className="mt-2 text-sm text-body">{t.blurb}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading="Short a crew on an interior scope?"
        body="Send us the scope and the dates. We'll confirm crew size and mobilization."
      />
    </>
  );
}
