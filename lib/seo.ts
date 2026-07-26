import type { Metadata } from 'next';
import { SITE } from './constants';

/**
 * Build page metadata with a self-referencing canonical. Every route exports a
 * unique title + description via this. Service × city pages canonical to
 * themselves, never to the hub — pass their own path.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  ogImage,
  ogEyebrow,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  /** Small kicker rendered above the title on the generated OG card. */
  ogEyebrow?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  // Default to a branded, per-page generated card unless an explicit image is given.
  const ogTitle = title.split(' | ')[0].split(' · ')[0];
  const image =
    ogImage ||
    `/api/og?title=${encodeURIComponent(ogTitle)}${ogEyebrow ? `&eyebrow=${encodeURIComponent(ogEyebrow)}` : ''}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': `${SITE.url}/feed.xml` },
    },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
