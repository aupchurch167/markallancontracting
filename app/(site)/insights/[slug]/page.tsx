import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getPostSlugs, getSiteSettings } from '@/lib/queries';
import {
  FALLBACK_POSTS,
  FALLBACK_POSTS_BY_SLUG,
  type FallbackPost,
} from '@/lib/fallback-insights';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { FallbackArticle } from '@/components/FallbackArticle';
import { JsonLd } from '@/components/JsonLd';
import { articleSchema } from '@/lib/schema';
import { clusterTitle } from '@/lib/clusters';
import { pageMetadata } from '@/lib/seo';

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
  });
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
  const author = sanityPost?.author || fb?.author;
  const publishedAt = sanityPost?.publishedAt || fb?.publishedAt;
  const clusterValue = sanityPost?.cluster || fb?.cluster;
  const cluster = clusterTitle(clusterValue);
  const description = sanityPost?.metaDescription || sanityPost?.excerpt || fb?.excerpt;

  // Related — other posts in the same cluster.
  const related = FALLBACK_POSTS.filter(
    (p) => p.cluster === clusterValue && p.slug !== slug,
  ).slice(0, 2);

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
          author,
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
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-400">
            {author && <span>{author}</span>}
            {author && publishedAt && <span>·</span>}
            {publishedAt && <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>}
          </div>
          <div className="mt-8 text-lg">
            {sanityPost?.body?.length ? (
              <PortableText value={sanityPost.body} />
            ) : fb ? (
              <FallbackArticle body={fb.body} />
            ) : null}
          </div>

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
