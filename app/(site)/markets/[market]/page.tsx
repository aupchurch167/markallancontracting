import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMarket, getSiteSettings } from '@/lib/queries';
import { MARKETS, SERVICES } from '@/lib/site-data';
import { MARKET_CONTENT } from '@/lib/fallback-markets';
import { CallButton } from '@/components/PhoneLink';
import { CallCTA } from '@/components/CallCTA';
import { PlanSteps } from '@/components/PlanSteps';
import { ProjectCard } from '@/components/ProjectCard';
import { summariesFromSanityCards } from '@/lib/projects';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section, Eyebrow } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return MARKETS.map((m) => ({ market: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string }>;
}): Promise<Metadata> {
  const { market } = await params;
  const def = MARKETS.find((m) => m.slug === market);
  if (!def) return {};
  const c = MARKET_CONTENT[def.slug];
  const doc = await getMarket(market);
  return pageMetadata({
    title: doc?.metaTitle || c.metaTitle,
    description: doc?.metaDescription || c.metaDescription,
    path: `/markets/${market}`,
  });
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ market: string }>;
}) {
  const { market } = await params;
  const def = MARKETS.find((m) => m.slug === market);
  if (!def) notFound();

  const c = MARKET_CONTENT[def.slug];
  const [doc, settings] = await Promise.all([getMarket(market), getSiteSettings()]);
  const { phone, phoneRaw } = settings;

  const relevantServices =
    doc?.relevantServices?.length
      ? doc.relevantServices
      : SERVICES.map((s) => ({ title: s.name, slug: s.slug }));

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Who We Work For', path: '/markets' },
          { name: def.name, path: `/markets/${market}` },
        ]}
      />

      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <Eyebrow>{def.name}</Eyebrow>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {doc?.h1 || c.h1}
          </h1>
          <div className="mt-8">
            <CallButton phone={phone} phoneRaw={phoneRaw} />
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>What you&apos;re dealing with</Eyebrow>
          {doc?.audienceProblem?.length ? (
            <div className="mt-3 text-lg">
              <PortableText value={doc.audienceProblem} />
            </div>
          ) : (
            <p className="mt-3 text-lg leading-relaxed text-stone-600">{c.problem}</p>
          )}
        </div>
      </Section>

      <Section muted>
        <Eyebrow>How it works</Eyebrow>
        <div className="mt-8">
          <PlanSteps />
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">What we build for you</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relevantServices.map((s) => (
            <Link
              key={s.slug}
              href={`/project-types/${s.slug}`}
              className="rounded-lg border border-stone-200 bg-paper p-5 font-semibold text-navy transition-colors hover:border-accent hover:text-accent"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </Section>

      {doc?.relatedProjects?.length ? (
        <Section muted>
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Work in this space</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {summariesFromSanityCards(doc.relatedProjects).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      ) : null}

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
