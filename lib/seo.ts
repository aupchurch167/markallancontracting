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
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.name,
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}
