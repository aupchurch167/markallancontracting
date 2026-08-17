import type { Metadata } from 'next';

// CMS edits must appear immediately; the DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, getSiteSettings } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { urlForImage } from '@/lib/image';
import { EditorialCTA } from '@/components/EditorialCTA';
import { clusterTitle } from '@/lib/clusters';
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
  featured?: boolean;
}

export default async function InsightsPage() {
  const [sanityPosts, settings] = await Promise.all([getPosts(), getSiteSettings()]);
  const { phone, phoneRaw, email } = settings;

  const sanitySlugs = new Set(sanityPosts.map((p) => p.slug));
  const cards: Card[] = [
    ...sanityPosts.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
      imageUrl: urlForImage(p.mainImage)?.width(800).height(500).url() || p.heroImageUrl || undefined,
      featured: p.featured,
    })),
    ...FALLBACK_POSTS.filter((p) => !sanitySlugs.has(p.slug)).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
    })),
  ];

  const featured = cards.find((c) => c.featured) || cards[0];
  const rest = cards.filter((c) => c.slug !== featured?.slug);

  return (
    <>
      <div className="container-page pt-16 sm:pt-[72px]">
        <div className="kicker mb-5 text-maroon">From the field</div>
        <div className="mb-11 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h1 className="font-display text-[15vw] leading-[0.92] sm:text-[72px] lg:text-[88px]">Insights</h1>
          <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted lg:mb-2">
            What we&apos;ve learned building commercial space since 1999. No fluff — the stuff we tell clients on the phone.
          </p>
        </div>

        {/* Featured */}
        {featured && (
          <Link href={`/insights/${featured.slug}`} className="group mb-12 grid border border-hairline transition-colors hover:border-maroon lg:grid-cols-[1.3fr_1fr]">
            <div className="relative h-[240px] bg-paper-alt lg:h-[400px]">
              {featured.imageUrl && <Image src={featured.imageUrl} alt={featured.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />}
            </div>
            <div className="flex flex-col justify-center p-10">
              <div className="mb-3.5 text-[12px] font-semibold uppercase tracking-label text-maroon">
                Featured{featured.cluster ? ` · ${clusterTitle(featured.cluster)}` : ''}
              </div>
              <h2 className="mb-4 font-display text-[36px] leading-[0.98] text-ink sm:text-[42px]">{featured.title}</h2>
              {featured.excerpt && <p className="mb-5 text-[16px] leading-relaxed text-muted">{featured.excerpt}</p>}
              <span className="text-[14px] font-semibold text-faint">Read article →</span>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid gap-px border border-hairline bg-hairline pb-0 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.slug} href={`/insights/${p.slug}`} className="group flex min-h-[220px] flex-col bg-paper p-8 transition-colors hover:bg-[#FFFFFF]">
                {p.cluster && <div className="mb-3.5 text-[12px] font-semibold uppercase tracking-label text-maroon">{clusterTitle(p.cluster)}</div>}
                <div className="mb-3 font-display text-[28px] font-semibold uppercase leading-[1.02] text-ink">{p.title}</div>
                {p.excerpt && <div className="text-[15px] leading-relaxed text-muted">{p.excerpt}</div>}
                <div className="mt-auto pt-4 text-[13px] text-faint">Read article →</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-20">
        <EditorialCTA phone={phone} phoneRaw={phoneRaw} email={email} />
      </div>
    </>
  );
}
