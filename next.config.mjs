/** @type {import('next').NextConfig} */

/**
 * Redirect map from the existing macont.com (Webflow) site.
 *
 * Built by crawling the live sitemap (889 URLs). The legacy site was dominated
 * by an 862-page /service-city/* matrix across ~41 service phrases × 18 cities.
 * The new site deliberately gates thin matrix pages, so every legacy
 * service-city URL 301s to the most relevant new SERVICE HUB (city matrix pages
 * only exist where real local content backs them). Nothing 404s on cutover.
 *
 * Each legacy service phrase maps to a new destination. Order matters: specific
 * rules first, catch-alls last. The `:city` param swallows the trailing city
 * token (including Webflow's random hash suffixes) within the single segment.
 */

const SERVICE_CITY_MAP = {
  'commercial-flooring': '/project-types/flooring-interior-trades',
  'commercial-general-construction': '/general-contracting',
  'commercial-general-contracting': '/general-contracting',
  'commercial-general-repairs': '/project-types/building-repair',
  'commercial-lighting-install': '/general-contracting',
  'commercial-painting': '/project-types/flooring-interior-trades',
  'commercial-remodeling': '/remodeling',
  'commercial-repairs': '/project-types/building-repair',
  'commercial-roof': '/project-types/building-repair',
  construction: '/general-contracting',
  'facility-maintenance': '/markets/facility-managers',
  'industrial-construction': '/project-types/warehouse-conversion',
  'industrial-general-contracting': '/general-contracting',
  'industrial-general-repairs': '/project-types/building-repair',
  'industrial-maintenance': '/markets/facility-managers',
  'industrial-repairs': '/project-types/building-repair',
  'industrial-roof': '/project-types/building-repair',
  'office-build-out': '/project-types/office-renovation',
  'office-maintenance': '/project-types/office-renovation',
  'office-painting': '/project-types/office-renovation',
  'office-repairs': '/project-types/building-repair',
  'residential-roof': '/general-contracting',
  'restaurant-buildout': '/project-types/restaurant-buildout',
  'restaurant-construction': '/project-types/restaurant-buildout',
  'restaurant-maintenance': '/project-types/restaurant-buildout',
  'restaurant-repairs': '/project-types/building-repair',
  'restaurant-roof': '/project-types/building-repair',
  'retail-build-out': '/project-types/retail-buildout',
  'retail-maintenance': '/project-types/retail-buildout',
  'retail-white-boxing': '/project-types/retail-buildout',
  'roll-up-door-installation': '/project-types/warehouse-conversion',
  'tenant-build-out': '/project-types/tenant-improvements',
  'tenant-improvement': '/project-types/tenant-improvements',
  'warehouse-construction': '/project-types/warehouse-conversion',
  'warehouse-general-contracting': '/project-types/warehouse-conversion',
  'warehouse-general-repairs': '/project-types/building-repair',
  'warehouse-maintenance': '/project-types/warehouse-conversion',
  'warehouse-painting': '/project-types/warehouse-conversion',
  'warehouse-repairs': '/project-types/building-repair',
  'warehouse-roof': '/project-types/building-repair',
  'warehouse-white-boxing': '/project-types/warehouse-conversion',
};

// Longer phrases first so a shorter phrase never shadows a more specific one.
const serviceCityRedirects = Object.entries(SERVICE_CITY_MAP)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([phrase, destination]) => ({
    source: `/service-city/${phrase}-:city`,
    destination,
    statusCode: 301,
  }));

const staticRedirects = [
  { source: '/about', destination: '/how-we-build', statusCode: 301 },
  { source: '/our-services', destination: '/services', statusCode: 301 },
  { source: '/blog', destination: '/insights', statusCode: 301 },
  { source: '/glossary', destination: '/construction-process', statusCode: 301 },
  { source: '/faq', destination: '/how-we-build', statusCode: 301 },
  {
    source: '/faq-what-to-expect-when-working-with-mac',
    destination: '/construction-process',
    statusCode: 301,
  },
  // Legacy "products"
  { source: '/product/general-contracting', destination: '/general-contracting', statusCode: 301 },
  { source: '/product/electrical', destination: '/general-contracting', statusCode: 301 },
  { source: '/product/estimating-and-planning', destination: '/pre-construction', statusCode: 301 },
  { source: '/product/facility-maintenance', destination: '/markets/facility-managers', statusCode: 301 },
  // Legacy blog posts — map to the closest new article where one exists.
  {
    source: '/post/who-pays-for-tenant-improvements--landlord-or-tenant',
    destination: '/insights/landlord-vs-tenant-scope-who-pays-for-what',
    statusCode: 301,
  },
  {
    source: '/post/how-to-prevent-budget-overruns-delays-and-disputes-on-your-next-construction-project',
    destination: '/insights/why-three-gc-bids-come-back-at-three-different-numbers',
    statusCode: 301,
  },
  {
    source: '/post/3-things-to-look-out-for-when-choosing-a-general-contractor',
    destination: '/insights/how-to-evaluate-contractor-bids',
    statusCode: 301,
  },
  {
    source: '/post/what-to-expect-during-a-tenant-buildout',
    destination: '/project-types/tenant-improvements',
    statusCode: 301,
  },
  { source: '/post/we-are-mark-allan-contracting', destination: '/how-we-build', statusCode: 301 },
];

// The project types moved from /services/* to /project-types/*. Redirect the old
// internal URLs so nothing that briefly linked to them 404s. ('/services' itself
// is a live page now — the service-lines hub — so only sub-paths redirect.)
const movedProjectTypeRedirects = [
  { source: '/services/:type/:city', destination: '/project-types/:type/:city', statusCode: 301 },
  { source: '/services/:type', destination: '/project-types/:type', statusCode: 301 },
];

// Catch-alls — must come AFTER the specific rules above.
const fallbackRedirects = [
  { source: '/service-city/:slug*', destination: '/project-types', statusCode: 301 },
  { source: '/project/:slug*', destination: '/projects', statusCode: 301 },
  { source: '/post/:slug*', destination: '/insights', statusCode: 301 },
  { source: '/categories-posts/:slug*', destination: '/insights', statusCode: 301 },
  { source: '/category/:slug*', destination: '/insights', statusCode: 301 },
];

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async redirects() {
    return [
      ...staticRedirects,
      ...serviceCityRedirects,
      ...movedProjectTypeRedirects,
      ...fallbackRedirects,
    ];
  },
};

export default nextConfig;
