import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { SITE } from '@/lib/constants';
import { SERVICE_SLUGS, MARKETS } from '@/lib/site-data';
import { FALLBACK_CITIES } from '@/lib/fallback-cities';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { REDIRECTED_INSIGHT_SLUGS } from '@/lib/insight-redirects.mjs';
import { getAllProjectSlugs } from '@/lib/projects';
import {
  getServiceCitySlugs,
  getCitySlugs,
  getPostSlugs,
} from '@/lib/queries';

// Request-time generation: published posts/projects live in Postgres, which is
// unreachable on Railway at build time. A static sitemap would only ship the
// authored fallback twins and miss every CMS keeper + project detail URL.
export const dynamic = 'force-dynamic';

/**
 * Generated sitemap. Excludes /lp/* (campaign) and all gated routes
 * (/trade-partners/*, /development). Matrix, project, and post URLs come from
 * the CMS (plus authored fallbacks) so pages that don't exist yet never appear.
 * Redirected thin insight twins are omitted — only keepers stay indexed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const base = SITE.url;
  const staticPaths = [
    '',
    // Service lines
    '/services',
    '/pre-construction',
    '/general-contracting',
    '/remodeling',
    '/new-construction',
    // Process
    '/how-we-build',
    '/construction-process',
    // Project types
    '/project-types',
    ...SERVICE_SLUGS.map((s) => `/project-types/${s}`),
    // Who we work for
    '/markets',
    ...MARKETS.map((m) => `/markets/${m.slug}`),
    // Other
    '/projects',
    '/insights',
    '/about',
    '/contact',
    '/team',
    '/privacy',
    '/terms',
  ];

  const [serviceCities, cities, projects, posts] = await Promise.all([
    getServiceCitySlugs(),
    getCitySlugs(),
    getAllProjectSlugs(),
    getPostSlugs(),
  ]);

  // Merge CMS-authored slugs with the authored fallbacks (dedup by path).
  const cityPaths = new Set([
    ...cities.map((c) => `/locations/${c}`),
    ...FALLBACK_CITIES.map((c) => `/locations/${c.slug}`),
  ]);
  const postPaths = new Set(
    [...posts, ...FALLBACK_POSTS.map((p) => p.slug)]
      .filter((slug) => !REDIRECTED_INSIGHT_SLUGS.has(slug))
      .map((slug) => `/insights/${slug}`),
  );

  const dynamicPaths = [
    ...serviceCities.map((p) => `/project-types/${p.service}/${p.city}`),
    ...cityPaths,
    ...projects.map((p) => `/projects/${p}`),
    ...postPaths,
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
