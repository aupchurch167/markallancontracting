import { SITE } from './constants';

/**
 * JSON-LD builders. NAP values are passed in from merged site settings so the
 * schema matches the Google Business Profile exactly (single source of truth).
 */

interface Nap {
  phone: string;
  email: string;
}

export function localBusinessSchema({ phone }: Nap) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: SITE.name,
    description: SITE.oneLiner,
    url: SITE.url,
    telephone: phone,
    foundingDate: String(SITE.established),
    areaServed: SITE.statesServed.map((name) => ({
      '@type': 'State',
      name,
    })),
    knowsAbout: [
      'Commercial tenant improvements',
      'Restaurant buildouts',
      'Office renovation',
      'Warehouse conversion',
    ],
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
