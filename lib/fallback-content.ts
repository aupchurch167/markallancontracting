import type { ServiceKey } from './site-data';

/**
 * Editorial fallback copy for service hubs, used until the Sanity `service`
 * documents are authored (at which point Sanity wins with zero code changes).
 *
 * Register here is down-funnel per the voice doc: plain, specific, question-
 * answering — not homepage rhythm. Ranges/timelines are typical industry
 * defaults framed as "typical"; verify against MAC's real numbers before launch
 * and move into Sanity. No responsiveness guarantees (claim honesty).
 *
 * Optional money-page fields (tenant improvements first) expand a hub without
 * inventing a second template. Leave them off and the page stays the original
 * short layout.
 */
export interface ServiceProofProject {
  slug: string;
  title: string;
  clientType?: string;
  cityName?: string;
  cityState?: string;
  scopeSummary?: string;
  imageUrl?: string;
}

export interface ServiceRelatedLink {
  href: string;
  title: string;
  blurb: string;
}

export interface ServiceCostRow {
  item: string;
  typical: string;
  note: string;
  href?: string;
  linkLabel?: string;
}

export interface ServiceContent {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  problem: string;
  scope: string[];
  typicalRange: string;
  typicalTimeline: string;
  planIntro: string;
  faqs: { q: string; a: string }[];
  includesVsSwingers?: {
    heading: string;
    intro: string;
    includesHeading: string;
    includes: { label: string; note: string }[];
    swingersHeading: string;
    swingers: { label: string; note: string }[];
    after: string;
    insightHref: string;
    insightLabel: string;
    alsoLink?: { href: string; label: string };
  };
  /**
   * Kitchen-first "what's included" sequence, authored for kitchen-driven builds
   * (e.g. restaurant buildout). When present it replaces the plain trade list.
   */
  kitchenScope?: {
    heading: string;
    intro: string;
    items: { label: string; note: string; critical?: boolean }[];
  };
  costTable?: {
    heading: string;
    intro: string;
    /** Optional caption shown under the table (also used as the table's accessible caption). */
    caption?: string;
    rows: ServiceCostRow[];
    after: string;
  };
  /** Franchise / multi-unit playbook block, authored for franchise-heavy trades. */
  franchisePlaybook?: {
    heading: string;
    intro: string;
    items: { label: string; note: string }[];
    after: string;
    aboutHref: string;
    aboutLabel: string;
  };
  proofHeading?: string;
  proofIntro?: string;
  proofProjects?: ServiceProofProject[];
  relatedReading?: ServiceRelatedLink[];
  crossLinks?: ServiceRelatedLink[];
  /** Optional closing-CTA copy overrides for kitchen/franchise-driven pages. */
  ctaHeading?: string;
  ctaBody?: string;
}

