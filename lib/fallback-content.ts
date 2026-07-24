import type { ServiceKey } from './site-data';

/**
 * Editorial fallback copy for service hubs, used until the Sanity `service`
 * documents are authored (at which point Sanity wins with zero code changes).
 *
 * Register here is down-funnel per the voice doc: plain, specific, question-
 * answering — not homepage rhythm. Ranges/timelines are typical industry
 * defaults framed as "typical"; verify against MAC's real numbers before launch
 * and move into Sanity. No responsiveness guarantees (claim honesty).
 */
export interface ServiceContent {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  problem: string;
  scope: string[];
  typicalRange: string;
  typicalTimeline: string;
  planIntro: string;
}

export const SERVICE_CONTENT: Record<ServiceKey, ServiceContent> = {
  'tenant-improvements': {
    h1: 'Tenant Improvement Contractor in Metro Atlanta',
    metaTitle: 'Tenant Improvement Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial tenant improvements across Metro Atlanta. Scoped estimates, on-schedule crews, $50K–$500K. Call to walk your space.',
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
  },
  'restaurant-buildout': {
    h1: 'Restaurant Buildout & Construction in Metro Atlanta',
    metaTitle: 'Restaurant Construction Company Atlanta | Mark Allan Contracting',
    metaDescription:
      'Restaurant buildouts across Metro Atlanta. Kitchen, hood, grease, and finish work coordinated to open on time. Over a hundred franchise buildouts.',
    problem:
      'Every day past your target open date is revenue you do not get back, and a restaurant build has more ways to slip than any other interior — health department, hood and grease, equipment lead times, and a franchisor watching the schedule. You need a GC who has run this exact play before.',
    scope: [
      'Kitchen build-out and equipment set',
      'Hood, make-up air, and exhaust',
      'Grease interceptor and plumbing',
      'Walk-in coolers and freezers',
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
  },
};

export const PLAN_STEPS = [
  { n: '1', title: 'Walk the space', body: 'We come out and ask the questions that change the price.' },
  { n: '2', title: 'Get a real number', body: 'A scoped estimate you can hand to your owner. Not a range.' },
  { n: '3', title: 'We build', body: 'Crews mobilize. Work gets done. You get your space back.' },
];
