/**
 * Projects are now managed entirely in the CMS (Postgres) via /admin. The
 * hardcoded starter projects that used to live here were removed at the owner's
 * request once real projects were authored in the CMS, so the /projects section
 * shows only CMS content. The type and (now empty) exports are kept so the
 * fallback-aware call sites keep working with zero code changes.
 */
export interface FallbackProject {
  slug: string;
  title: string;
  clientType: string;
  serviceSlug: string;
  cityName?: string;
  cityState?: string;
  scopeSummary: string;
  timeline?: string;
  challenge: string[];
  solution: string[];
  images: { url: string; alt: string }[];
  featured: boolean;
}

export const FALLBACK_PROJECTS: FallbackProject[] = [];

export const FALLBACK_PROJECTS_BY_SLUG: Record<string, FallbackProject> =
  Object.fromEntries(FALLBACK_PROJECTS.map((p) => [p.slug, p]));