export const SERVICE_CONTENT: Record<ServiceKey, ServiceContent> = {
  'tenant-improvements': {
    h1: 'Tenant Improvement Contractor in Metro Atlanta',
    metaTitle: 'Tenant Improvement Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Metro Atlanta tenant improvements. Scoped estimates, not a per-foot guess. Typical jobs $50K–$300K, 4–12 weeks. Call (404) 724-8709 to walk the space.',
    problem:
      'You have a lease signed and a build-out allowance to spend, and the clock started the day you took the keys. You need a contractor who can price the work against the landlord’s scope, pull the permit, and turn the space over before rent commencement catches up with you.',
    scope: [
      'Demo and selective interior demolition',
      'Metal stud framing and drywall',
      'Ceilings — ACT and hard-lid',
      'Storefront and interior glazing',
      'Electrical, lighting, and low-voltage rough-in and trim',
      'HVAC modification and distribution',
      'Plumbing rough-in and fixtures',
      'Flooring — LVT, tile, carpet, sealed concrete',
      'Paint and interior finishes',
      'ADA restrooms and code upgrades',
    ],
    typicalRange: '$50K–$300K',
    typicalTimeline: '4–12 weeks depending on scope and permitting',
    planIntro:
      'Same three steps on every job. What changes is the scope, not the process.',
    includesVsSwingers: {
      heading: 'What a TI includes vs. what swings the budget',
      intro:
        'A tenant improvement is the interior work that makes a leased space work for your use. Demo, framing, drywall, ceilings, lighting, flooring, and paint are the usual package. The budget swingers are the systems — HVAC, the electrical panel, restrooms, and a change of occupancy — not the finishes.',
      includesHeading: 'Usually in the package',
      includes: [
        { label: 'Demo and selective demolition', note: 'What has to come out before the new layout goes in.' },
        { label: 'Framing, drywall, ceilings', note: 'Metal stud partitions, ACT or hard-lid, storefront and interior glass.' },
        { label: 'Lighting and branch electrical', note: 'Rough-in, fixtures, and trim — assuming the panel can carry it.' },
        { label: 'Flooring and paint', note: 'LVT, tile, carpet, sealed concrete, and interior finishes.' },
        { label: 'HVAC distribution', note: 'Duct and diffusers inside the suite, when the unit already has capacity.' },
        { label: 'Restroom finishes', note: 'Fixtures and ADA upgrades in restrooms that stay where they are.' },
      ],
      swingersHeading: 'What actually swings the number',
      swingers: [
        {
          label: 'HVAC capacity or replacement',
          note: 'Tonnage, a rooftop unit that is not actually delivered, or distribution that cannot serve the new layout.',
        },
        {
          label: 'Electrical panel and service size',
          note: 'Amps at the panel vs. amps your use needs. A service upgrade is a different job than swapping fixtures.',
        },
        {
          label: 'Moving restrooms',
          note: 'Bathrooms tie to gravity waste lines in the slab. Relocating one is a plumbing project with a finish attached, not a layout preference.',
        },
        {
          label: 'Change of occupancy',
          note: 'Retail to restaurant, office to clinic, storage to assembly. That is a different review — exiting, restrooms, ventilation, accessibility — not a finish upgrade.',
        },
      ],
      after:
        'We do not publish a per-foot number you can write a check against. The range is too wide, and the average is someone else’s building.',
      insightHref: '/insights/tenant-improvement-cost-per-square-foot',
      insightLabel: 'What actually moves TI cost (no $/SF guess)',
      alsoLink: { href: '/project-types/restaurant-buildout', label: 'A kitchen is a different job' },
    },
    costTable: {
      heading: 'Cost and timeline',
      intro:
        'A per-foot average is a sanity check, not a budget. Typical tenant improvements we run land in the $50K–$300K band, over 4–12 weeks of construction. Company-wide, interiors sit in a $50K–$500K sweet spot — most TIs are in the lower part of that range. The number that matters is built from your space.',
      rows: [
        {
          item: 'Typical TI we run',
          typical: '$50K–$300K',
          note: 'Use, existing conditions, systems, and finishes drive the spread. Company-wide interiors run $50K–$500K; most TIs sit in $50K–$300K.',
          href: '/insights/tenant-improvement-cost-per-square-foot',
          linkLabel: 'Why we don’t quote $/SF',
        },
        {
          item: 'Construction',
          typical: '4–12 weeks',
          note: 'The build is the predictable part. Permitting and long-lead items are what usually move the date.',
          href: '/insights/commercial-buildout-timeline',
          linkLabel: 'What actually moves your date',
        },
        {
          item: 'Work letter / TI allowance',
          typical: 'Read before you sign',
          note: 'The allowance is a landlord contribution, not the budget. Gaps in the work letter become tenant cost after signature.',
          href: '/insights/tenant-improvement',
          linkLabel: 'Who pays for what',
        },
        {
          item: 'Permitting',
          typical: 'Jurisdiction’s clock',
          note: 'City of Atlanta, DeKalb, Gwinnett, and Cobb each run their own review. Confirm the AHJ by address, not mailing city.',
          href: '/insights/permitting',
          linkLabel: 'How Metro Atlanta permitting works',
        },
      ],
      after:
        'A site walk replaces the band with a number and a schedule you can defend.',
    },
    proofHeading: 'TIs we have handed back',
    proofIntro:
      'Real suites, real dates — not a stock photo of someone else’s storefront. Numbers below are from the project pages, not estimates.',
    proofProjects: [
      {
        slug: 'proud-moments-aba-therapy-clinic-buildout',
        title: 'ABA Therapy Clinic Buildout — Proud Moments ABA',
        clientType: 'Pediatric ABA therapy provider',
        cityName: 'Austell',
        cityState: 'ga',
        scopeSummary:
          'Full interior tenant improvement of a shell office suite into a pediatric ABA therapy clinic: partial demo, partition framing, ceilings and lighting, LVT flooring, painted accent walls, electrical, fire alarm and sprinkler work, plus an interior climbing wall, dimensional signage, and themed wall graphics.',
      },
      {
        slug: 'iv-nutrition-clinic-buildout-flowery-branch',
        title: 'IV Nutrition Clinic Buildout in Flowery Branch, GA',
        clientType: 'IV nutrition clinic',
        cityName: 'Flowery Branch',
        cityState: 'ga',
        scopeSummary:
          '~2,000 SF / ~10 weeks / ~$200K clinic buildout in Flowery Branch: demolition, framing, insulation, drywall with curved ceiling features, paint, flooring, lighting.',
      },
      {
        slug: 'pilates-studio-buildout-kennesaw-ga',
        title: 'Pilates Studio Buildout in Kennesaw, GA',
        clientType: 'Pilates studio',
        cityName: 'Kennesaw',
        cityState: 'ga',
        scopeSummary:
          'Full tenant buildout of a Pilates studio — open workout floor, custom millwork including a built fitness wall and sliding barn doors, high-end finishes. Delivered in an 8-week turnaround.',
        imageUrl: '/projects/kennesaw-pilates-studio/4.jpg',
      },
      {
        slug: 'tanning-salon-buildout-fixed-open-date',
        title: '1,500 SF Tanning Salon Buildout Delivered on a Fixed Open Date',
        clientType: 'Tanning salon operator',
        cityName: 'Gainesville',
        cityState: 'ga',
        scopeSummary:
          'Eight-week interior buildout of a 1,500-square-foot tanning salon in Gainesville — retail display walls, reception, waiting area, and 12 private tanning rooms, sequenced around a fixed open date.',
        imageUrl: '/projects/tanning-salon-buildout/1.jpg',
      },
    ],
    relatedReading: [
      {
        href: '/insights/tenant-improvement-cost-per-square-foot',
        title: 'Tenant improvement cost per square foot',
        blurb: 'Why the per-foot range is so wide, and how to get a number you can actually use.',
      },
      {
        href: '/insights/commercial-buildout-timeline',
        title: 'How long a commercial buildout takes',
        blurb: 'Construction is the predictable part. Permitting and long-lead items move the date.',
      },
      {
        href: '/insights/tenant-improvement',
        title: 'Who pays for what in a work letter',
        blurb: 'The lease exhibit that decides your out-of-pocket cost — read it against the space before you sign.',
      },
      {
        href: '/insights/permitting',
        title: 'Permitting a commercial buildout in Metro Atlanta',
        blurb: 'City vs county, trade permits, change of occupancy, and fire review as a separate track.',
      },
    ],
    crossLinks: [
      {
        href: '/project-types/restaurant-buildout',
        title: 'Restaurant buildout',
        blurb:
          'A kitchen is a different TI. Hood, grease, make-up air, and health department review drive the budget more than the dining room.',
      },
      {
        href: '/locations/atlanta-ga',
        title: 'Commercial GC in Atlanta, GA',
        blurb:
          'City of Atlanta is its own AHJ — not Fulton County. Home-base page for permitting, metro jurisdictions, and how we work here.',
      },
    ],
    faqs: [
      {
        q: 'How much does a tenant improvement cost?',
        a: 'It depends heavily on use, existing conditions, and finishes. Most tenant improvements we do land in the $50K–$300K range. Company-wide, interiors sit in a $50K–$500K sweet spot — most TIs are in the lower part of that band. The only number worth budgeting against is a scoped estimate built from your space. A site walk gets you one. [Why we don’t quote a $/SF average](/insights/tenant-improvement-cost-per-square-foot).',
      },
      {
        q: 'How long does a tenant improvement take?',
        a: 'Typically four to twelve weeks of construction depending on scope, but permitting and long-lead items often drive the calendar more than the build itself. We give you a realistic schedule with the estimate. [What actually moves a commercial buildout date](/insights/commercial-buildout-timeline).',
      },
      {
        q: 'Do you handle permitting across City of Atlanta, DeKalb, Gwinnett, and Cobb?',
        a: 'Yes. We pull the building and trade permits and coordinate with the jurisdiction. If the address sits inside a city, that city usually permits the job — not the county. City of Atlanta is its own AHJ, not Fulton County. DeKalb, Gwinnett, and Cobb each run a county process in unincorporated areas; cities inside those counties permit their own. Confirm the AHJ by address, not mailing city. [Permitting a commercial buildout in Metro Atlanta](/insights/permitting) · [Atlanta location](/locations/atlanta-ga).',
      },
      {
        q: 'Can you work around the landlord’s work letter?',
        a: 'Yes — and we read it against the space before we price, so the split between landlord and tenant scope is clear and the gaps get caught before they become change orders. [Who pays for what in a tenant improvement](/insights/tenant-improvement).',
      },
      {
        q: 'Does the landlord’s TI allowance cover the actual cost?',
        a: 'Usually not, or not all of it. The allowance is a dollar contribution negotiated in the lease — not a scope. Everything past it is yours, and anything the work letter left unclaimed becomes a tenant cost after you sign. Read what it covers, when it is paid (up front vs. reimbursed after CO), and have a contractor walk the space against that letter before you treat the allowance as the budget. [How a work letter actually splits cost](/insights/tenant-improvement).',
      },
      {
        q: 'What’s the difference between second-generation space and a shell?',
        a: 'Second-generation space was already built out, usually for a similar use. You may inherit restrooms, HVAC, electrical distribution, and a ceiling grid — which cuts a meaningful share of scope before design starts. A cold dark shell is slab, exterior walls, and utility stubs. Same floor area, very different job. Two identical plans in the same building can land far apart on cost because of this column alone. [What existing conditions do to a TI number](/insights/tenant-improvement-cost-per-square-foot).',
      },
      {
        q: 'Should I walk the space before I sign the lease?',
        a: 'Yes. A contractor reading the work letter against the actual panel, HVAC unit, and drain locations will find the items neither party claimed — while they are still negotiable. After signature, those same items are tenant cost. Bring drawings, the lease exhibit, and your target date. It takes about an hour. [Atlanta office and how to reach us](/locations/atlanta-ga).',
      },
    ],
  },
  'office-renovation': {
    h1: 'Commercial Office Renovation in Metro Atlanta',
    metaTitle: 'Commercial Office Renovation Atlanta | Mark Allan Contracting',
    metaDescription:
      'Office renovation and reconfiguration across Metro Atlanta. Phased work around occupied floors, real numbers, on-schedule delivery.',
    problem:
      'You are reconfiguring a floor that people still work on, or turning over a suite between tenants with a hard move-in date. Either way you need the work sequenced so it does not shut down the business, and priced so you can defend it to ownership.',
    scope: [
      'Space planning coordination and demolition',
      'Framing, drywall, and acoustic partitions',
      'Ceilings, lighting, and electrical distribution',
      'HVAC zoning and controls',
      'Glass fronts, doors, and hardware',
      'Flooring and wall finishes',
      'Break rooms and restroom upgrades',
      'Phased work around occupied areas',
    ],
    typicalRange: '$60K–$400K',
    typicalTimeline: '6–14 weeks depending on phasing',
    planIntro: 'We scope the phasing before the price so there are no surprises.',
    faqs: [
      {
        q: 'Can you renovate while we stay in the space?',
        a: 'Usually, yes. We phase the work around occupied areas and sequence the disruptive trades for off-hours where it matters. We scope the phasing before we price it so the plan is realistic.',
      },
      {
        q: 'What does an office renovation typically cost?',
        a: 'Most office renovations we do fall in the $60K–$400K range, driven mostly by how much of the HVAC, electrical, and layout changes. A site walk produces a real number for your floor.',
      },
      {
        q: 'How long will it take?',
        a: 'Typically six to fourteen weeks depending on phasing and scope. Working around an occupied floor adds time but avoids shutting down the business.',
      },
    ],
  },
  'warehouse-conversion': {
    h1: 'Warehouse Conversion & Buildout Contractor in Georgia',
    metaTitle: 'Warehouse Buildout Contractor Georgia | Mark Allan Contracting',
    metaDescription:
      'Warehouse conversions and buildouts across Georgia — office build-in, dock work, restrooms, code upgrades. Get a scoped number.',
    problem:
      'You have shell warehouse space and a tenant who needs office, restrooms, and a use the building was not originally finished for. The gap between “empty box” and “occupiable” is where the budget lives, and you need it scoped honestly before you commit.',
    scope: [
      'Office and mezzanine build-in',
      'Restrooms and ADA compliance',
      'Demising walls and tenant separation',
      'Dock doors, levelers, and man doors',
      'Warehouse lighting and power distribution',
      'HVAC for office and conditioned areas',
      'Fire protection coordination',
      'Epoxy and sealed floors',
    ],
    typicalRange: '$75K–$500K',
    typicalTimeline: '8–16 weeks depending on scope',
    planIntro: 'We walk the box with you and scope what it actually takes to occupy it.',
    faqs: [
      {
        q: 'What does it cost to convert a warehouse for a tenant?',
        a: 'Warehouse conversions run a wide range — most of ours land in $75K–$500K — because the gap between an empty box and occupiable space depends entirely on how much office, restroom, and system work the use requires.',
      },
      {
        q: 'Do you build office space inside the warehouse?',
        a: 'Yes — office build-in, mezzanines, restrooms, demising walls, and the HVAC and power to condition them. That build-in is usually where most of the budget lives.',
      },
      {
        q: 'Can you add or modify dock doors?',
        a: 'Yes. Dock doors, levelers, and man doors are common in a conversion, and we coordinate the structural and site work they require.',
      },
    ],
  },
  'restaurant-buildout': {
    h1: 'Restaurant Buildout & Construction in Metro Atlanta',
    metaTitle: 'Restaurant Buildout Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Restaurant buildouts in Metro Atlanta — kitchen, hood, grease, dining. 100+ franchise jobs. Typical $100K–$500K, 8–16 weeks. Call (404) 724-8709 before locking an open date.',
    problem:
      'Every day past your target open date is revenue you do not get back, and a restaurant build has more ways to slip than any other interior — health department, hood and grease, equipment lead times, and a franchisor watching the schedule. You need a GC who has run this exact play before.',
    scope: [
      'Hood, make-up air, and exhaust',
      'Grease interceptor and kitchen plumbing',
      'Walk-in coolers and freezers',
      'MEP upgrades for kitchen load — power, gas, water',
      'Kitchen equipment set and connections',
      'Dining room framing, finishes, and millwork',
      'Bar construction and equipment',
      'Restrooms and ADA compliance',
      'Storefront, signage coordination, and patio work',
      'Health department and franchisor punch',
    ],
    typicalRange: '$100K–$500K',
    typicalTimeline: '8–16 weeks depending on kitchen scope',
    planIntro:
      'We have done over a hundred franchise buildouts. The sequence is not new to us.',
    kitchenScope: {
      heading: 'Kitchen first — then dining, then punch',
      intro:
        'A restaurant build is a kitchen job that happens to have a dining room. Hood and make-up air, grease interceptor, refrigeration, then the MEP a kitchen actually pulls, then dining and bar, then health department and franchisor punch. The items marked schedule-critical are the ones that miss an open date if they are ordered late or left out of the work letter.',
      items: [
        {
          label: 'Hood, make-up air, and exhaust',
          note: 'Code-driven mechanical, not a finish choice. Built to order, so the lead time starts the day the scope is set — not the day the ceiling is ready to close.',
          critical: true,
        },
        {
          label: 'Grease interceptor and kitchen plumbing',
          note: 'Often below-slab and jurisdiction-specific. A change of occupancy from retail to restaurant is where this lands, and missing it early is how a budget and a slab both get opened twice.',
          critical: true,
        },
        {
          label: 'Walk-in coolers and freezers',
          note: 'Refrigeration, drainage, and the power to run them. Factory lead times, not a warehouse pull. Order with the hood.',
          critical: true,
        },
        {
          label: 'MEP upgrades for kitchen load',
          note: 'Power, gas, and water the space was rarely built for. Panel and service size, gas routing, and exhaust are budget swingers — not dining-room decisions.',
        },
        {
          label: 'Kitchen equipment set',
          note: 'Connections and coordination around owner-furnished or GC-furnished equipment. Late owner deliveries are a finished kitchen that still cannot cook.',
        },
        {
          label: 'Dining room, bar, restrooms, storefront',
          note: 'Framing, finishes, millwork, bar equipment, ADA restrooms, signage and patio. Visible, and usually not where the date slips.',
        },
        {
          label: 'Health department and franchisor punch',
          note: 'Building final and health-department approval are different inspections on different clocks. Franchisor punch is a third list. Plan the open date off the last one, not the last day of construction.',
        },
      ],
    },
    costTable: {
      heading: 'Typical kitchen cost and timeline — not a bid',
      intro:
        'Most restaurant buildouts we do land in $100K–$500K and eight to sixteen weeks of construction depending on kitchen scope. Those are typical bands, not a number for your space. The kitchen drives both columns more than the dining room does.',
      caption:
        'Typical restaurant buildout cost and timeline bands, with related reading',
      rows: [
        {
          item: 'Typical restaurant buildout',
          typical: '$100K–$500K',
          note: 'Kitchen systems — hood, grease, refrigeration, MEP — swing the number more than dining finishes. A site walk is the only figure worth locking an open date against.',
        },
        {
          item: 'Typical construction',
          typical: '8–16 weeks',
          note: 'Construction depending on kitchen scope, plus permitting. Hoods and walk-ins are long-lead; order them when the scope is set.',
          href: '/insights/commercial-buildout-timeline',
          linkLabel: 'What actually moves a commercial buildout date',
        },
        {
          item: 'Change of occupancy (retail → restaurant)',
          typical: 'Deeper permit review',
          note: 'Turning a retail bay into a restaurant is a different occupancy, not a finish upgrade. Expect grease waste, ventilation, exiting, and accessibility on the reviewer’s list.',
          href: '/insights/permitting',
          linkLabel: 'Change of occupancy in Metro Atlanta permitting',
        },
        {
          item: 'Work letter gaps — grease, gas, exhaust',
          typical: 'Tenant cost if unclaimed',
          note: 'A restaurant adds grease interceptor, gas service, and exhaust routing to the usual HVAC and panel gaps. Unclaimed items are yours after you sign.',
          href: '/insights/tenant-improvement',
          linkLabel: 'Who pays for what in a work letter',
        },
        {
          item: 'City of Atlanta / Metro AHJ',
          typical: 'Confirm by address',
          note: 'City of Atlanta is its own AHJ — not Fulton County. Confirm jurisdiction before you write the open date.',
          href: '/locations/atlanta-ga',
          linkLabel: 'Commercial GC in Atlanta, GA',
        },
      ],
      after:
        'Call (404) 724-8709 before you lock an open date. We will walk the space, read the work letter against the kitchen the building can actually support, and give you a scoped number — not a range copied from this table.',
    },
    franchisePlaybook: {
      heading: 'Franchise and multi-unit, without relearning the job',
      intro:
        'We have done over a hundred Domino’s buildouts and have worked for Darden since. The franchise sequence — brand standards, health department, equipment lead times, a date that does not move — is familiar territory.',
      items: [
        {
          label: 'Brand package vs. the actual building',
          note: 'Franchisor drawings assume a clean shell. The grease line, gas service, and exhaust path in the real bay are rarely what the prototype shows. Reconcile that before you treat the prototype as the budget.',
        },
        {
          label: 'Health department and franchisor punch as one sequence',
          note: 'Building final, health, and brand punch are three lists. A store that is “done” on the construction schedule is not open until the last of them clears.',
        },
        {
          label: 'Multi-unit is where the first store pays off',
          note: 'Store two and store three collect on the submittals, the punch items, and the trade sequence you already ran. That is the argument for keeping the same GC — not a promise that every market is identical.',
        },
        {
          label: 'Independent vs. franchise',
          note: 'An independent still has health department, hood, grease, and an open date. A franchise adds brand standards, corporate reviewers, and a prototype that has to be forced onto a real building. Same kitchen physics; more people on the calendar.',
        },
      ],
      after:
        'The published proof of that history is the company story — a founder who learned the trade building Domino’s stores, and later Darden work including Olive Garden — not a restaurant project page. We have not published a kitchen case study on this site yet.',
      aboutHref: '/about',
      aboutLabel: 'How we learned this on Domino’s stores',
    },
    proofHeading: 'Specialty interiors we handed back on a clock',
    proofIntro:
      'There is no dedicated restaurant or kitchen case study on this site yet. Until there is, these are live interiors delivered against a fixed open date or a hard number — specialty interiors, not kitchens, and not a substitute for one.',
    proofProjects: [
      {
        slug: 'verizon-retail-buildout-glenwood-park-atlanta',
        title: 'Verizon Retail Buildout in Glenwood Park — Six Weeks to Handoff',
        clientType: 'Verizon retail operator',
        cityName: 'Atlanta',
        cityState: 'ga',
        scopeSummary:
          'Atlanta retail interior in Glenwood Park, handed back in six weeks on a fixed clock so the operator could stock, train, and open. Not a kitchen — a date that did not move.',
      },
      {
        slug: 'iv-nutrition-clinic-buildout-flowery-branch',
        title: 'IV Nutrition Clinic Buildout in Flowery Branch, GA',
        clientType: 'IV nutrition clinic',
        cityName: 'Flowery Branch',
        cityState: 'ga',
        scopeSummary:
          'Specialty interior: ~2,000 SF clinic buildout, 10 weeks of construction at about $200,000. Demo, framing, insulation, drywall, lighting, and finishes — a hard number, not a restaurant kitchen.',
      },
      {
        slug: 'tanning-salon-buildout-fixed-open-date',
        title: '1,500 SF Tanning Salon Buildout Delivered on a Fixed Open Date',
        clientType: 'Tanning salon operator',
        cityName: 'Gainesville',
        cityState: 'ga',
        scopeSummary:
          'Eight-week interior of a 1,500-square-foot salon in Gainesville, scoped and sequenced around a fixed open date the operator could not move.',
      },
    ],
    relatedReading: [
      {
        href: '/insights/permitting',
        title: 'Permitting a commercial buildout in Metro Atlanta',
        blurb:
          'Change of occupancy — retail to restaurant — is the swing factor. City vs county, grease, fire review, and the CO.',
      },
      {
        href: '/insights/commercial-buildout-timeline',
        title: 'How long a commercial buildout takes',
        blurb:
          'Hoods and walk-ins are long-lead. Construction is the predictable part; the factory queue is not.',
      },
      {
        href: '/insights/tenant-improvement',
        title: 'Who pays for what in a work letter',
        blurb:
          'Grease interceptor, gas service, and exhaust routing are the restaurant gaps that become tenant cost after you sign.',
      },
      {
        href: '/insights/restaurant-buildout-budget-breakdown',
        title: 'Restaurant buildout budget breakdown',
        blurb:
          'Where the money goes — kitchen, hood, grease, refrigeration, MEP — and why the dining room is rarely the overrun.',
      },
    ],
    crossLinks: [
      {
        href: '/project-types/tenant-improvements',
        title: 'Tenant improvements',
        blurb:
          'A kitchen is a different TI. Same lease, same work letter, different systems — and a date that is lost revenue if it slips.',
      },
      {
        href: '/locations/atlanta-ga',
        title: 'Commercial GC in Atlanta, GA',
        blurb:
          'City of Atlanta is its own AHJ — not Fulton County. Home-base page for permitting, metro jurisdictions, and how we work here.',
      },
    ],
    ctaHeading: 'Got a kitchen that has to open on a date?',
    ctaBody:
      "Call us before you lock the open date. We'll come walk the space and tell you what we think the kitchen will take.",
    faqs: [
      {
        q: 'How much does a restaurant buildout cost?',
        a: 'Most restaurant buildouts we do land in the $100K–$500K range. The budget is driven by the kitchen — hood and make-up air, grease interceptor, refrigeration, and the MEP upgrades a kitchen requires — far more than by the dining room. The only number worth locking an open date against is a scoped estimate from your space. [Where a restaurant budget actually goes](/insights/restaurant-buildout-budget-breakdown).',
      },
      {
        q: 'How long does a restaurant buildout take?',
        a: 'Typically eight to sixteen weeks of construction depending on kitchen scope, plus permitting. Long-lead equipment and health-department requirements are the usual schedule drivers, so we plan around them early. [What actually moves a commercial buildout date](/insights/commercial-buildout-timeline).',
      },
      {
        q: 'Do you have franchise experience?',
        a: 'Yes. We have done over a hundred Domino’s buildouts and have worked for Darden since. The franchise sequence — franchisor standards, health department, equipment coordination — is familiar territory. The published story of how that started is on [our about page](/about), not a Domino’s project URL. We have not published a restaurant case study on this site yet.',
      },
      {
        q: 'Do you handle the hood, grease interceptor, and health department requirements?',
        a: 'Yes — those are core to a restaurant build and among the first things we scope, because they are the lines most likely to blow up a budget or a schedule if they are missed. Hood and walk-in are schedule-critical long-leads; grease is often below-slab and tied to a change of occupancy.',
      },
      {
        q: 'What does a change of occupancy from retail to restaurant do to permitting?',
        a: 'It is the single biggest swing factor. Turning a retail bay into a restaurant is a different occupancy classification, not a finish upgrade. Expect deeper review on exiting, restrooms, ventilation, accessibility, and grease waste. Plan the schedule around that review, not a best case. [Permitting a commercial buildout in Metro Atlanta](/insights/permitting) · [Atlanta location](/locations/atlanta-ga).',
      },
      {
        q: 'What’s the difference between health department approval and a building final?',
        a: 'They are different inspections on different clocks. A building final (and the certificate of occupancy) says the permitted construction is complete. Health department approval says the kitchen can operate — hood, grease, sinks, surfaces, the items that inspector grades. You need both to open. Franchisor punch, when it applies, is a third list. Plan the open date off the last one.',
      },
      {
        q: 'When should we order the hood and the walk-in?',
        a: 'The day the scope is set — not the day the ceiling is ready to close. Commercial kitchen hoods and walk-in coolers are built to order. A late release slides every trade behind them. Permitting can still change a detail, so lock the equipment that the drawings have already decided and keep a buffer for comments. [Long-lead items on a commercial buildout timeline](/insights/commercial-buildout-timeline).',
      },
      {
        q: 'How is an independent restaurant different from a franchise buildout?',
        a: 'The kitchen physics are the same: hood, make-up air, grease, refrigeration, MEP, health department. A franchise adds brand standards, corporate reviewers, and a prototype that has to be forced onto a real building — more people on the calendar, not a different set of trades. An independent still has an open date that is lost revenue if it slips. Either way we scope kitchen-first. [How a work letter splits grease, gas, and exhaust](/insights/tenant-improvement).',
      },
    ],
  },
  'retail-buildout': {
    h1: 'Retail Buildout Contractor in Metro Atlanta',
    metaTitle: 'Retail Buildout Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Retail and shell buildouts across Metro Atlanta. Storefront, finishes, and code work delivered to a firm open date.',
    problem:
      'You have a storefront to open and a brand standard to hit, often against a landlord’s shell condition that leaves more undone than the drawings suggest. You need someone to reconcile the brand package with the real building and give you a number you can open against.',
    scope: [
      'Storefront and entry construction',
      'Framing, drywall, and ceilings',
      'Brand-standard finishes and fixtures coordination',
      'Lighting and electrical',
      'HVAC modification',
      'Restrooms and ADA compliance',
      'Flooring and wall finishes',
      'Signage and life-safety coordination',
    ],
    typicalRange: '$50K–$300K',
    typicalTimeline: '5–12 weeks depending on scope',
    planIntro: 'We reconcile the brand package with the building before we price it.',
    faqs: [
      {
        q: 'What does a retail buildout cost?',
        a: 'Most retail buildouts we do fall in the $50K–$300K range, depending on the shell condition the landlord delivered and how much the brand standard requires above it.',
      },
      {
        q: 'Can you build to our brand standard?',
        a: 'Yes. We reconcile the brand package with the actual building — which is where the surprises usually are — and give you a number you can open against.',
      },
      {
        q: 'How long does a retail buildout take?',
        a: 'Typically five to twelve weeks of construction depending on scope, plus permitting. Storefront and long-lead fixtures are common schedule drivers.',
      },
    ],
  },
  'building-repair': {
    h1: 'Commercial Building Repair in Metro Atlanta',
    metaTitle: 'Commercial Building Repair Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial building repair across Metro Atlanta — water damage, structural, envelope, and interior restoration. Fast walk, real number.',
    problem:
      'Something failed — a roof, a pipe, a truck hit the storefront — and now you have a tenant asking when it will be fixed and an insurer asking for scope. You need a contractor who can assess it, document it, and turn it around without it becoming a second problem.',
    scope: [
      'Water and moisture damage repair',
      'Structural and framing repair',
      'Envelope, storefront, and door repair',
      'Interior restoration and finishes',
      'Roof-related interior repair coordination',
      'Insurance scope documentation',
      'ADA and code corrections',
    ],
    typicalRange: '$50K–$250K',
    typicalTimeline: '2–8 weeks depending on damage',
    planIntro: 'We assess it, document it, and give you a scope you can act on.',
    faqs: [
      {
        q: 'Do you work with insurance claims?',
        a: 'Yes. We assess and document the damage in a form you can hand to an insurer, and scope the repair so the number is defensible.',
      },
      {
        q: 'How fast can you respond to a building repair?',
        a: 'We move quickly to walk the space and assess it, because a repair that sits gets worse and a tenant is usually waiting. From there we give you a scope and a schedule you can act on.',
      },
      {
        q: 'What kinds of repairs do you handle?',
        a: 'Water and moisture damage, structural and framing repair, envelope and storefront repair, and interior restoration — plus the code and ADA corrections a repair sometimes triggers.',
      },
    ],
  },
  'flooring-interior-trades': {
    h1: 'Commercial Flooring & Interior Trades in Metro Atlanta',
    metaTitle: 'Commercial Flooring Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial flooring and self-performed interior trades across Metro Atlanta — framing, drywall, paint, ACT, flooring under one contract.',
    problem:
      'You need interior trades that show up and perform, whether that is a full flooring package on a tight turnover or framing, drywall, and paint pulled together under one contract instead of four separate subs to chase.',
    scope: [
      'Commercial flooring — LVT, tile, carpet, polished and sealed concrete',
      'Metal stud framing',
      'Drywall and finish',
      'Acoustical ceiling (ACT)',
      'Interior and exterior paint',
      'Doors, frames, and hardware',
      'Turnkey interior packages',
    ],
    typicalRange: '$50K–$200K',
    typicalTimeline: '2–8 weeks depending on scope',
    planIntro: 'One contract, self-performed trades, one crew accountable for the finish.',
    faqs: [
      {
        q: 'Which trades do you self-perform?',
        a: 'Framing, drywall, paint, acoustical ceiling, and flooring. Bringing them under one contract means fewer separate subs to coordinate and one crew accountable for the finish.',
      },
      {
        q: 'Do you do flooring as a standalone package?',
        a: 'Yes — LVT, tile, carpet, and polished or sealed concrete, on its own or as part of a larger interior package.',
      },
      {
        q: 'Can you take a turnkey interior package for another GC?',
        a: 'Yes. Framing through finish under one contract is exactly what our trade-partner work is built for. Send us the scope and the dates.',
      },
    ],
  },
};

/**
 * The 3-step plan, down-funnel version — educational, per the voice guide (the
 * service/city reader wants specifics: what actually happens, what you bring,
 * roughly how long). The homepage keeps its own punchy inline version.
 */
export const PLAN_STEPS = [
  {
    n: '1',
    title: 'Walk the space',
    body: 'We come out and look at what’s actually there — existing conditions, the capacity of the HVAC, electrical, and plumbing, and what your use will trigger for code and accessibility. Bring whatever you have: drawings, the lease exhibit, your target date. It takes about an hour, and we get on the calendar within days.',
  },
  {
    n: '2',
    title: 'Get a real number',
    body: 'We scope it trade by trade — not a per-foot guess — and account for permitting and the long-lead items that actually move a schedule. You get a scoped estimate with the inclusions and exclusions spelled out, so you can hand it to your owner or lender and defend it. Not a range, and usually back in days.',
  },
  {
    n: '3',
    title: 'We build',
    body: 'We pull the permits, order the long-lead items, and mobilize — self-performing the interior trades and managing the rest, in sequence. You get a point of contact and updates at the milestones that matter, through punch and closeout, including the documents you need to occupy.',
  },
];
