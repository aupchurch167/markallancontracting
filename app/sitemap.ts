import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { SERVICE_SLUGS, MARKETS } from '@/lib/site-data';
import {
  getServiceCitySlugs,
  getCitySlugs,
  getProjectSlugs,
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
    getProjectSlugs(),
    getPostSlugs(),
  ]);

  const dynamicPaths = [
    ...serviceCities.map((p) => `/services/${p.service}/${p.city}`),
    ...cities.map((c) => `/locations/${c}`),
    ...projects.map((p) => `/projects/${p}`),
    ...posts.map((p) => `/insights/${p}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
