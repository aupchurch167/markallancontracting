import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCity,
  getCitySlugs,
  getServicesForCity,
  getSiteSettings,
} from '@/lib/queries';
import { FALLBACK_CITIES, FALLBACK_CITIES_BY_SLUG } from '@/lib/fallback-cities';
import { SERVICES } from '@/lib/site-data';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { pageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const sanitySlugs = await getCitySlugs();
  const all = new Set([...sanitySlugs, ...FALLBACK_CITIES.map((c) => c.slug)]);
  return Array.from(all).map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const doc = await getCity(city);
  const fb = FALLBACK_CITIES_BY_SLUG[city];
  const name = doc?.name || fb?.name;
  const state = (doc?.state || fb?.state || '').toUpperCase();
  if (!name) return {};
  const label = `${name}, ${state}`;
  return pageMetadata({
    title: `Commercial General Contractor in ${label}`,
    description: `Commercial buildouts, renovations, and repairs in ${label}. Family-owned since 1999. Get a scoped number, not a range.`,
    path: `/locations/${city}`,
  });
}

export default async function CityHubPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const doc = await getCity(city);
  const fb = FALLBACK_CITIES_BY_SLUG[city];
  if (!doc && !fb) notFound();

  const [servicesInCity, settings] = await Promise.all([
    getServicesForCity(city),
    getSiteSettings(),
  ]);
  const { phone, phoneRaw } = settings;

  const name = doc?.name || fb!.name;
  const county = doc?.county || fb?.county;
  const state = (doc?.state || fb!.state).toUpperCase();
  const label = `${name}, ${state}`;

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name, path: `/locations/${city}` },
        ]}
      />

      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Commercial General Contractor in {label}
          </h1>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Intro */}
      <Section>
        <div className="max-w-3xl text-lg">
          {doc?.intro?.length ? (
            <PortableText value={doc.intro} />
          ) : fb ? (
            <p className="leading-relaxed text-body">{fb.intro}</p>
          ) : null}
        </div>
      </Section>

      {/* Service grid — links to matrix pages where they exist, else service hubs */}
      <Section muted>
        <Eyebrow>What we do in {name}</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicesInCity.length > 0
            ? servicesInCity.map((s) => (
                <Link
                  key={s.slug}
                  href={`/project-types/${s.slug}/${city}`}
                  className="rounded-[2px] border border-hairline bg-paper p-5 font-semibold text-ink transition-colors hover:border-maroon hover:text-maroon"
                >
                  {s.title}
                </Link>
              ))
            : SERVICES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/project-types/${s.slug}`}
                  className="rounded-[2px] border border-hairline bg-paper p-5 font-semibold text-ink transition-colors hover:border-maroon hover:text-maroon"
                >
                  {s.name}
                </Link>
              ))}
        </div>
      </Section>

      {/* Jurisdiction note */}
      {(doc?.jurisdictionNote?.length || fb?.jurisdiction?.length) && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Permitting in {county || name}</Eyebrow>
            <div className="mt-3 text-lg">
              {doc?.jurisdictionNote?.length ? (
                <PortableText value={doc.jurisdictionNote} />
              ) : (
                fb?.jurisdiction.map((p, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-body">
                    {p}
                  </p>
                ))
              )}
            </div>
          </div>
        </Section>
      )}

      <CallCTA phone={phone} phoneRaw={phoneRaw} heading={`Building in ${name}?`} />
    </>
  );
}
