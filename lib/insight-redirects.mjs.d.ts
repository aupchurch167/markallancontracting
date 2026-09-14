export const INSIGHT_CANONICAL_REDIRECTS: {
  source: string;
  destination: string;
  statusCode: 301;
}[];

export const REDIRECTED_INSIGHT_SLUGS: Set<string>;

export function isRedirectedInsightSlug(slug: string): boolean;

export function excludeRedirectedInsights<T extends { slug: string }>(items: T[]): T[];
