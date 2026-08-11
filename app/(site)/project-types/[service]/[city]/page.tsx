import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServiceCity, getSiteSettings } from '@/lib/queries';
import { getService as getServiceDef } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { MarkdownBody } from '@/components/MarkdownBody';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

/**
 * The route only renders where a PUBLISHED serviceCity row exists — that
 * enforces the anti-thin-content rule at the data layer. No row → 404. Pages are
 * produced one at a time by the /admin City page builder, never to fill a
 * matrix. force-dynamic so a newly published page appears without a rebuild (and
 * to bypass Railway edge caching), matching the posts/projects routes.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}): Promise<Metadata> {
  const { service, city } = await params;
  const sc = await getServiceCity(service, city);
  if (!sc) return {};
  return pageMetadata({
    title: sc.metaTitle,
    description: sc.metaDescription,
    path: `/project-types/${service}/${city}`,
  });
}

export default async function ServiceCityPage({
  params,
}: {
  params: Promise<{ service: string; city: string }>;
}) {
  const { service, city } = await params;
  const def = getServiceDef(service);
  const sc = await getServiceCity(service, city);
  if (!def || !sc) notFound();

  const settings = await getSiteSettings();
  const { phone, phoneRaw } = settings;
  const c = SERVICE_CONTENT[def.slug];
  const cityLabel = `${sc.cityName}, ${sc.cityState.toUpperCase()}`;

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Project Types', path: '/project-types' },
          { name: def.name, path: `/project-types/${service}` },
          { name: sc.cityName, path: `/project-types/${service}/${city}` },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: def.name,
          description: sc.metaDescription,
          areaServed: sc.cityName,
        })}
      />

      {/* H1 — unique */}
      <section className="bg-navy text-white">
        <div className="container-page py-14 sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {sc.h1}
          </h1>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Intro — generated, unique to this city */}
      <Section>
        <div className="max-w-3xl text-lg leading-relaxed text-stone-600">
          {sc.intro ? (
            <MarkdownBody>{sc.intro}</MarkdownBody>
          ) : (
            <p>
              {c.problem} We work {cityLabel} and the surrounding market, and the three steps below
              are the same on every job.
            </p>
          )}
        </div>
      </Section>

      {/* Local project reference — unique, required */}
      <Section muted>
        <Eyebrow>On the ground in {sc.cityName}</Eyebrow>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-2">
          <div className="relative aspect-[10/7] overflow-hidden rounded-lg bg-stone-200">
            {sc.photoUrl ? (
              <Image
                src={sc.photoUrl}
                alt={sc.photoAlt || sc.projectTitle || `${def.name} in ${cityLabel}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-400">
                CompanyCam photo
              </div>
            )}
          </div>
          <div className="text-lg">
            {sc.projectTitle && (
              <h2 className="mb-3 text-2xl font-bold text-navy">{sc.projectTitle}</h2>
            )}
            {sc.projectBody && <MarkdownBody>{sc.projectBody}</MarkdownBody>}
            {sc.projectRefSlug && (
              <Link
                href={`/projects/${sc.projectRefSlug}`}
                className="mt-2 inline-block text-sm font-semibold text-accent hover:text-accent-700"
              >
                See the full project →
              </Link>
            )}
          </div>
        </div>
      </Section>

      {/* Permitting / jurisdiction note — unique, required */}
      {sc.jurisdictionBody ? (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Permitting in {sc.county || sc.cityName}</Eyebrow>
            <div className="mt-3 text-lg">
              <MarkdownBody>{sc.jurisdictionBody}</MarkdownBody>
            </div>
          </div>
        </Section>
      ) : null}

      {/* Scope list — templated from service */}
      <Section muted>
        <Eyebrow>What&apos;s included</Eyebrow>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {c.scope.map((item) => (
            <li key={item} className="flex items-start gap-2 text-stone-600">
              <span aria-hidden className="mt-1 text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Plan — templated */}
      <Section>
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-8">
          <PlanSteps />
        </div>
      </Section>

      {/* Cross-links: up to hub, across to city hub */}
      <Section muted>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/project-types/${service}`}
            className="rounded-md border border-stone-200 bg-paper px-4 py-2 text-sm font-medium text-navy hover:border-accent hover:text-accent"
          >
            ← All {def.name}
          </Link>
          <Link
            href={`/locations/${city}`}
            className="rounded-md border border-stone-200 bg-paper px-4 py-2 text-sm font-medium text-navy hover:border-accent hover:text-accent"
          >
            Everything we do in {sc.cityName} →
          </Link>
        </div>
      </Section>

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading={sc.ctaLine || `Got a ${def.name.toLowerCase()} project in ${sc.cityName}?`}
      />
    </>
  );
}
