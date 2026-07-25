/**
 * Fallback city-hub content for the Tier-1 cities, overridden by the Sanity
 * `city` document when authored (and by `npm run seed`, which writes the same
 * content). Jurisdiction notes are REAL, checkable facts about each authority,
 * with the standard "confirm with the AHJ" caveat — not invented specifics.
 *
 * A city hub is substantive on its own (real jurisdiction note + intro + service
 * links + CTA); the anti-thin-content rule that gates the service×city matrix
 * does not gate these. Local projects render only when real ones exist.
 */
export interface FallbackCity {
  slug: string;
  name: string;
  state: string;
  county: string;
  tier: number;
  intro: string;
  jurisdiction: string[];
}

export const FALLBACK_CITIES: FallbackCity[] = [
  {
    slug: 'atlanta-ga',
    name: 'Atlanta',
    state: 'ga',
    county: 'Fulton',
    tier: 1,
    intro:
      'Mark Allan Contracting builds commercial interiors across Atlanta and the surrounding market — tenant improvements, restaurant and retail buildouts, office and warehouse work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Projects inside the City of Atlanta are permitted through the city’s Office of Buildings, not Fulton County — the city is its own authority having jurisdiction. Commercial interior work generally requires a building permit plus separate electrical, mechanical, and plumbing permits, and a change of occupancy triggers additional review. Confirm current requirements with the City of Atlanta Office of Buildings for your specific address.',
    ],
  },
  {
    slug: 'alpharetta-ga',
    name: 'Alpharetta',
    state: 'ga',
    county: 'Fulton',
    tier: 1,
    intro:
      'We build commercial interiors across Alpharetta — office, retail, restaurant, and tenant improvements. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Alpharetta permits commercial work through the City of Alpharetta Community Development department, not Fulton County. Plan review and inspections run on the city’s process. As with any interior buildout, a change of use can pull in accessibility and life-safety upgrades. Confirm current requirements with the City of Alpharetta for your specific address.',
    ],
  },
  {
    slug: 'marietta-ga',
    name: 'Marietta',
    state: 'ga',
    county: 'Cobb',
    tier: 1,
    intro:
      'We build commercial interiors across Marietta and Cobb County — tenant improvements, office, retail, and restaurant work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'An address inside the City of Marietta is generally permitted by the city; addresses in unincorporated Cobb go through Cobb County. Which authority has jurisdiction is the first thing to confirm, because it sets the process and the timeline. Confirm current requirements with the City of Marietta or Cobb County for your specific address.',
    ],
  },
  {
    slug: 'duluth-ga',
    name: 'Duluth',
    state: 'ga',
    county: 'Gwinnett',
    tier: 1,
    intro:
      'We build commercial interiors across Duluth and Gwinnett County — restaurant, retail, office, and tenant improvement work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Duluth addresses inside the city limits are typically permitted by the City of Duluth; unincorporated addresses go through Gwinnett County. Gwinnett runs commercial plan review with defined submittal steps, and inspection scheduling is a real factor near completion. Confirm current requirements with the City of Duluth or Gwinnett County for your specific address.',
    ],
  },
  {
    slug: 'sandy-springs-ga',
    name: 'Sandy Springs',
    state: 'ga',
    county: 'Fulton',
    tier: 1,
    intro:
      'We build commercial interiors across Sandy Springs — office renovation, tenant improvements, and retail work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Sandy Springs is its own municipality and permits commercial work through the city, not Fulton County. The city has historically used an outsourced development-services model with defined review windows. Confirm current requirements with the City of Sandy Springs for your specific address.',
    ],
  },
  {
    slug: 'buford-ga',
    name: 'Buford',
    state: 'ga',
    county: 'Gwinnett',
    tier: 1,
    intro:
      'We build commercial interiors across Buford — warehouse conversion, restaurant, and tenant improvement work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Buford straddles Gwinnett and Hall counties and operates its own city services; permitting authority depends on the exact address and whether it sits inside the city limits. Confirm which authority has jurisdiction — City of Buford, Gwinnett County, or Hall County — before planning the schedule.',
    ],
  },
  {
    slug: 'gwinnett-ga',
    name: 'Gwinnett County',
    state: 'ga',
    county: 'Gwinnett',
    tier: 1,
    intro:
      'We build commercial interiors across Gwinnett County — warehouse conversion, restaurant, retail, office, and tenant improvement work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Unincorporated Gwinnett County permits commercial work through its Department of Planning and Development, while the county’s many cities (Duluth, Lawrenceville, Suwanee, and others) permit their own. Gwinnett runs a defined commercial plan-review process; confirm current requirements and which authority applies to your specific address.',
    ],
  },
  {
    slug: 'cobb-ga',
    name: 'Cobb County',
    state: 'ga',
    county: 'Cobb',
    tier: 1,
    intro:
      'We build commercial interiors across Cobb County — warehouse conversion, office, retail, and tenant improvement work. Family-owned since 1999, projects from $50K to $500K.',
    jurisdiction: [
      'Unincorporated Cobb County permits through its Community Development department; cities like Marietta, Smyrna, and Kennesaw permit their own. Determine which authority has jurisdiction over your address first, since it governs the process and inspection scheduling. Confirm current requirements with the applicable authority.',
    ],
  },
];

export const FALLBACK_CITIES_BY_SLUG: Record<string, FallbackCity> =
  Object.fromEntries(FALLBACK_CITIES.map((c) => [c.slug, c]));
