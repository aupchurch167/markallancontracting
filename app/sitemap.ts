import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { SERVICE_SLUGS, MARKETS } from '@/lib/site-data';
import { FALLBACK_CITIES } from '@/lib/fallback-cities';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { getAllProjectSlugs } from '@/lib/projects';
import {
  getServiceCitySlugs,
  getCitySlugs,
  getPostSlugs,
} from '@/lib/queries';

/**
 * Generated sitemap. Excludes /lp/* (campaign) and all gated routes
 * (/trade-partners/*, /development). Matrix, project, and post URLs come from
 * Sanity so pages that don't exist yet never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticPaths = [
    '',
    '/services',
    '/how-we-build',
    '/pre-construction',
    '/construction-process',
    '/new-construction',
    '/projects',
    '/insights',
    '/contact',
    ...SERVICE_SLUGS.map((s) => `/services/${s}`),
    ...MARKETS.map((m) => `/markets/${m.slug}`),
  ];

  const [serviceCities, cities, projects, posts] = await Promise.all([
    getServiceCitySlugs(),
    getCitySlugs(),
    getAllProjectSlugs(),
    getPostSlugs(),
  ]);

  // Merge Sanity-authored slugs with the authored fallbacks (dedup by path).
  const cityPaths = new Set([
    ...cities.map((c) => `/locations/${c}`),
    ...FALLBACK_CITIES.map((c) => `/locations/${c.slug}`),
  ]);
  const postPaths = new Set([
    ...posts.map((p) => `/insights/${p}`),
    ...FALLBACK_POSTS.map((p) => `/insights/${p.slug}`),
  ]);

  const dynamicPaths = [
    ...serviceCities.map((p) => `/services/${p.service}/${p.city}`),
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
