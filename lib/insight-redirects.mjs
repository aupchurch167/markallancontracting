/**
 * Thin near-duplicate insight URLs that permanently 301 to the long-form keeper.
 *
 * Shared by next.config redirects() and the sitemap / RSS / Insights-hub
 * filters so the three stay in lockstep. Do not merge
 * comparing-commercial-construction-bids and compare-commercial-construction-bids
 * — those are related but distinct keepers.
 */

/** @typedef {{ source: string, destination: string, statusCode: 301 }} InsightRedirect */

/** @type {InsightRedirect[]} */
export const INSIGHT_CANONICAL_REDIRECTS = [
  {
    source: '/insights/what-a-tenant-improvement-actually-costs-per-square-foot',
    destination: '/insights/tenant-improvement-cost-per-square-foot',
    statusCode: 301,
  },
  {
    source: '/insights/why-three-gc-bids-come-back-at-three-different-numbers',
    destination: '/insights/comparing-commercial-construction-bids',
    statusCode: 301,
  },
  {
    source: '/insights/how-to-evaluate-contractor-bids',
    destination: '/insights/compare-commercial-construction-bids',
    statusCode: 301,
  },
  {
    source: '/insights/permitting-in-gwinnett-cobb-and-fulton',
    destination: '/insights/permitting',
    statusCode: 301,
  },
  {
    source: '/insights/how-long-a-commercial-buildout-takes',
    destination: '/insights/commercial-buildout-timeline',
    statusCode: 301,
  },
  {
    source: '/insights/what-happens-on-a-site-walk',
    destination: '/insights/pre-construction-process',
    statusCode: 301,
  },
  {
    source: '/insights/what-to-send-a-gc-when-youre-requesting-a-bid',
    destination: '/insights/commercial-construction-bid-package',
    statusCode: 301,
  },
  {
    source: '/insights/landlord-vs-tenant-scope-who-pays-for-what',
    destination: '/insights/tenant-improvement',
    statusCode: 301,
  },
];

export const REDIRECTED_INSIGHT_SLUGS = new Set(
  INSIGHT_CANONICAL_REDIRECTS.map((r) => r.source.replace(/^\/insights\//, '')),
);

/** @param {string} slug */
export function isRedirectedInsightSlug(slug) {
  return REDIRECTED_INSIGHT_SLUGS.has(slug);
}

/**
 * @template {{ slug: string }} T
 * @param {T[]} items
 * @returns {T[]}
 */
export function excludeRedirectedInsights(items) {
  return items.filter((item) => !REDIRECTED_INSIGHT_SLUGS.has(item.slug));
}
