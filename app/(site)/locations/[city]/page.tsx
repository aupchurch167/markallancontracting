import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCity,
  getCitySlugs,
  getServicesForCity,
  getSiteSettings,
} from '@/lib/queries';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { pageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const slugs = await getCitySlugs();
  return slugs.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const doc = await getCity(city);
  if (!doc) return {};
  const label = `${doc.name}, ${doc.state.toUpperCase()}`;
  return pageMetadata({
    title: `Commercial General Contractor in ${label} | Mark Allan Contracting`,
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
  if (!doc) notFound();

  const [services, settings] = await Promise.all([
    getServicesForCity(city),
    getSiteSettings(),
  ]);
  const { phone, phoneRaw } = settings;
  const label = `${doc.name}, ${doc.state.toUpperCase()}`;

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: doc.name, path: `/locations/${city}` },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Commercial General Contractor in {label}
          </h1>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {doc.intro?.length ? (
        <Section>
          <div className="max-w-3xl text-lg">
            <PortableText value={doc.intro} />
          </div>
        </Section>
      ) : null}

      {/* Service grid — links to service × city pages */}
      {services.length > 0 && (
        <Section muted>
          <Eyebrow>What we do in {doc.name}</Eyebrow>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/${city}`}
                className="rounded-lg border border-stone-200 bg-paper p-5 font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Jurisdiction note */}
      {doc.jurisdictionNote?.length ? (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Permitting in {doc.county || doc.name}</Eyebrow>
            <div className="mt-3 text-lg">
              <PortableText value={doc.jurisdictionNote} />
            </div>
          </div>
        </Section>
      ) : null}

      <CallCTA phone={phone} phoneRaw={phoneRaw} heading={`Building in ${doc.name}?`} />
    </>
  );
}
