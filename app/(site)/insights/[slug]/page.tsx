import type { Metadata } from 'next';

// Render dynamically: CMS edits (covers, text, photos) must appear immediately,
// and a CDN edge can't serve a stale page. The DB is only reachable at runtime.
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost, getSiteSettings } from '@/lib/queries';
import {
  FALLBACK_POSTS,
  FALLBACK_POSTS_BY_SLUG,
  type FallbackPost,
} from '@/lib/fallback-insights';
import { urlForImage } from '@/lib/image';
import { telHref } from '@/lib/constants';
import { PortableText } from '@/components/PortableText';
import { MarkdownBody } from '@/components/MarkdownBody';
import { FallbackArticle } from '@/components/FallbackArticle';
import { JsonLd } from '@/components/JsonLd';
import { articleSchema } from '@/lib/schema';
import { clusterTitle } from '@/lib/clusters';
import { pageMetadata } from '@/lib/seo';
import type { PortableTextBlock } from '@portabletext/react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  const fb = FALLBACK_POSTS_BY_SLUG[slug];
  const title = post?.metaTitle || post?.title || fb?.metaTitle || fb?.title;
  if (!title) return {};
  return pageMetadata({
    title,
    description: post?.metaDescription || post?.excerpt || fb?.metaDescription || '',
    path: `/insights/${slug}`,
    ogImage:
      urlForImage(post?.mainImage)?.width(1200).height(630).url() ||
      post?.heroImageUrl ||
      undefined,
  });
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Rough reading time from either Portable Text or the fallback block union. */
function readingTime(
  sanityBody?: PortableTextBlock[],
  fb?: FallbackPost,
  markdown?: string,
): string {
  let words = 0;
  if (markdown) {
    words = markdown.split(/\s+/).filter(Boolean).length;
  } else if (sanityBody?.length) {
    for (const b of sanityBody as any[]) {
      if (b?._type === 'block' && Array.isArray(b.children)) {
        words += b.children.map((c: any) => c.text || '').join(' ').split(/\s+/).filter(Boolean).length;
      }
    }
  } else if (fb) {
    for (const block of fb.body) {
      if ('p' in block) words += block.p.split(/\s+/).length;
      else if ('h2' in block) words += block.h2.split(/\s+/).length;
      else if ('ul' in block) words += block.ul.join(' ').split(/\s+/).length;
      else if ('ol' in block) words += block.ol.join(' ').split(/\s+/).length;
    }
  }
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sanityPost = await getPost(slug);
  const fb: FallbackPost | undefined = FALLBACK_POSTS_BY_SLUG[slug];
  if (!sanityPost && !fb) notFound();

  const { phoneRaw } = await getSiteSettings();

  const title = sanityPost?.title || fb!.title;
  const authorName = sanityPost?.author?.name || fb?.author;
  const authorRole = sanityPost?.author?.role;
  const authorSlug = sanityPost?.author?.slug;
  const publishedAt = sanityPost?.publishedAt || fb?.publishedAt;
  const clusterValue = sanityPost?.cluster || fb?.cluster;
  const cluster = clusterTitle(clusterValue);
  const description = sanityPost?.metaDescription || sanityPost?.excerpt || fb?.excerpt;
  const heroUrl =
    urlForImage(sanityPost?.mainImage)?.width(1600).height(900).url() ||
    sanityPost?.heroImageUrl;
  const rt = readingTime(sanityPost?.body, fb, sanityPost?.bodyMarkdown);
  const tags = sanityPost?.tags;

  // Related: Sanity-curated first, else other posts in the same cluster.
  const related =
    sanityPost?.relatedPosts?.length
      ? sanityPost.relatedPosts.map((r) => ({ slug: r.slug, title: r.title }))
      : FALLBACK_POSTS.filter((p) => p.cluster === clusterValue && p.slug !== slug)
          .slice(0, 2)
          .map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <>
      <JsonLd
        data={articleSchema({
          title,
          description,
          author: authorName,
          publishedAt,
          path: `/insights/${slug}`,
        })}
      />

      {/* Header */}
      <div className="container-page">
        <div className="mx-auto max-w-[820px] pt-16">
          <Link href="/insights" className="text-[14px] font-semibold text-maroon hover:text-maroon-light">
            ← All insights
          </Link>
          {cluster && <div className="kicker mb-5 mt-7 text-maroon">{cluster}</div>}
          <h1 className="mb-6 font-display text-[42px] leading-[0.95] sm:text-[68px]">{title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-hairline pb-9 text-[14px] text-faint">
            {authorName && (
              <span className="font-semibold text-body">
                {authorSlug ? (
                  <Link href="/team" className="hover:text-maroon">
                    {authorName}
                  </Link>
                ) : (
                  authorName
                )}
                {authorRole && <span className="font-normal text-faint"> · {authorRole}</span>}
              </span>
            )}
            {publishedAt && (
              <>
                <span>·</span>
                <span>{formatDate(publishedAt)}</span>
              </>
            )}
            <span>·</span>
            <span>{rt}</span>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {heroUrl && (
        <div className="container-page">
          <div className="mx-auto max-w-[1000px] pt-10">
            <div className="relative h-[280px] sm:h-[440px]">
              <Image src={heroUrl} alt={sanityPost?.mainImage?.alt || title} fill priority sizes="1000px" className="object-cover" />
            </div>
            {sanityPost?.mainImage?.alt && <div className="pt-3 text-[13px] italic text-faint">{sanityPost.mainImage.alt}</div>}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container-page">
        <div className="prose-article mx-auto max-w-[720px] pt-12">
          {sanityPost?.bodyMarkdown ? (
            <MarkdownBody>{sanityPost.bodyMarkdown}</MarkdownBody>
          ) : sanityPost?.body?.length ? (
            <PortableText value={sanityPost.body} />
          ) : fb ? (
            <FallbackArticle body={fb.body} />
          ) : null}
        </div>

        {tags && tags.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-[720px] flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-[2px] border border-hairline px-3 py-1 text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Mid-article CTA card */}
        <div className="mx-auto max-w-[720px] pb-2 pt-14">
          <div className="flex flex-col items-start justify-between gap-6 bg-ink p-10 text-cream sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 font-display text-[30px] font-bold uppercase leading-none text-cream">Want a real number for your space?</div>
              <div className="text-[15px] text-cream-muted">Five minutes on the phone. We&apos;ll tell you if we&apos;re a fit.</div>
            </div>
            <a href={telHref(phoneRaw)} data-tracked-phone className="btn-maroon-ondark whitespace-nowrap">
              Call us
            </a>
          </div>
        </div>
      </div>

      {/* Keep reading */}
      {related.length > 0 && (
        <div className="mt-2 border-t border-hairline">
          <div className="container-page py-14">
            <div className="mb-7 flex items-baseline justify-between">
              <h2 className="font-display text-[36px] sm:text-[40px]">Keep reading</h2>
              <Link href="/insights" className="text-[15px] font-semibold text-maroon hover:text-maroon-light">
                All insights →
              </Link>
            </div>
            <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
              {related.slice(0, 3).map((r) => (
                <Link key={r.slug} href={`/insights/${r.slug}`} className="bg-paper p-7 transition-colors hover:bg-[#FFFFFF]">
                  <div className="font-display text-[26px] font-semibold uppercase leading-[1.02] text-ink">{r.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
