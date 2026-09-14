import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCity,
  getCitySlugs,
  getServicesForCity,
  getSiteSettings,
} from '@/lib/queries';
import {
  FALLBACK_CITIES,
  FALLBACK_CITIES_BY_SLUG,
  type CityProofProject,
} from '@/lib/fallback-cities';
import { SERVICES } from '@/lib/site-data';
import { CONTACT } from '@/lib/constants';
import { CallButton, PhoneLink } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { FAQ } from '@/components/FAQ';
import { ProjectCard } from '@/components/ProjectCard';
import { getSummariesForSlugs, type ProjectSummary } from '@/lib/projects';
import { pageMetadata } from '@/lib/seo';

// CMS project photos on the Atlanta proof strip must appear at request time.
export const dynamic = 'force-dynamic';

function proofToSummary(p: CityProofProject): ProjectSummary {
  return {
    id: p.slug,
    title: p.title,
    slug: p.slug,
    clientType: p.clientType,
    location:
      p.cityName && p.cityState ? `${p.cityName}, ${p.cityState.toUpperCase()}` : undefined,
    scopeSummary: p.scopeSummary,
  };
}

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
    title: fb?.metaTitle || `Commercial General Contractor in ${label}`,
    description:
      fb?.metaDescription ||
      `Commercial buildouts, renovations, and repairs in ${label}. Family-owned since 1999. Get a scoped number, not a range.`,
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

  const [servicesInCity, settings, proofProjects] = await Promise.all([
    getServicesForCity(city),
    getSiteSettings(),
    getSummariesForSlugs((fb?.proofProjects || []).map(proofToSummary)),
  ]);
  const { phone, phoneRaw, email } = settings;

  const name = doc?.name || fb!.name;
  const county = doc?.county || fb?.county;
  const state = (doc?.state || fb!.state).toUpperCase();
  const label = `${name}, ${state}`;
  const h1 = fb?.h1 || `Commercial General Contractor in ${label}`;
  const servicesHeading = fb?.servicesHeading || `What we do in ${name}`;
  const jurisdictionHeading =
    fb?.jurisdictionHeading || `Permitting in ${county || name}`;

  const serviceCards =
    servicesInCity.length > 0
      ? servicesInCity.map((s) => ({
          slug: s.slug,
          name: s.title,
          href: `/project-types/${s.slug}/${city}`,
          outcome: fb?.serviceOutcomes?.[s.slug],
        }))
      : SERVICES.map((s) => ({
          slug: s.slug,
          name: s.name,
          href: `/project-types/${s.slug}`,
          outcome: fb?.serviceOutcomes?.[s.slug],
        }));

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
            {h1}
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
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
            <>
              <p className="leading-relaxed text-body">{fb.intro}</p>
              {fb.introAfter?.map((p) => (
                <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-body">
                  {p}
                </p>
              ))}
            </>
          ) : null}
        </div>
      </Section>

      {/* Service grid — links to matrix pages where they exist, else service hubs */}
      <Section muted>
        <Eyebrow>{servicesHeading}</Eyebrow>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map((s) => (
            <Link
              key={s.slug}
              href={s.href}
              className="group rounded-[2px] border border-hairline bg-paper p-5 transition-colors hover:border-maroon"
            >
              <div className="font-semibold text-ink group-hover:text-maroon">{s.name}</div>
              {s.outcome && (
                <p className="mt-2 text-sm leading-relaxed text-body">{s.outcome}</p>
              )}
            </Link>
          ))}
        </div>
      </Section>

      {/* Jurisdiction note */}
      {(doc?.jurisdictionNote?.length || fb?.jurisdiction?.length) && (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>{jurisdictionHeading}</Eyebrow>
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
            {fb?.jurisdictionBullets?.length ? (
              <ul className="mt-2 space-y-2 text-body">
                {fb.jurisdictionBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 text-maroon">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {fb?.jurisdictionLink && (
              <Link
                href={fb.jurisdictionLink.href}
                className="mt-6 inline-block font-semibold text-maroon hover:text-maroon-dark"
              >
                {fb.jurisdictionLink.label} →
              </Link>
            )}
          </div>
        </Section>
      )}

      {fb?.metroPlaces?.length ? (
        <Section muted>
          <Eyebrow>{fb.metroHeading || `Metro jurisdictions we work`}</Eyebrow>
          {fb.metroIntro && (
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-body">{fb.metroIntro}</p>
          )}
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {fb.metroPlaces.map((place) => (
              <li key={place.name} className="rounded-[2px] border border-hairline bg-paper p-5">
                <div className="font-semibold text-ink">{place.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-body">{place.note}</p>
              </li>
            ))}
          </ul>
          {fb.metroTimingNote && (
            <p className="mt-8 max-w-3xl leading-relaxed text-body">
              {fb.metroTimingNote}{' '}
              <Link
                href="/insights/commercial-buildout-timeline"
                className="font-semibold text-maroon hover:text-maroon-dark"
              >
                How we think about the rest of the calendar →
              </Link>
            </p>
          )}
        </Section>
      ) : null}

      {proofProjects.length > 0 && (
        <Section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>{fb?.proofHeading || 'Recent work'}</Eyebrow>
              {fb?.proofIntro && (
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-body">{fb.proofIntro}</p>
              )}
            </div>
            <Link
              href="/projects"
              className="text-sm font-semibold text-maroon hover:text-maroon-dark"
            >
              See more projects →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proofProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}

      {fb?.costBands?.length ? (
        <Section muted>
          <Eyebrow>{fb.costHeading || 'Cost and timeline'}</Eyebrow>
          {fb.costIntro && (
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-body">{fb.costIntro}</p>
          )}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {fb.costBands.map((band) => {
              const inner = (
                <>
                  <div className="text-sm font-semibold uppercase tracking-wider text-faint">
                    {band.label}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-ink">{band.value}</div>
                </>
              );
              return band.href ? (
                <Link
                  key={band.label}
                  href={band.href}
                  className="rounded-[2px] border border-hairline bg-paper p-7 transition-colors hover:border-maroon"
                >
                  {inner}
                </Link>
              ) : (
                <div key={band.label} className="rounded-[2px] border border-hairline bg-paper p-7">
                  {inner}
                </div>
              );
            })}
          </div>
          <p className="mt-8 max-w-3xl leading-relaxed text-body">
            Construction duration for this size of interior is usually the predictable part.
            Permitting and long-lead items move the date.{' '}
            <Link
              href="/insights/tenant-improvement-cost-per-square-foot"
              className="font-semibold text-maroon hover:text-maroon-dark"
            >
              What a TI actually costs per square foot
            </Link>
            {' · '}
            <Link
              href="/insights/commercial-buildout-timeline"
              className="font-semibold text-maroon hover:text-maroon-dark"
            >
              How long a commercial buildout takes
            </Link>
            .
          </p>
        </Section>
      ) : null}

      {fb?.faqs?.length ? (
        <Section>
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Common questions</h2>
            <div className="mt-6">
              <FAQ faqs={fb.faqs} />
            </div>
          </div>
        </Section>
      ) : null}

      {fb?.relatedReading?.length ? (
        <Section muted>
          <div className="mb-7 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Related reading</h2>
            <Link href="/insights" className="text-sm font-semibold text-maroon hover:text-maroon-dark">
              All insights →
            </Link>
          </div>
          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
            {fb.relatedReading.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="bg-paper p-7 transition-colors hover:bg-[#FFFFFF]"
              >
                <div className="font-display text-[22px] font-semibold uppercase leading-[1.05] text-ink">
                  {r.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-body">{r.blurb}</p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      {fb?.proofProjects?.length || fb?.faqs?.length ? (
        <Section>
          <div className="max-w-3xl">
            <Eyebrow>Atlanta office</Eyebrow>
            <address className="mt-4 space-y-1 text-lg not-italic leading-relaxed text-body">
              <div className="font-semibold text-ink">Mark Allan Contracting</div>
              <div>{CONTACT.address.street}</div>
              <div>
                {CONTACT.address.city}, {CONTACT.address.state} {CONTACT.address.zip}
              </div>
              <div className="pt-2">
                <PhoneLink
                  phone={phone}
                  phoneRaw={phoneRaw}
                  className="font-semibold text-maroon hover:text-maroon-dark"
                />
              </div>
              <div>
                <a href={`mailto:${email}`} className="text-maroon hover:text-maroon-dark">
                  {email}
                </a>
              </div>
            </address>
          </div>
        </Section>
      ) : null}

      <CallCTA
        phone={phone}
        phoneRaw={phoneRaw}
        heading={`Building in ${name}?`}
        body="Call us. We'll come walk the space and tell you what we think it'll take."
      />
    </>
  );
}
