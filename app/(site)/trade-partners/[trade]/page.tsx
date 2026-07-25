import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/queries';
import { TRADES, getTrade } from '@/lib/trade-partners';
import { FEATURES } from '@/lib/site-data';
import { CapabilityTable } from '@/components/CapabilityTable';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return TRADES.map((t) => ({ trade: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string }>;
}): Promise<Metadata> {
  const { trade } = await params;
  const def = getTrade(trade);
  if (!def) return {};
  return pageMetadata({
    title: `${def.name} Subcontractor — Trade Partners`,
    description: def.blurb,
    path: `/trade-partners/${trade}`,
    noindex: !FEATURES.tradePartnersPublished, // gated until capability figures arrive
  });
}

export default async function TradePage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade } = await params;
  const def = getTrade(trade);
  if (!def) notFound();

  const { phone, phoneRaw } = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Trade Partners', path: '/trade-partners' },
          { name: def.name, path: `/trade-partners/${trade}` },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-14 sm:py-16">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl">
            {def.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-100/90">{def.blurb}</p>
          <div className="mt-6">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* PM-screening spec — labeled placeholders until real values arrive */}
      <Section>
        <Eyebrow>What PMs screen for</Eyebrow>
        {!FEATURES.tradePartnersPublished && (
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            These values are unsupplied and shown as placeholders. This page is
            gated (noindex) until they are provided and the schedule-reliability
            question is resolved.
          </p>
        )}
        <div className="mt-6">
          <CapabilityTable />
        </div>
      </Section>

      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <ol className="mt-4 max-w-2xl space-y-3 text-lg text-stone-600">
          <li>1. Send us the scope and the dates.</li>
          <li>2. We confirm crew size and mobilization.</li>
          <li>3. We&apos;re on site when we said.</li>
        </ol>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading={`Need ${def.name.toLowerCase()} crews?`}
        body="Send us the scope and the dates."
      />
    </>
  );
}
