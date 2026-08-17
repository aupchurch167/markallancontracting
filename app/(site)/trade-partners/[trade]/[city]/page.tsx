import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteSettings } from '@/lib/queries';
import { getTrade } from '@/lib/trade-partners';
import { CapabilityTable } from '@/components/CapabilityTable';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

/**
 * GATED trade × city template. noindex, not linked. Not pre-generated — these
 * only render on demand and are excluded from the sitemap until the section is
 * ungated with real capability values.
 */
export const dynamicParams = true;

function humanizeCity(slug: string): string {
  const parts = slug.split('-');
  const state = parts.pop();
  const city = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return state ? `${city}, ${state.toUpperCase()}` : city;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ trade: string; city: string }>;
}): Promise<Metadata> {
  const { trade, city } = await params;
  const def = getTrade(trade);
  if (!def) return {};
  return pageMetadata({
    title: `${def.name} Subcontractor in ${humanizeCity(city)}`,
    description: `${def.blurb} Serving ${humanizeCity(city)}.`,
    path: `/trade-partners/${trade}/${city}`,
    noindex: true,
  });
}

export default async function TradeCityPage({
  params,
}: {
  params: Promise<{ trade: string; city: string }>;
}) {
  const { trade, city } = await params;
  const def = getTrade(trade);
  if (!def) notFound();

  const { phone, phoneRaw } = await getSiteSettings();
  const cityLabel = humanizeCity(city);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Trade Partners', path: '/trade-partners' },
          { name: def.name, path: `/trade-partners/${trade}` },
          { name: cityLabel, path: `/trade-partners/${trade}/${city}` },
        ]}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-14 sm:py-16">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl">
            {def.name} in {cityLabel}
          </h1>
          <div className="mt-6">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>What PMs screen for</Eyebrow>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Gated (noindex). Capability values pending.
        </p>
        <div className="mt-6">
          <CapabilityTable />
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} heading={`Crews for ${cityLabel}?`} body="Send us the scope and the dates." />
    </>
  );
}
