import { SITE, CONTACT, SOCIAL } from './constants';
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
 * verified values — `image`/`logo` use the site's branded OG image; `sameAs`
 * lists the public Instagram, Facebook, and LinkedIn profiles.
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
    sameAs: SOCIAL.map((s) => s.href),
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

/**
 * Reviews + aggregate rating, attached to the business node by its shared @id so
 * crawlers merge them onto the site-wide GeneralContractor. Emitted only on pages
 * where the reviews are actually visible, and each Review matches a quote shown on
 * the page. `aggregateRating` is included only when the real GMB numbers are set —
 * it must reflect the true source, never the curated subset.
 */
export function reviewsSchema({
  reviews,
  aggregateRating,
  reviewCount,
}: {
  reviews: { author: string; rating: number; body: string; date?: string }[];
  aggregateRating?: number | null;
  reviewCount?: number | null;
}) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
  };

  if (typeof aggregateRating === 'number' && typeof reviewCount === 'number' && reviewCount > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews.length) {
    node.review = reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.body,
      ...(r.date ? { datePublished: r.date } : {}),
    }));
  }

  return node;
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

/** Turn `[label](/path)` FAQ markup into plain text with absolute URLs for JSON-LD. */
export function faqAnswerPlain(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const url = href.startsWith('/') ? `${SITE.url}${href}` : href;
    return `${label} (${url})`;
  });
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerPlain(f.a) },
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
