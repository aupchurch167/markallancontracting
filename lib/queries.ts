import { client } from '@/sanity/lib/client';
import { CONTACT, TRACKING } from './constants';
import type {
  City,
  LandingPage,
  Market,
  Post,
  PostCard,
  Project,
  ProjectCard,
  Service,
  ServiceCity,
  SiteSettings,
  TeamMember,
} from './types';

/**
 * Every helper returns a safe empty when Sanity is not configured, so the site
 * builds and renders before the CMS is provisioned. Once content exists these
 * light up with no code changes — that is the whole point of the schema.
 */

const projectCardProjection = `
  _id,
  title,
  "slug": slug.current,
  clientType,
  "cityName": city->name,
  "cityState": city->state,
  scopeSummary,
  "serviceSlug": service->slug.current,
  "image": images[0],
  "imageUrls": imageUrls
`;

const authorProjection = `
  "name": author->name,
  "role": author->role,
  "slug": author->slug.current,
  "photo": author->photo
`;

const postCardProjection = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  cluster,
  publishedAt,
  featured,
  mainImage,
  heroImageUrl,
  "author": { ${authorProjection} }
`;

/**
 * Merged sitewide settings: Sanity singleton wins, constants tokens are the
 * fallback. This is how NAP stays single-sourced while remaining editable.
 */
export async function getSiteSettings(): Promise<{
  phone: string;
  phoneRaw: string;
  email: string;
  callRailId: string;
  callRailResource: string;
  ga4Id: string;
  raw: SiteSettings | null;
}> {
  let s: SiteSettings | null = null;
  if (client) {
    s = await client.fetch<SiteSettings | null>(
      `*[_type == "sitewideSettings"][0]`,
    );
  }
  return {
    phone: s?.phone || CONTACT.phone,
    phoneRaw: s?.phoneRaw || CONTACT.phoneRaw,
    email: s?.email || CONTACT.email,
    callRailId: s?.callRailId || TRACKING.callRailId,
    callRailResource: s?.callRailResource || TRACKING.callRailResource,
    ga4Id: s?.ga4Id || TRACKING.ga4Id,
    raw: s,
  };
}

export async function getService(slug: string): Promise<Service | null> {
  if (!client) return null;
  return client.fetch<Service | null>(
    `*[_type == "service" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, h1, metaTitle, metaDescription,
      problemStatement, scopeItems, typicalRange, typicalTimeline, planSteps,
      "relatedProjects": relatedProjects[]->{${projectCardProjection}},
      "cities": cities[]->{ _id, name, state, "slug": slug.current, county, tier }
    }`,
    { slug },
  );
}

export async function getCity(slug: string): Promise<City | null> {
  if (!client) return null;
  return client.fetch<City | null>(
    `*[_type == "city" && slug.current == $slug][0]{
      _id, name, state, "slug": slug.current, county, jurisdictionNote, intro, tier
    }`,
    { slug },
  );
}

/** Matrix page content. Existence of this document gates the route (anti-thin). */
export async function getServiceCity(
  serviceSlug: string,
  citySlug: string,
): Promise<ServiceCity | null> {
  if (!client) return null;
  return client.fetch<ServiceCity | null>(
    `*[_type == "serviceCity"
        && service->slug.current == $serviceSlug
        && city->slug.current == $citySlug][0]{
      _id, h1, metaTitle, metaDescription,
      "serviceSlug": service->slug.current,
      "citySlug": city->slug.current,
      "cityName": city->name,
      "cityState": city->state,
      "county": city->county,
      "jurisdictionNote": city->jurisdictionNote,
      localProjectNote,
      "localProject": localProjectRef->{${projectCardProjection}}
    }`,
    { serviceSlug, citySlug },
  );
}

export async function getServiceCitySlugs(): Promise<
  { service: string; city: string }[]
> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "serviceCity" && defined(service->slug.current) && defined(city->slug.current)]{
      "service": service->slug.current,
      "city": city->slug.current
    }`,
  );
}

