import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getService, getSiteSettings, getCitiesForService } from '@/lib/queries';
import { getService as getServiceDef, SERVICE_SLUGS } from '@/lib/site-data';
import { SERVICE_CONTENT, type ServiceProofProject } from '@/lib/fallback-content';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { FAQ } from '@/components/FAQ';
import { ProjectCard } from '@/components/ProjectCard';
import { RelatedReading } from '@/components/RelatedReading';
import { NapBlock } from '@/components/NapBlock';
import {
  summariesFromSanityCards,
  getFallbackSummariesForService,
  getSummariesForSlugs,
  type ProjectSummary,
} from '@/lib/projects';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

// CMS photos on a money-page proof strip must appear at request time.
export const dynamic = 'force-dynamic';

function proofToSummary(p: ServiceProofProject): ProjectSummary {
  return {
    id: p.slug,
    title: p.title,
    slug: p.slug,
    clientType: p.clientType,
    location:
      p.cityName && p.cityState ? `${p.cityName}, ${p.cityState.toUpperCase()}` : undefined,
    scopeSummary: p.scopeSummary,
    imageUrl: p.imageUrl,
  };
}

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
  const { phone, phoneRaw, email } = settings;

  const h1 = doc?.h1 || c.h1;
  const scope = doc?.scopeItems?.length ? doc.scopeItems : c.scope;
  const range = doc?.typicalRange || c.typicalRange;
  const timeline = doc?.typicalTimeline || c.typicalTimeline;
  const extras = Boolean(
    c.includesVsSwingers ||
      c.kitchenScope ||
      c.costTable ||
      c.franchisePlaybook ||
      c.proofProjects?.length ||
      c.relatedReading?.length,
  );

  const rangeAndTable = (
    <>
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

      {c.costTable && (
        <div className="mt-12">
          <Eyebrow>Bands we actually use</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{c.costTable.heading}</h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-body">{c.costTable.intro}</p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                {c.costTable.caption ||
                  'Typical cost and timeline bands, with related reading'}
              </caption>
              <thead className="bg-paper-alt text-ink">
                <tr>
                  <th scope="col" className="border border-hairline px-4 py-3 font-semibold">
                    What
                  </th>
                  <th scope="col" className="border border-hairline px-4 py-3 font-semibold">
                    Typical
                  </th>
                  <th scope="col" className="border border-hairline px-4 py-3 font-semibold">
                    What moves it
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.costTable.rows.map((row) => (
                  <tr key={row.item}>
                    <th
                      scope="row"
                      className="border border-hairline px-4 py-3 font-semibold text-ink"
                    >
                      {row.item}
                    </th>
                    <td className="border border-hairline px-4 py-3 font-medium text-ink">
                      {row.typical}
                    </td>
                    <td className="border border-hairline px-4 py-3 align-top text-body">
                      {row.note}{' '}
                      {row.href && row.linkLabel ? (
                        <Link
                          href={row.href}
                          className="font-semibold text-maroon hover:text-maroon-dark"
                        >
                          {row.linkLabel} →
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-3xl leading-relaxed text-body">{c.costTable.after}</p>
        </div>
      )}
    </>
  );

  // Curated proof strip (money pages) wins; else Sanity related projects;
  // else delivered fallback work for this service.
  const projects = c.proofProjects?.length
    ? await getSummariesForSlugs(c.proofProjects.map(proofToSummary))
    : doc?.relatedProjects?.length
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

      {/* What's included — kitchen-first sequence when authored, else trade list */}
      {c.kitchenScope ? (
        <Section muted>
          <Eyebrow>What&apos;s included</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            {c.kitchenScope.heading}
          </h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-body">
            {c.kitchenScope.intro}
          </p>
          <ol className="mt-8 space-y-5">
            {c.kitchenScope.items.map((item, i) => (
              <li key={item.label} className="flex items-start gap-4 text-body">
                <span
                  aria-hidden
                  className="mt-0.5 w-7 shrink-0 font-display text-lg font-semibold text-maroon"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold text-ink">{item.label}</span>
                    {item.critical ? (
                      <span className="text-xs font-semibold uppercase tracking-wider text-maroon">
                        Schedule-critical
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 leading-relaxed">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      ) : (
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
      )}

      {c.includesVsSwingers && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Scope vs. swingers</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
              {c.includesVsSwingers.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body">{c.includesVsSwingers.intro}</p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2px] border border-hairline bg-paper p-7">
              <h3 className="text-xl font-bold text-ink">{c.includesVsSwingers.includesHeading}</h3>
              <ul className="mt-5 space-y-4">
                {c.includesVsSwingers.includes.map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-body">
                    <span aria-hidden className="mt-1 text-maroon">
                      ✓
                    </span>
                    <span>
                      <span className="font-semibold text-ink">{item.label}.</span> {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2px] border border-hairline bg-paper p-7">
              <h3 className="text-xl font-bold text-ink">{c.includesVsSwingers.swingersHeading}</h3>
              <ul className="mt-5 space-y-4">
                {c.includesVsSwingers.swingers.map((item) => (
                  <li key={item.label} className="flex items-start gap-2 text-body">
                    <span aria-hidden className="mt-1 text-maroon">
                      ✓
                    </span>
                    <span>
                      <span className="font-semibold text-ink">{item.label}.</span> {item.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 max-w-3xl leading-relaxed text-body">
            {c.includesVsSwingers.after}
            {c.includesVsSwingers.alsoLink ? (
              <>
                {' '}
                <Link
                  href={c.includesVsSwingers.alsoLink.href}
                  className="font-semibold text-maroon hover:text-maroon-dark"
                >
                  {c.includesVsSwingers.alsoLink.label} →
                </Link>
              </>
            ) : null}
          </p>
          <Link
            href={c.includesVsSwingers.insightHref}
            className="mt-4 inline-block font-semibold text-maroon hover:text-maroon-dark"
          >
            {c.includesVsSwingers.insightLabel} →
          </Link>
        </Section>
      )}

      {/* Plan */}
      <Section muted={Boolean(c.includesVsSwingers || c.kitchenScope)}>
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

      {c.costTable ? <Section>{rangeAndTable}</Section> : null}

      {c.franchisePlaybook && (
        <Section muted>
          <div className="max-w-3xl">
            <Eyebrow>Franchise &amp; multi-unit</Eyebrow>
            <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
              {c.franchisePlaybook.heading}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body">{c.franchisePlaybook.intro}</p>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {c.franchisePlaybook.items.map((item) => (
              <li
                key={item.label}
                className="rounded-[2px] border border-hairline bg-paper p-7 text-body"
              >
                <h3 className="text-xl font-bold text-ink">{item.label}</h3>
                <p className="mt-3 leading-relaxed">{item.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl leading-relaxed text-body">{c.franchisePlaybook.after}</p>
          <Link
            href={c.franchisePlaybook.aboutHref}
            className="mt-4 inline-block font-semibold text-maroon hover:text-maroon-dark"
          >
            {c.franchisePlaybook.aboutLabel} →
          </Link>
        </Section>
      )}

      {/* Project examples */}
      {projects.length > 0 ? (
        <Section muted={!c.franchisePlaybook}>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              {c.proofHeading ? <Eyebrow>Proof</Eyebrow> : null}
              <h2
                className={`text-2xl font-bold text-ink sm:text-3xl ${c.proofHeading ? 'mt-3' : ''}`}
              >
                {c.proofHeading || 'Recent work'}
              </h2>
              {c.proofIntro && (
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-body">{c.proofIntro}</p>
              )}
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-maroon hover:text-maroon-dark"
            >
              See more projects →
            </Link>
          </div>
          <div
            className={`grid gap-6 sm:grid-cols-2 ${projects.length === 3 ? 'lg:grid-cols-3' : ''}`}
          >
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      ) : null}

      {!c.costTable ? (
        <Section muted={projects.length === 0}>{rangeAndTable}</Section>
      ) : null}

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

      {c.relatedReading?.length ? (
        <Section muted>
          <RelatedReading items={c.relatedReading} />
        </Section>
      ) : null}

      {c.crossLinks?.length ? (
        <Section>
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Also on this site</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {c.crossLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-[2px] border border-hairline bg-paper p-7 transition-colors hover:border-maroon"
              >
                <div className="text-xl font-bold text-ink group-hover:text-maroon">{link.title}</div>
                <p className="mt-2 text-body">{link.blurb}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-maroon">
                  {link.title} →
                </span>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

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

      {extras && (
        <Section muted>
          <NapBlock phone={phone} phoneRaw={phoneRaw} email={email} />
        </Section>
      )}

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading={
          c.ctaHeading || (extras ? 'Got a space that needs a buildout?' : undefined)
        }
        body={
          c.ctaBody ||
          (extras
            ? "Call us. We'll come walk the space and tell you what we think it'll take."
            : undefined)
        }
      />
    </>
  );
}
