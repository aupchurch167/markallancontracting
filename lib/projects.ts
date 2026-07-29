import {
  getProjects,
  getFeaturedProjects,
  getProjectSlugs,
} from './queries';
import { urlForImage } from '@/lib/image';
import { FALLBACK_PROJECTS, FALLBACK_PROJECTS_BY_SLUG } from './fallback-projects';
import type { ProjectCard as SanityCard } from './types';

/** Normalized card shape rendered by components/ProjectCard. */
export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  clientType?: string;
  location?: string;
  scopeSummary?: string;
  imageUrl?: string;
}

function locationOf(cityName?: string, cityState?: string): string | undefined {
  return cityName && cityState ? `${cityName}, ${cityState.toUpperCase()}` : undefined;
}

function sanityToSummary(c: SanityCard): ProjectSummary {
  return {
    id: c._id,
    title: c.title,
    slug: c.slug,
    clientType: c.clientType,
    location: locationOf(c.cityName, c.cityState),
    scopeSummary: c.scopeSummary,
    imageUrl:
      urlForImage(c.image)?.width(800).height(600).url() ||
      c.heroImageUrl ||
      c.imageUrls?.[0]?.url ||
      undefined,
  };
}

function fallbackToSummary(slug: string): ProjectSummary {
  const p = FALLBACK_PROJECTS_BY_SLUG[slug];
  return {
    id: p.slug,
    title: p.title,
    slug: p.slug,
    clientType: p.clientType,
    location: locationOf(p.cityName, p.cityState),
    scopeSummary: p.scopeSummary,
    imageUrl: p.images[0]?.url,
  };
}

/** Convert a set of Sanity project cards (e.g. relatedProjects) to summaries. */
export function summariesFromSanityCards(cards: SanityCard[]): ProjectSummary[] {
  return cards.map(sanityToSummary);
}

/** All delivered projects — Sanity first, then authored fallback (deduped by slug). */
export async function getAllProjectSummaries(): Promise<ProjectSummary[]> {
  const sanity = await getProjects();
  const seen = new Set(sanity.map((p) => p.slug));
  return [
    ...sanity.map(sanityToSummary),
    ...FALLBACK_PROJECTS.filter((p) => !seen.has(p.slug)).map((p) => fallbackToSummary(p.slug)),
  ];
}

/** Up to three featured cards for the homepage. */
export async function getFeaturedSummaries(): Promise<ProjectSummary[]> {
  const sanity = await getFeaturedProjects();
  if (sanity.length) return sanity.slice(0, 3).map(sanityToSummary);
  return FALLBACK_PROJECTS.filter((p) => p.featured)
    .slice(0, 3)
    .map((p) => fallbackToSummary(p.slug));
}

/** Fallback projects for a given service, as cards (used on service hubs). */
export function getFallbackSummariesForService(serviceSlug: string): ProjectSummary[] {
  return FALLBACK_PROJECTS.filter((p) => p.serviceSlug === serviceSlug).map((p) =>
    fallbackToSummary(p.slug),
  );
}

/** Union of Sanity + fallback slugs for generateStaticParams. */
export async function getAllProjectSlugs(): Promise<string[]> {
  const sanity = await getProjectSlugs();
  return Array.from(new Set([...sanity, ...FALLBACK_PROJECTS.map((p) => p.slug)]));
}
