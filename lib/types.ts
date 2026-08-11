import type { PortableTextBlock } from '@portabletext/react';

export interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
}

/** Legacy image ref shape (kept for the fallback content types). */
export interface SanityImage {
  _type?: string;
  asset?: { _ref?: string; _type?: string };
  alt?: string;
  [key: string]: unknown;
}

export interface SiteSettings {
  phone?: string;
  phoneRaw?: string;
  email?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  hours?: string;
  gbpUrl?: string;
  callRailId?: string;
  callRailResource?: string;
  ga4Id?: string;
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
  problemStatement?: PortableTextBlock[];
  scopeItems?: string[];
  typicalRange?: string;
  typicalTimeline?: string;
  planSteps?: PlanStep[];
  relatedProjects?: ProjectCard[];
  cities?: City[];
}

export interface City {
  _id: string;
  name: string;
  state: string;
  slug: string;
  county?: string;
  jurisdictionNote?: PortableTextBlock[];
  intro?: PortableTextBlock[];
  tier?: number;
}

export interface ProjectCard {
  _id: string;
  title: string;
  slug: string;
  clientType?: string;
  cityName?: string;
  cityState?: string;
  scopeSummary?: string;
  image?: SanityImage;
  imageUrls?: { url: string; alt?: string }[];
  /** Dedicated cover photo — the best representative image for a card. */
  heroImageUrl?: string;
  /** One-line client quote shown on the card. */
  cardQuote?: string;
  serviceSlug?: string;
}

export interface Testimonial {
  quote?: string;
  attribution?: string;
  role?: string;
}

export interface StatHighlight {
  value: string;
  label: string;
}

/** A source file stored in R2 (image or PDF) attached to a post or project. */
export interface Attachment {
  label?: string;
  url: string;
  contentType?: string;
}

export interface Project extends ProjectCard {
  timeline?: string;
  /** Dedicated cover/hero photo (R2), shown at the top of the project page. */
  heroImageUrl?: string;
  /** Markdown body authored from /admin; renders instead of challenge/solution. */
  bodyMarkdown?: string;
  challenge?: PortableTextBlock[];
  solution?: PortableTextBlock[];
  images?: SanityImage[];
  /** External photo URLs (R2), used when no Sanity `images` are present. */
  imageUrls?: { url: string; alt?: string }[];
  attachments?: Attachment[];
  status?: string;
  testimonial?: Testimonial;
  highlights?: StatHighlight[];
  completedDate?: string;
  squareFootage?: string;
}

export interface ServiceCity {
  _id: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  serviceSlug: string;
  citySlug: string;
  cityName: string;
  cityState: string;
  county?: string;
  /** Markdown bodies produced by the City page builder (rendered via MarkdownBody). */
  intro?: string;
  projectTitle?: string;
  projectBody?: string;
  /** Slug of a related /projects/[slug] case study, if one exists. */
  projectRefSlug?: string;
  /** R2 URL of the local project photo + its alt text. */
  photoUrl?: string;
  photoAlt?: string;
  jurisdictionBody?: string;
  ctaLine?: string;
}

export interface Market {
  _id: string;
  title: string;
  slug: string;
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
  audienceProblem?: PortableTextBlock[];
  relevantServices?: { title: string; slug: string }[];
  relatedProjects?: ProjectCard[];
}

export interface TeamMember {
  _id: string;
  name: string;
  slug: string;
  role: string;
  photo?: SanityImage;
  bio?: PortableTextBlock[];
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
}

/** Author summary as rendered on a post (resolved from the teamMember ref). */
export interface Author {
  name: string;
  role?: string;
  slug?: string;
  photo?: SanityImage;
}

export interface PostCard {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  cluster?: string;
  publishedAt?: string;
  mainImage?: SanityImage;
  /** External hero URL (R2), used when no Sanity `mainImage` is present. */
  heroImageUrl?: string;
  author?: Author;
  featured?: boolean;
}

export interface Post extends PostCard {
  body?: PortableTextBlock[];
  /** Markdown body authored from /admin; renders instead of `body` when set. */
  bodyMarkdown?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
  attachments?: Attachment[];
  relatedPosts?: PostCard[];
}

export interface LandingPage {
  _id: string;
  slug: string;
  campaignSource?: string;
  headline: string;
  subhead?: string;
  problemCopy?: PortableTextBlock[];
  planSteps?: PlanStep[];
  proofLogos?: SanityImage[];
  ctaText?: string;
}
