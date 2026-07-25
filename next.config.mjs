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
  'commercial-flooring': '/services/flooring-interior-trades',
  'commercial-general-construction': '/services',
  'commercial-general-contracting': '/services',
  'commercial-general-repairs': '/services/building-repair',
  'commercial-lighting-install': '/services',
  'commercial-painting': '/services/flooring-interior-trades',
  'commercial-remodeling': '/services/office-renovation',
  'commercial-repairs': '/services/building-repair',
  'commercial-roof': '/services/building-repair',
  construction: '/services',
  'facility-maintenance': '/markets/facility-managers',
  'industrial-construction': '/services/warehouse-conversion',
  'industrial-general-contracting': '/services',
  'industrial-general-repairs': '/services/building-repair',
  'industrial-maintenance': '/markets/facility-managers',
  'industrial-repairs': '/services/building-repair',
  'industrial-roof': '/services/building-repair',
  'office-build-out': '/services/office-renovation',
  'office-maintenance': '/services/office-renovation',
  'office-painting': '/services/office-renovation',
  'office-repairs': '/services/building-repair',
  'residential-roof': '/services',
  'restaurant-buildout': '/services/restaurant-buildout',
  'restaurant-construction': '/services/restaurant-buildout',
  'restaurant-maintenance': '/services/restaurant-buildout',
  'restaurant-repairs': '/services/building-repair',
  'restaurant-roof': '/services/building-repair',
  'retail-build-out': '/services/retail-buildout',
  'retail-maintenance': '/services/retail-buildout',
  'retail-white-boxing': '/services/retail-buildout',
  'roll-up-door-installation': '/services/warehouse-conversion',
  'tenant-build-out': '/services/tenant-improvements',
  'tenant-improvement': '/services/tenant-improvements',
  'warehouse-construction': '/services/warehouse-conversion',
  'warehouse-general-contracting': '/services/warehouse-conversion',
  'warehouse-general-repairs': '/services/building-repair',
  'warehouse-maintenance': '/services/warehouse-conversion',
  'warehouse-painting': '/services/warehouse-conversion',
  'warehouse-repairs': '/services/building-repair',
  'warehouse-roof': '/services/building-repair',
  'warehouse-white-boxing': '/services/warehouse-conversion',
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
  { source: '/glossary', destination: '/insights', statusCode: 301 },
  { source: '/faq', destination: '/how-we-build', statusCode: 301 },
  {
    source: '/faq-what-to-expect-when-working-with-mac',
    destination: '/construction-process',
    statusCode: 301,
  },
  // Legacy "products"
  { source: '/product/general-contracting', destination: '/services', statusCode: 301 },
  { source: '/product/electrical', destination: '/services', statusCode: 301 },
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
    destination: '/services/tenant-improvements',
    statusCode: 301,
  },
  { source: '/post/we-are-mark-allan-contracting', destination: '/how-we-build', statusCode: 301 },
];

// Catch-alls — must come AFTER the specific rules above.
const fallbackRedirects = [
  { source: '/service-city/:slug*', destination: '/services', statusCode: 301 },
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
    return [...staticRedirects, ...serviceCityRedirects, ...fallbackRedirects];
  },
};

export default nextConfig;
