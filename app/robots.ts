import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { FEATURES } from '@/lib/site-data';

export default function robots(): MetadataRoute.Robots {
  // Campaign pages and the embedded Studio always stay out. Trade Partners is
  // disallowed only while gated (owner decision: it goes in the main nav once
  // real capability figures arrive — flip FEATURES.tradePartnersPublished).
  const disallow = ['/lp/', '/admin', '/api/'];
  if (!FEATURES.tradePartnersPublished) disallow.push('/trade-partners');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