export async function getCitySlugs(): Promise<string[]> {
  if (!client) return [];
  return client.fetch<string[]>(
    `*[_type == "city" && defined(slug.current)].slug.current`,
  );
}

export async function getCitiesForService(
  serviceSlug: string,
): Promise<{ name: string; state: string; slug: string }[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "serviceCity" && service->slug.current == $serviceSlug]{
      "name": city->name, "state": city->state, "slug": city->slug.current
    } | order(name asc)`,
    { serviceSlug },
  );
}

export async function getServicesForCity(
  citySlug: string,
): Promise<{ title: string; slug: string }[]> {
  if (!client) return [];
  return client.fetch(
    `*[_type == "serviceCity" && city->slug.current == $citySlug]{
      "title": service->title, "slug": service->slug.current
    } | order(title asc)`,
    { citySlug },
  );
}

export async function getFeaturedProjects(): Promise<ProjectCard[]> {
  if (!client) return [];
  return client.fetch<ProjectCard[]>(
    `*[_type == "project" && featured == true && status == "delivered"]
      | order(_createdAt desc)[0...3]{${projectCardProjection}}`,
  );
}

export async function getProjects(): Promise<ProjectCard[]> {
  if (!client) return [];
  return client.fetch<ProjectCard[]>(
    `*[_type == "project" && status == "delivered"]
      | order(_createdAt desc){${projectCardProjection}}`,
  );
}

export async function getProject(slug: string): Promise<Project | null> {
  if (!client) return null;
  return client.fetch<Project | null>(
    `*[_type == "project" && slug.current == $slug && status == "delivered"][0]{
      ${projectCardProjection},
      timeline, challenge, solution, images, imageUrls, attachments, status,
      testimonial, highlights, completedDate, squareFootage
    }`,
    { slug },
  );
}

export async function getProjectSlugs(): Promise<string[]> {
  if (!client) return [];
  return client.fetch<string[]>(
    `*[_type == "project" && status == "delivered" && defined(slug.current)].slug.current`,
  );
}

export async function getMarket(slug: string): Promise<Market | null> {
  if (!client) return null;
  return client.fetch<Market | null>(
    `*[_type == "market" && slug.current == $slug][0]{
      _id, title, "slug": slug.current, h1, metaTitle, metaDescription,
      audienceProblem,
      "relevantServices": relevantServices[]->{ title, "slug": slug.current },
      "relatedProjects": relatedProjects[]->{${projectCardProjection}}
    }`,
    { slug },
  );
}

export async function getPosts(): Promise<PostCard[]> {
  if (!client) return [];
  return client.fetch<PostCard[]>(
    `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc){
      ${postCardProjection}
    }`,
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!client) return null;
  return client.fetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{
      ${postCardProjection},
      body, tags, metaTitle, metaDescription, ogImage, attachments,
      "relatedPosts": relatedPosts[]->{ ${postCardProjection} }
    }`,
    { slug },
  );
}

export async function getPostSlugs(): Promise<string[]> {
  if (!client) return [];
  return client.fetch<string[]>(
    `*[_type == "post" && defined(slug.current)].slug.current`,
  );
}

export async function getTeam(): Promise<TeamMember[]> {
  if (!client) return [];
  return client.fetch<TeamMember[]>(
    `*[_type == "teamMember"] | order(order asc){
      _id, name, "slug": slug.current, role, photo, bio, email, phone, linkedin, order
    }`,
  );
}

export async function getTeamMember(slug: string): Promise<TeamMember | null> {
  if (!client) return null;
  return client.fetch<TeamMember | null>(
    `*[_type == "teamMember" && slug.current == $slug][0]{
      _id, name, "slug": slug.current, role, photo, bio, email, phone, linkedin, order
    }`,
    { slug },
  );
}

export async function getLandingPage(slug: string): Promise<LandingPage | null> {
  if (!client) return null;
  return client.fetch<LandingPage | null>(
    `*[_type == "landingPage" && slug.current == $slug][0]{
      _id, "slug": slug.current, campaignSource, headline, subhead,
      problemCopy, planSteps, proofLogos, ctaText
    }`,
    { slug },
  );
}
