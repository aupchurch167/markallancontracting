import type { PortableTextBlock } from '@portabletext/react';
import type { Image } from 'sanity';

export interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface SanityImage extends Image {
  alt?: string;
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
  serviceSlug?: string;
}

export interface Project extends ProjectCard {
  timeline?: string;
  challenge?: PortableTextBlock[];
  solution?: PortableTextBlock[];
  images?: SanityImage[];
  status?: string;
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
  jurisdictionNote?: PortableTextBlock[];
  localProjectNote?: PortableTextBlock[];
  localProject?: ProjectCard;
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

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: PortableTextBlock[];
  author?: string;
  publishedAt?: string;
  cluster?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
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
