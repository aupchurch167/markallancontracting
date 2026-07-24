import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getPostSlugs, getSiteSettings } from '@/lib/queries';
import { CallCTA } from '@/components/CallCTA';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/Section';
import { PortableText } from '@/components/PortableText';
import { JsonLd } from '@/components/JsonLd';
import { articleSchema } from '@/lib/schema';
import { clusterTitle } from '@/lib/clusters';
import { pageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '',
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
  const post = await getPost(slug);
  if (!post) notFound();

  const { phone, phoneRaw } = await getSiteSettings();
  const cluster = clusterTitle(post.cluster);

  return (
    <>
      <Breadcrumbs
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: post.title, path: `/insights/${slug}` },
        ]}
      />
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.metaDescription || post.excerpt,
          author: post.author,
          publishedAt: post.publishedAt,
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
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-stone-400">
            {post.author && <span>{post.author}</span>}
            {post.author && post.publishedAt && <span>·</span>}
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
          </div>
          <div className="mt-8 text-lg">
            <PortableText value={post.body} />
          </div>
        </article>
      </Section>

      <CallCTA phone={phone} phoneRaw={phoneRaw} />
    </>
  );
}
