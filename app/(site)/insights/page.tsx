import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getSiteSettings } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { CallCTA } from '@/components/CallCTA';
import { Section } from '@/components/Section';
import { CLUSTERS } from '@/lib/clusters';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Insights — Commercial Construction Cost, Process & Guidance',
  description:
    'Straight answers on commercial construction cost, timeline, and process — for brokers, property managers, operators, and owners.',
  path: '/insights',
});

interface Card {
  slug: string;
  title: string;
  excerpt?: string;
  cluster?: string;
}

export default async function InsightsPage() {
  const [sanityPosts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const { phone, phoneRaw } = settings;

  // Sanity posts win per-slug; authored fallback fills the rest.
  const sanitySlugs = new Set(sanityPosts.map((p) => p.slug));
  const cards: Card[] = [
    ...sanityPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
    })),
    ...FALLBACK_POSTS.filter((p) => !sanitySlugs.has(p.slug)).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
    })),
  ];

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-page py-16 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold text-white sm:text-5xl">Insights</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-100/90">
            Straight answers on cost, timeline, and process — no filler.
          </p>
        </div>
      </section>

      <Section>
        <div className="space-y-14">
          {CLUSTERS.map((cluster) => {
            const clusterPosts = cards.filter((p) => p.cluster === cluster.value);
            return (
              <div key={cluster.value}>
                <h2 className="text-2xl font-bold text-navy">{cluster.title}</h2>
                <p className="mt-1 text-stone-600">{cluster.blurb}</p>
                {clusterPosts.length > 0 ? (
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {clusterPosts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/insights/${p.slug}`}
                        className="group rounded-lg border border-stone-200 p-6 transition-colors hover:border-accent"
                      >
                        <div className="text-lg font-semibold text-navy group-hover:text-accent">
                          {p.title}
                        </div>
                        {p.excerpt && <p className="mt-2 text-sm text-stone-600">{p.excerpt}</p>}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-stone-400">Posts coming soon.</p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
