/**
 * Fallback city-hub content for the Tier-1 cities, overridden by the Sanity
 * `city` document when authored (and by `npm run seed`, which writes the same
 * content). Jurisdiction notes are REAL, checkable facts about each authority,
 * with the standard "confirm with the AHJ" caveat — not invented specifics.
 *
 * A city hub is substantive on its own (real jurisdiction note + intro + service
 * links + CTA); the anti-thin-content rule that gates the service×city matrix
 * does not gate these. Local projects render only when real ones exist.
 *
 * Optional money-page fields (Atlanta first) expand a hub without inventing a
 * second template. Leave them off and the page stays the original short layout.
 */
export interface CityProofProject {
  slug: string;
  title: string;
  clientType?: string;
  cityName?: string;
  cityState?: string;
  scopeSummary?: string;
}

export interface CityRelatedLink {
  href: string;
  title: string;
  blurb: string;
}

export interface FallbackCity {
  slug: string;
  name: string;
  state: string;
  county: string;
  tier: number;
  intro: string;
  jurisdiction: string[];
  metaTitle?: string;
  metaDescription?: string;
  h1?: string;
  introAfter?: string[];
  servicesHeading?: string;
  serviceOutcomes?: Record<string, string>;
  jurisdictionHeading?: string;
  jurisdictionBullets?: string[];
  jurisdictionLink?: { href: string; label: string };
  metroHeading?: string;
  metroIntro?: string;
  metroPlaces?: { name: string; note: string }[];
  metroTimingNote?: string;
  proofHeading?: string;
  proofIntro?: string;
  proofProjects?: CityProofProject[];
  costHeading?: string;
  costIntro?: string;
  costBands?: { label: string; value: string; href?: string }[];
  relatedReading?: CityRelatedLink[];
  faqs?: { q: string; a: string }[];
}

