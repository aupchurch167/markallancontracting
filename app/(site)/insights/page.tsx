import type { Metadata } from 'next';

// ISR: refetch CMS content at runtime (the DB is unreachable at build).
export const revalidate = 300;
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, getSiteSettings } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { urlForImage } from '@/lib/image';
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
  imageUrl?: string;
  authorName?: string;
  featured?: boolean;
}

export default async function InsightsPage() {
  const [sanityPosts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const { phone, phoneRaw } = settings;

  const sanitySlugs = new Set(sanityPosts.map((p) => p.slug));
  const cards: Card[] = [
    ...sanityPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
      imageUrl:
        urlForImage(p.mainImage)?.width(800).height(500).url() || p.heroImageUrl || undefined,
      authorName: p.author?.name,
      featured: p.featured,
    })),
    ...FALLBACK_POSTS.filter((p) => !sanitySlugs.has(p.slug)).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
      authorName: p.author,
    })),
  ];

  const featured = cards.find((c) => c.featured);

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

      {/* Featured post */}
      {featured && (
        <Section>
          <Link
            href={`/insights/${featured.slug}`}
            className="group grid gap-6 overflow-hidden rounded-xl border border-stone-200 bg-paper lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] bg-stone-100 lg:aspect-auto">
              {featured.imageUrl ? (
                <Image src={featured.imageUrl} alt={featured.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="flex h-full min-h-48 items-center justify-center text-sm text-stone-400">Featured</div>
              )}
            </div>
            <div className="flex flex-col justify-center p-7">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Featured</div>
              <h2 className="mt-2 text-2xl font-bold text-navy group-hover:text-accent">{featured.title}</h2>
              {featured.excerpt && <p className="mt-2 text-stone-600">{featured.excerpt}</p>}
              {featured.authorName && (
                <div className="mt-4 text-sm text-stone-400">By {featured.authorName}</div>
              )}
            </div>
          </Link>
        </Section>
      )}

      <Section muted={!!featured}>
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
                        className="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-paper transition-colors hover:border-accent"
                      >
                        {p.imageUrl && (
                          <div className="relative aspect-[16/10] bg-stone-100">
                            <Image src={p.imageUrl} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="text-lg font-semibold text-navy group-hover:text-accent">
                            {p.title}
                          </div>
                          {p.excerpt && <p className="mt-2 text-sm text-stone-600">{p.excerpt}</p>}
                          {p.authorName && (
                            <div className="mt-3 text-xs text-stone-400">By {p.authorName}</div>
                          )}
                        </div>
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
