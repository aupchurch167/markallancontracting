import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getService, getSiteSettings, getCitiesForService } from '@/lib/queries';
import { getService as getServiceDef, SERVICE_SLUGS } from '@/lib/site-data';
import { SERVICE_CONTENT } from '@/lib/fallback-content';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { FAQ } from '@/components/FAQ';
import { ProjectCard } from '@/components/ProjectCard';
import {
  summariesFromSanityCards,
  getFallbackSummariesForService,
} from '@/lib/projects';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const { service } = await params;
  const def = getServiceDef(service);
  if (!def) return {};
  const c = SERVICE_CONTENT[def.slug];
  const doc = await getService(service);
  return pageMetadata({
    title: doc?.metaTitle || c.metaTitle,
    description: doc?.metaDescription || c.metaDescription,
    path: `/project-types/${service}`,
  });
}

export default async function ServiceHubPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  const def = getServiceDef(service);
  if (!def) notFound();

  const c = SERVICE_CONTENT[def.slug];
  const [doc, settings, cities] = await Promise.all([
    getService(service),
    getSiteSettings(),
    getCitiesForService(service),
  ]);
  const { phone, phoneRaw } = settings;

  const h1 = doc?.h1 || c.h1;
  const scope = doc?.scopeItems?.length ? doc.scopeItems : c.scope;
  const range = doc?.typicalRange || c.typicalRange;
  const timeline = doc?.typicalTimeline || c.typicalTimeline;

  // Sanity related projects win; otherwise show delivered fallback work for this service.
  const projects = doc?.relatedProjects?.length
    ? summariesFromSanityCards(doc.relatedProjects)
    : getFallbackSummariesForService(service);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Project Types', path: '/project-types' },
          { name: def.name, path: `/project-types/${service}` },
        ]}
      />
      <JsonLd
        data={serviceSchema({
          name: def.name,
          description: doc?.metaDescription || c.metaDescription,
        })}
      />

      {/* Hook */}
      <section className="bg-ink text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {h1}
          </h1>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>The problem</Eyebrow>
          {doc?.problemStatement?.length ? (
            <div className="mt-3 text-lg">
              <PortableText value={doc.problemStatement} />
            </div>
          ) : (
            <p className="mt-3 text-lg leading-relaxed text-body">{c.problem}</p>
          )}
        </div>
      </Section>

      {/* What's included */}
      <Section muted>
        <Eyebrow>What&apos;s included</Eyebrow>
        <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
          Real scope, trade by trade
        </h2>
        <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {scope.map((item) => (
            <li key={item} className="flex items-start gap-2 text-body">
              <span aria-hidden className="mt-1 text-maroon">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Plan */}
      <Section>
        <Eyebrow>How it works</Eyebrow>
        <p className="mt-2 max-w-2xl text-body">{c.planIntro}</p>
        <div className="mt-8">
          <PlanSteps steps={doc?.planSteps} />
        </div>
        <Link
          href="/construction-process"
          className="mt-8 inline-block font-semibold text-maroon hover:text-maroon-dark"
        >
          See how a job runs day to day →
        </Link>
      </Section>

      {/* Project examples */}
      {projects.length > 0 ? (
        <Section muted>
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Recent work</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* Typical range and timeline */}
      <Section muted={projects.length === 0}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[2px] border border-hairline bg-paper p-7">
            <div className="text-sm font-semibold uppercase tracking-wider text-faint">
              Typical range
            </div>
            <div className="mt-2 text-3xl font-bold text-ink">{range}</div>
          </div>
          <div className="rounded-[2px] border border-hairline bg-paper p-7">
            <div className="text-sm font-semibold uppercase tracking-wider text-faint">
              Typical timeline
            </div>
            <div className="mt-2 text-xl font-semibold text-ink">{timeline}</div>
          </div>
        </div>
      </Section>

      {/* FAQ — genuine questions only, with FAQPage schema */}
      {c.faqs.length > 0 && (
        <Section>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Common questions</h2>
            <div className="mt-6">
              <FAQ faqs={c.faqs} />
            </div>
          </div>
        </Section>
      )}

      {/* City links — hub links down to every matrix page for this service */}
      {cities.length > 0 && (
        <Section>
          <h2 className="text-2xl font-bold text-ink">{def.name} by city</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/project-types/${service}/${city.slug}`}
                className="rounded-full border border-hairline bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-maroon hover:text-maroon"
              >
                {city.name}, {city.state.toUpperCase()}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