export const FALLBACK_CITIES: FallbackCity[] = [
  {
    slug: 'atlanta-ga',
    name: 'Atlanta',
    state: 'ga',
    county: 'Fulton',
    tier: 1,
    metaTitle: 'Commercial General Contractor Atlanta GA | Mark Allan Contracting',
    metaDescription:
      'Commercial interiors in Atlanta since 1999 — tenant improvements, restaurant and retail buildouts, permitting through the City of Atlanta Office of Buildings. Typical jobs $50K–$500K. Call (404) 724-8709.',
    h1: 'Commercial General Contractor in Atlanta, GA',
    intro:
      'Family-owned commercial general contractor in Atlanta since 1999. Tenant improvements, restaurant and retail buildouts, office renovations, warehouse conversions — typically $50K–$500K. Tenants, operators, and brokers call us when a space has a date on it and the lease clock is already running.',
    introAfter: [
      'Atlanta is home base. The office is on Oakcliff Road, and most interiors we run start inside the Perimeter or one county over. The work is the same as it is anywhere: walk the space, price the actual conditions, pull the permits, build. What changes here is the jurisdiction. City of Atlanta is not Fulton County. A Gwinnett address is not a Cobb address. Getting that wrong is how opening dates slip before a crew ever shows up.',
      "If you have a suite, a storefront, or a box that has to be occupiable, that's the call. Under $50K you're usually better with a handyman and we'll tell you so. Over $500K you probably want a firm with a project-management department. Right in the middle is where we do our best work.",
    ],
    servicesHeading: 'What we build in Atlanta',
    serviceOutcomes: {
      'tenant-improvements':
        'Lease signed, allowance to spend, rent commencement coming. We price against the landlord’s scope and turn the suite over before that date.',
      'office-renovation':
        'Reconfigure a floor that’s still in use, or turn a suite between tenants without blowing the next move-in.',
      'warehouse-conversion':
        'Empty box to occupiable — office build-in, restrooms, docks, and the code work a new use actually requires.',
      'restaurant-buildout':
        'Kitchen, hood, grease, and finish sequenced to an open date. We have run this play more than a hundred times.',
      'retail-buildout':
        'Storefront, finishes, and brand package reconciled to the real shell — handed back in time to stock and train.',
      'building-repair':
        'Water, envelope, storefront, structural — the calls that cannot wait until next month.',
      'flooring-interior-trades':
        'Framing, drywall, paint, ACT, and flooring under one contract instead of four separate subs.',
    },
    jurisdiction: [
      'Projects inside the City of Atlanta are permitted through the city’s Office of Buildings, not Fulton County — the city is its own authority having jurisdiction. Commercial interior work generally requires a building permit plus separate electrical, mechanical, and plumbing permits, and a change of occupancy triggers additional review. Confirm current requirements with the City of Atlanta Office of Buildings for your specific address.',
      'Treat that as the starting map, not the permit. What actually gets pulled, and in what order, depends on the scope.',
    ],
    jurisdictionHeading: 'Permitting in Atlanta (City vs county)',
    jurisdictionBullets: [
      'Building permit for the physical work — walls, doors, ceilings, anything structural.',
      'Separate trade permits for electrical, mechanical, and plumbing, usually pulled by the licensed trade doing that work.',
      'A change of occupancy — retail to restaurant, office to clinic, storage to assembly — is a different review, not a finish upgrade. Expect more scrutiny on exiting, restrooms, ventilation, and accessibility.',
      'Fire marshal review is often a separate track from building review. It can be the long pole. Do not assume it runs automatically in parallel.',
    ],
    jurisdictionLink: {
      href: '/insights/permitting',
      label: 'Permitting a commercial buildout in Metro Atlanta',
    },
    metroHeading: 'Metro jurisdictions we work',
    metroIntro:
      'We work Atlanta and the surrounding counties. The pattern is consistent even when the office is not: if the address sits inside a city, that city usually permits the job. Unincorporated addresses go through the county. Confirm the AHJ by address, not by mailing city.',
    metroPlaces: [
      {
        name: 'City of Atlanta',
        note: 'Office of Buildings. Own AHJ — not Fulton County.',
      },
      {
        name: 'DeKalb',
        note: 'County process in unincorporated DeKalb; cities inside DeKalb permit their own.',
      },
      {
        name: 'Gwinnett',
        note: 'County plan review in unincorporated Gwinnett; Duluth, Lawrenceville, Suwanee and others run their own.',
      },
      {
        name: 'Cobb',
        note: 'County Community Development in unincorporated Cobb; Marietta, Smyrna, Kennesaw permit their own.',
      },
      {
        name: 'North Fulton cities',
        note: 'Alpharetta, Sandy Springs, and neighboring cities are their own municipalities. They do not permit through Fulton County.',
      },
    ],
    metroTimingNote:
      'We do not quote AHJ review SLAs. Review time is the jurisdiction’s, not ours. The orientation we give clients: hope for about two weeks, expect about four, and confirm the current window with the authority that actually has your address. Anything faster is icing.',
    proofHeading: "Atlanta jobs we've delivered",
    proofIntro:
      'Atlanta-local and metro jobs already handed back. Real spaces, real dates — not a stock photo of someone else’s storefront.',
    proofProjects: [
      {
        slug: 'verizon-retail-buildout-glenwood-park-atlanta',
        title: 'Verizon Retail Buildout in Glenwood Park — Six Weeks to Handoff',
        clientType: 'Verizon authorized retail operator (MobileGen)',
        cityName: 'Atlanta',
        cityState: 'ga',
        scopeSummary:
          "Interior retail buildout of a Verizon store in Atlanta's Glenwood Park neighborhood development, completed in a six-week turnaround and handed back to the operator so their team could stock, train, and open.",
      },
      {
        slug: 'proud-moments-aba-therapy-clinic-buildout',
        title: 'ABA Therapy Clinic Buildout — Proud Moments ABA',
        clientType: 'Pediatric ABA therapy provider (multi-site clinical operator)',
        cityName: 'Austell',
        cityState: 'ga',
        scopeSummary:
          'Full interior tenant improvement of a shell office suite into a pediatric ABA therapy clinic: partial demo, partition framing, ceilings and lighting, LVT flooring, painted accent walls, electrical, fire alarm and sprinkler work, plus an interior climbing wall, dimensional signage, and themed wall graphics.',
      },
      {
        slug: 'office-to-warehouse-flex-conversion',
        title: 'Office Building Converted to Warehouse Flex Space',
        clientType: 'Building owner leasing commercial space',
        cityName: 'Peachtree Corners',
        cityState: 'ga',
        scopeSummary:
          'Converted an underused 50,000-square-foot office building in Peachtree Corners, Georgia into warehouse flex space. We kept the structure and systems that still worked, opened up the rest, and installed roll-up doors so the building shows the way flex tenants expect.',
      },
    ],
    costHeading: 'Cost and timeline orientation',
    costIntro:
      'A per-foot average is a sanity check, not a budget. The number that matters is built from your space and your scope. Typical interiors we run land in these bands — then a site walk replaces the band with a number.',
    costBands: [
      {
        label: 'Tenant improvements',
        value: '$50K–$300K',
        href: '/project-types/tenant-improvements',
      },
      {
        label: 'Restaurant buildouts',
        value: '$100K–$500K',
        href: '/project-types/restaurant-buildout',
      },
      { label: 'Sweet spot', value: '$50K–$500K' },
    ],
    relatedReading: [
      {
        href: '/insights/permitting',
        title: 'Permitting a commercial buildout in Metro Atlanta',
        blurb: 'City vs county, trade permits, change of occupancy, and fire review as a separate track.',
      },
      {
        href: '/insights/tenant-improvement-cost-per-square-foot',
        title: 'Tenant improvement cost per square foot',
        blurb: 'Why the per-foot range is so wide, and how to get a number you can actually use.',
      },
      {
        href: '/insights/commercial-buildout-timeline',
        title: 'How long a commercial buildout takes',
        blurb: 'Hope ~2 weeks / expect ~4 on permitting. Construction is the predictable part.',
      },
    ],
    faqs: [
      {
        q: 'Is a City of Atlanta project permitted by Fulton County?',
        a: 'No. Projects inside the City of Atlanta go through the City of Atlanta Office of Buildings, not Fulton County — the city is its own authority having jurisdiction. Unincorporated Fulton and some north Fulton cities run a different process. Confirm which AHJ covers your exact address before you plan the schedule.',
      },
      {
        q: 'Do I need a permit for a small office remodel in Atlanta?',
        a: 'Usually yes if you are moving walls, changing electrical, or touching mechanical or plumbing. Paint and carpet often do not require one. Ask the building department about your specific scope before work starts — doing permit-required work without one is expensive to unwind.',
      },
      {
        q: 'What does a tenant improvement or restaurant buildout typically cost?',
        a: 'Most tenant improvements we do land in the $50K–$300K range. Most restaurant buildouts land in the $100K–$500K range, driven more by the kitchen than the dining room. Our overall sweet spot is $50K–$500K. The only number worth budgeting against is a scoped estimate from a walk of your space.',
      },
      {
        q: 'How long from a site walk to certificate of occupancy?',
        a: 'A site walk and estimate are days, not weeks, on most interiors. Construction for this size of job is fairly predictable. Permitting is the wild card: hope for about two weeks, expect about four, and confirm with the AHJ for that address. Punch, finals, and CO are days plus inspector availability. Plan the opening off the CO date, not the last day of construction.',
      },
      {
        q: 'Where do you work besides Atlanta?',
        a: 'Atlanta is home base. We work the metro — DeKalb, Gwinnett, Cobb, north Fulton cities — and commercial interiors across Georgia, Tennessee, Alabama, and South Carolina. Same $50K–$500K interiors. Call and we will tell you if the address is a fit.',
      },
      {
        q: 'Who usually calls you on an Atlanta job?',
        a: 'Tenants with a lease clock, operators opening a location, and brokers or property managers who need a GC they can hand a deal to. If the space has to be ready and the number has to hold, that is the call.',
      },
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
