/**
 * Structural site data — the routing + navigation skeleton.
 *
 * These are identifiers and target keywords, not page copy. Rich page content
 * (problem statements, scope lists, ranges, jurisdiction notes) is authored in
 * Sanity. This file exists so nav, sitemaps, and cross-linking work without a
 * round-trip, and so slugs have exactly one definition.
 */

export type ServiceKey =
  | 'tenant-improvements'
  | 'office-renovation'
  | 'warehouse-conversion'
  | 'restaurant-buildout'
  | 'retail-buildout'
  | 'building-repair'
  | 'flooring-interior-trades';

export interface ServiceDef {
  slug: ServiceKey;
  name: string;
  /** SEO target for the unmodified (non-geo) hub term. */
  keyword: string;
}

export const SERVICES: ServiceDef[] = [
  {
    slug: 'tenant-improvements',
    name: 'Tenant Improvements',
    keyword: 'tenant improvement contractor atlanta',
  },
  {
    slug: 'office-renovation',
    name: 'Office Renovation',
    keyword: 'commercial office renovation atlanta',
  },
  {
    slug: 'warehouse-conversion',
    name: 'Warehouse Conversion',
    keyword: 'warehouse buildout contractor georgia',
  },
  {
    slug: 'restaurant-buildout',
    name: 'Restaurant Buildout',
    keyword: 'restaurant construction company atlanta',
  },
  {
    slug: 'retail-buildout',
    name: 'Retail Buildout',
    keyword: 'retail buildout contractor atlanta',
  },
  {
    slug: 'building-repair',
    name: 'Building Repair',
    keyword: 'commercial building repair atlanta',
  },
  {
    slug: 'flooring-interior-trades',
    name: 'Flooring & Interior Trades',
    keyword: 'commercial flooring contractor atlanta',
  },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export function getService(slug: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export type MarketKey =
  | 'franchise-restaurant-operators'
  | 'commercial-real-estate-brokers'
  | 'property-managers'
  | 'multifamily-operators'
  | 'facility-managers';

export interface MarketDef {
  slug: MarketKey;
  name: string;
}

export const MARKETS: MarketDef[] = [
  { slug: 'franchise-restaurant-operators', name: 'Franchise & Restaurant Operators' },
  { slug: 'commercial-real-estate-brokers', name: 'Commercial Real Estate Brokers' },
  { slug: 'property-managers', name: 'Property Managers' },
  { slug: 'multifamily-operators', name: 'Multifamily Operators' },
  { slug: 'facility-managers', name: 'Facility Managers' },
];

/**
 * Primary navigation — 7 top-level items max (the phone CTA is not one of them).
 * "About" has no slot (folded into /how-we-build + footer). Trade Partners is
 * built but omitted here until it is ungated.
 */
export interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string; heading?: boolean }[];
}

/**
 * Feature gates.
 *
 * Trade Partners: owner decision is that it belongs in the MAIN nav — but it
 * stays gated on real capability figures (insurance limits, W/C mod rate, crew
 * capacity) and the schedule-reliability question. Flip this to true once those
 * arrive: it surfaces Trade Partners in the nav, makes its pages indexable, and
 * adds them to the sitemap, all in one place.
 */
export const FEATURES = {
  tradePartnersPublished: false,
} as const;

const BASE_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      // Pre-construction is a sold service and the entry point — surfaced first.
      { label: 'Pre-Construction', href: '/pre-construction' },
      { label: 'Build', href: '#', heading: true },
      ...SERVICES.map((s) => ({ label: s.name, href: `/services/${s.slug}` })),
      { label: 'Markets', href: '#', heading: true },
      ...MARKETS.map((m) => ({ label: m.name, href: `/markets/${m.slug}` })),
    ],
  },
  {
    label: 'How We Build',
    href: '/how-we-build',
    children: [
      { label: 'Pre-Construction', href: '/pre-construction' },
      { label: 'Our Process', href: '/construction-process' },
      { label: 'New Construction', href: '/new-construction' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
];

export const NAV: NavItem[] = FEATURES.tradePartnersPublished
  ? [
      ...BASE_NAV.slice(0, -1),
      { label: 'Trade Partners', href: '/trade-partners' },
      BASE_NAV[BASE_NAV.length - 1],
    ]
  : BASE_NAV;
