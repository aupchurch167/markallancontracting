import type { Metadata } from 'next';

// ISR: refetch CMS content at runtime (the DB is unreachable at build).
export const revalidate = 300;
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getPost, getPostSlugs, getSiteSettings } from '@/lib/queries';
import {
  FALLBACK_POSTS,
  FALLBACK_POSTS_BY_SLUG,
  type FallbackPost,
} from '@/lib/fallback-insights';
import { urlForImage } from '@/lib/image';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { MarkdownBody } from '@/components/MarkdownBody';
import { FallbackArticle } from '@/components/FallbackArticle';
import { JsonLd } from '@/components/JsonLd';
import { articleSchema } from '@/lib/schema';
import { clusterTitle } from '@/lib/clusters';
import { pageMetadata } from '@/lib/seo';
import type { PortableTextBlock } from '@portabletext/react';

export async function generateStaticParams() {
  const sanitySlugs = await getPostSlugs();
  const all = new Set([...sanitySlugs, ...FALLBACK_POSTS.map((p) => p.slug)]);
  return Array.from(all).map((slug) => ({ slug }));
}

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

  const { phone, phoneRaw } = await getSiteSettings();

  const title = sanityPost?.title || fb!.title;
  const authorName = sanityPost?.author?.name || fb?.author;
  const authorRole = sanityPost?.author?.role;
  const authorPhoto = urlForImage(sanityPost?.author?.photo)?.width(80).height(80).url();
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
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: title, path: `/insights/${slug}` },
        ]}
      />
      <JsonLd
        data={articleSchema({
          title,
          description,
          author: authorName,
          publishedAt,
          path: `/insights/${slug}`,
        })}
      />

      <Section>
        <article className="mx-auto max-w-prose">
          {cluster && (
            <Link href="/insights" className="text-sm font-semibold text-accent hover:text-accent-700">
              {cluster}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{title}</h1>

          {/* Byline */}
          <div className="mt-5 flex items-center gap-3">
            {authorPhoto && (
              <span className="relative h-10 w-10 overflow-hidden rounded-full bg-stone-100">
                <Image src={authorPhoto} alt={authorName || ''} fill sizes="40px" className="object-cover" />
              </span>
            )}
            <div className="text-sm text-stone-500">
              {authorName && (
                <span className="font-semibold text-navy">
                  {authorSlug ? (
                    <Link href="/team" className="hover:text-accent">{authorName}</Link>
                  ) : (
                    authorName
                  )}
                </span>
              )}
              {authorRole && <span className="text-stone-400"> · {authorRole}</span>}
              <div className="text-xs text-stone-400">
                {[formatDate(publishedAt), rt].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>

          {/* Hero image */}
          {heroUrl && (
            <div className="relative mt-8 aspect-video overflow-hidden rounded-xl bg-stone-100">
              <Image src={heroUrl} alt={sanityPost?.mainImage?.alt || title} fill priority sizes="720px" className="object-cover" />
            </div>
          )}

          <div className="mt-8 text-lg">
            {sanityPost?.bodyMarkdown ? (
              <MarkdownBody>{sanityPost.bodyMarkdown}</MarkdownBody>
            ) : sanityPost?.body?.length ? (
              <PortableText value={sanityPost.body} />
            ) : fb ? (
              <FallbackArticle body={fb.body} />
            ) : null}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  {t}
                </span>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-14 border-t border-stone-200 pt-8">
              <div className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                Related
              </div>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/insights/${r.slug}`} className="font-medium text-accent hover:text-accent-700">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
