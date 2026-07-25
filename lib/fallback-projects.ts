/**
 * Real delivered projects, carried over from the existing macont.com so the new
 * /projects section and homepage ship with actual work and real photos (in
 * public/projects/*). Copy is rewritten in the site voice — plain, specific, no
 * marketing register — from the facts of each job, not the old page prose.
 *
 * These are the fallback until the same projects are authored in Sanity with
 * CompanyCam photos, at which point Sanity wins per-slug. Only delivered work
 * appears here (the standing rule); no active prospects.
 */
export interface FallbackProject {
  slug: string;
  title: string;
  clientType: string;
  serviceSlug: string;
  cityName?: string;
  cityState?: string;
  scopeSummary: string;
  timeline?: string;
  challenge: string[];
  solution: string[];
  images: { url: string; alt: string }[];
  featured: boolean;
}

export const FALLBACK_PROJECTS: FallbackProject[] = [
  {
    slug: 'kennesaw-pilates-studio',
    title: 'Pilates Studio Buildout, Kennesaw',
    clientType: 'Fitness studio owner',
    serviceSlug: 'tenant-improvements',
    cityName: 'Kennesaw',
    cityState: 'ga',
    scopeSummary:
      'Full tenant buildout of a Pilates studio — open workout floor, custom features, dust-contained work.',
    challenge: [
      'The owner, a former pro athlete, wanted a modern studio that could take hard daily use and still look the part — an open floor, good lighting, and specific features like barn doors and a built fitness wall.',
      'It sat in a jurisdiction with its own zoning and permitting requirements, and some of the specialty materials had to be tracked down rather than pulled off a shelf.',
    ],
    solution: [
      'We worked from the client’s design inspiration and built to it, contained the work area to keep dust and disruption down, and chased the specialty materials so the details landed the way they were drawn.',
      'We handled the Kennesaw permitting and delivered the open layout, the lighting, the barn doors, and the fitness wall — a studio that works as hard as its members do.',
    ],
    images: [
      { url: '/projects/kennesaw-pilates-studio/1.jpg', alt: 'Finished Pilates studio interior with open workout floor' },
      { url: '/projects/kennesaw-pilates-studio/2.jpg', alt: 'Pilates studio featuring built fitness wall' },
      { url: '/projects/kennesaw-pilates-studio/3.jpg', alt: 'Studio interior with barn-door feature' },
      { url: '/projects/kennesaw-pilates-studio/4.jpg', alt: 'Completed Pilates studio buildout in Kennesaw' },
    ],
    featured: true,
  },
  {
    slug: 'tanning-salon-buildout',
    title: 'Tanning Salon Buildout',
    clientType: 'Retail operator',
    serviceSlug: 'retail-buildout',
    scopeSummary:
      'Fast-turnaround buildout of a new tanning salon location for a small-business operator on a tight open date.',
    challenge: [
      'For a small business, every week before opening is return you don’t get back. The operator had a clear vision for a new location and a schedule that left no room to drift.',
    ],
    solution: [
      'We scoped it tight, kept the client’s prep moving in parallel with ours, and built to the date. The salon opened on schedule and started earning instead of waiting on the contractor.',
    ],
    images: [
      { url: '/projects/tanning-salon-buildout/1.jpg', alt: 'Finished tanning salon interior' },
      { url: '/projects/tanning-salon-buildout/2.jpg', alt: 'Tanning salon buildout — treatment rooms' },
      { url: '/projects/tanning-salon-buildout/3.jpg', alt: 'Salon reception and retail area' },
      { url: '/projects/tanning-salon-buildout/4.jpg', alt: 'Completed tanning salon buildout' },
    ],
    featured: true,
  },
  {
    slug: 'office-to-warehouse-flex',
    title: 'Office-to-Warehouse Flex Conversion',
    clientType: 'Building owner',
    serviceSlug: 'warehouse-conversion',
    scopeSummary:
      'Converted a traditional office building into warehouse flex space to match post-COVID demand.',
    challenge: [
      'Office demand softened after COVID, and the owner had a building that was harder to lease as straight office. They needed to repurpose it into something the market actually wanted — flex space — without over-investing in a use that might shift again.',
    ],
    solution: [
      'We converted the office building into warehouse flex space, keeping what was usable and reworking what wasn’t, so the property could compete for the tenants that are actually looking today.',
    ],
    images: [
      { url: '/projects/office-to-warehouse-flex/1.jpg', alt: 'Office building converted to warehouse flex space' },
    ],
    featured: true,
  },
  {
    slug: 'paint-12-buildings',
    title: 'Exterior Repaint, 12-Building Portfolio',
    clientType: 'Property owner',
    serviceSlug: 'building-repair',
    scopeSummary:
      'Exterior repaint across a 12-building portfolio to lift curb appeal and rental potential.',
    challenge: [
      'First impressions drive leasing, and a 12-building portfolio had aged to the point where the exteriors were working against the owner. The job had to move across all twelve without turning into a disruption for the tenants already there.',
    ],
    solution: [
      'We repainted all twelve buildings and gave the portfolio the facelift it needed — better curb appeal, stronger rental potential, and a set of buildings that finally showed as well as they leased.',
    ],
    images: [
      { url: '/projects/paint-12-buildings/1.jpg', alt: 'Repainted commercial building exterior' },
    ],
    featured: false,
  },
];

export const FALLBACK_PROJECTS_BY_SLUG: Record<string, FallbackProject> =
  Object.fromEntries(FALLBACK_PROJECTS.map((p) => [p.slug, p]));
