import { CONTACT, TRACKING } from './constants';
import {
  getPublishedPostCards,
  getPublishedPost,
  getPublishedPostSlugs,
  getPublishedProjectCards,
  getFeaturedProjectCards,
  getPublishedProject,
  getPublishedProjectSlugs,
  getServiceCityPage,
  getServiceCityPairs,
} from './content';
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
 * Data access. Posts and projects come from the custom CMS (Postgres) when
 * configured; everything else (services, cities, markets, team, landing pages,
 * settings) ships from the editorial fallbacks in lib/fallback-*.ts and
 * lib/constants.ts, so these return empty/null and the pages use the fallback.
 */

// ---------- settings (constants are the source of truth) ----------
export async function getSiteSettings(): Promise<{
  phone: string;
  phoneRaw: string;
  email: string;
  callRailId: string;
  callRailResource: string;
  ga4Id: string;
  raw: SiteSettings | null;
}> {
  return {
    phone: CONTACT.phone,
    phoneRaw: CONTACT.phoneRaw,
    email: CONTACT.email,
    callRailId: TRACKING.callRailId,
    callRailResource: TRACKING.callRailResource,
    ga4Id: TRACKING.ga4Id,
    raw: null,
  };
}

// ---------- static content types (served from code fallbacks) ----------
export async function getService(_slug: string): Promise<Service | null> {
  return null;
}
export async function getCity(_slug: string): Promise<City | null> {
  return null;
}
export async function getServiceCity(
  serviceSlug: string,
  citySlug: string,
): Promise<ServiceCity | null> {
  return getServiceCityPage(serviceSlug, citySlug);
}
export async function getServiceCitySlugs(): Promise<{ service: string; city: string }[]> {
  return getServiceCityPairs();
}
export async function getCitySlugs(): Promise<string[]> {
  return [];
}
export async function getCitiesForService(
  _serviceSlug: string,
): Promise<{ name: string; state: string; slug: string }[]> {
  return [];
}
export async function getServicesForCity(
  _citySlug: string,
): Promise<{ title: string; slug: string }[]> {
  return [];
}
export async function getMarket(_slug: string): Promise<Market | null> {
  return null;
}
export async function getTeam(): Promise<TeamMember[]> {
  return [];
}
export async function getTeamMember(_slug: string): Promise<TeamMember | null> {
  return null;
}
export async function getLandingPage(_slug: string): Promise<LandingPage | null> {
  return null;
}

// ---------- posts + projects (custom CMS) ----------
export async function getFeaturedProjects(): Promise<ProjectCard[]> {
  return getFeaturedProjectCards();
}
export async function getProjects(): Promise<ProjectCard[]> {
  return getPublishedProjectCards();
}
export async function getProject(slug: string): Promise<Project | null> {
  return getPublishedProject(slug);
}
export async function getProjectSlugs(): Promise<string[]> {
  return getPublishedProjectSlugs();
}
export async function getPosts(): Promise<PostCard[]> {
  return getPublishedPostCards();
}
export async function getPost(slug: string): Promise<Post | null> {
  return getPublishedPost(slug);
}
export async function getPostSlugs(): Promise<string[]> {
  return getPublishedPostSlugs();
}
