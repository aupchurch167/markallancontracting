import { SITE, CONTACT } from './constants';
import { SERVICE_LINES, SERVICES } from './site-data';

/**
 * JSON-LD builders. NAP values are passed in from merged site settings so the
 * schema matches the Google Business Profile exactly (single source of truth).
 */

interface Nap {
  phone: string;
  email: string;
}

/** Cities the site explicitly claims as its service area (see /contact copy). */
const SERVICE_AREA_CITIES = [
  'Atlanta',
  'Chattanooga',
  'Nashville',
  'Birmingham',
  'Huntsville',
  'Greenville',
  'Columbia',
];

/**
 * Rich LocalBusiness (GeneralContractor) schema for the whole site. Only real,
 * verified values — a hosted logo/photo and social profiles don't exist yet, so
 * `image`/`logo` use the site's branded OG image and `sameAs` is omitted until
 * real profile URLs are supplied.
 */
export function localBusinessSchema({ phone }: Nap) {
  const a = CONTACT.address;
  const ogImage = `${SITE.url}/api/og?title=${encodeURIComponent(SITE.name)}&eyebrow=${encodeURIComponent(
    'Commercial General Contractor',
  )}`;

  const services = [
    ...SERVICE_LINES.map((l) => ({ name: l.name, url: `${SITE.url}${l.href}` })),
    ...SERVICES.map((s) => ({ name: s.name, url: `${SITE.url}/project-types/${s.slug}` })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    alternateName: SITE.shortName,
    image: ogImage,
    logo: ogImage,
    url: SITE.url,
    telephone: phone,
    email: CONTACT.email,
    priceRange: '$50,000 - $500,000 per project',
    foundingDate: String(SITE.established),
    description:
      'Mark Allan Contracting is a family-owned commercial general contractor serving Metro ' +
      'Atlanta and the Southeast since 1999. Run by Adam and Justin Upchurch, we self-perform ' +
      'non-specialty trades and deliver tenant improvements, restaurant and retail buildouts, ' +
      'office renovations, warehouse conversions, and commercial repairs — typically $50K to ' +
      '$500K projects across Georgia, Tennessee, Alabama, and South Carolina.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.geo.lat,
      longitude: CONTACT.geo.lng,
    },
    openingHoursSpecification: CONTACT.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    hasMap: CONTACT.gbpUrl,
    areaServed: [
      ...SITE.statesServed.map((name) => ({ '@type': 'State', name })),
      ...SERVICE_AREA_CITIES.map((name) => ({ '@type': 'City', name })),
    ],
    knowsAbout: [
      'Commercial tenant improvements',
      'Restaurant buildouts',
      'Retail buildouts',
      'Office renovation',
      'Warehouse conversion',
      'Commercial building repair',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Commercial Construction Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.name, url: s.url },
      })),
    },
  };
}

export function serviceSchema({
  name,
  description,
  areaServed,
}: {
  name: string;
  description: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    provider: { '@type': 'GeneralContractor', name: SITE.name, url: SITE.url },
    description,
    ...(areaServed ? { areaServed: { '@type': 'City', name: areaServed } } : {}),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleSchema({
  title,
  description,
  author,
  publishedAt,
  path,
}: {
  title: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    ...(description ? { description } : {}),
    ...(author ? { author: { '@type': 'Person', name: author } } : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `${SITE.url}${path}`,
  };
}
