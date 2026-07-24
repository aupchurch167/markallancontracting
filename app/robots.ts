import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Campaign pages, embedded Studio, and gated Trade Partners stay out.
      disallow: ['/lp/', '/studio', '/trade-partners'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
