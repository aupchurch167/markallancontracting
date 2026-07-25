/**
 * Sanity seed — turnkey CMS population.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=xxx node scripts/seed.mjs
 *
 * Creates the sitewideSettings singleton, the 7 services, and the Tier-1 city
 * documents with REAL county jurisdiction notes. It does NOT seed projects or
 * serviceCity documents — those require real delivered work and CompanyCam
 * photos, and fabricating them would violate the anti-thin-content and
 * claim-honesty rules. The matrix stays gated until that content is real.
 *
 * Idempotent: uses createOrReplace with deterministic ids.
 */
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_WRITE_TOKEN;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

if (!projectId || !token) {
  console.error(
    'Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN. See the header of this file.',
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: '2024-10-01', token, useCdn: false });

/** Plain paragraphs -> Portable Text blocks with stable keys. */
function blocks(paragraphs) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `b${i}`,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
  }));
}

const planSteps = [
  { _type: 'planStep', _key: 'p1', stepNumber: 1, title: 'Walk the space', description: 'We come out and ask the questions that change the price.' },
  { _type: 'planStep', _key: 'p2', stepNumber: 2, title: 'Get a real number', description: 'A scoped estimate you can hand to your owner. Not a range.' },
  { _type: 'planStep', _key: 'p3', stepNumber: 3, title: 'We build', description: 'Crews mobilize. Work gets done. You get your space back.' },
];

// --- Settings — verified from the live macont.com, confirmed by the owner. ---
const settings = {
  _id: 'sitewideSettings',
  _type: 'sitewideSettings',
  phone: '(404) 724-8709',
  phoneRaw: '+14047248709',
  email: 'hello@macont.com',
  addressStreet: '3420 Oakcliff Rd, Suite 103',
  addressCity: 'Atlanta',
  addressState: 'GA',
  addressZip: '30340',
  hours: 'Mon–Fri 8am–5pm · Sat–Sun 9am–1pm',
  gbpUrl: 'https://www.google.com/maps/place/3420+Oakcliff+Rd,+Atlanta,+GA+30340',
  callRailId: '571875192',
  callRailResource: '8a72377554f5e3b406a8',
  ga4Id: 'G-Z9YX6SX90M',
};

// --- Services ---
const services = [
  {
    slug: 'tenant-improvements',
    title: 'Tenant Improvements',
    h1: 'Tenant Improvement Contractor in Metro Atlanta',
    metaTitle: 'Tenant Improvement Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial tenant improvements across Metro Atlanta. Scoped estimates, on-schedule crews, $50K–$500K. Call to walk your space.',
    problem: [
      'You have a lease signed and a build-out allowance to spend, and the clock started the day you took the keys.',
      'You need a contractor who can price the work against the landlord’s scope, pull the permit, and turn the space over before rent commencement catches up with you.',
    ],
    scope: ['Demo and selective interior demolition', 'Metal stud framing and drywall', 'Ceilings — ACT and hard-lid', 'Electrical, lighting, and low-voltage', 'HVAC modification and distribution', 'Plumbing rough-in and fixtures', 'Flooring — LVT, tile, carpet, sealed concrete', 'Paint and interior finishes', 'ADA restrooms and code upgrades'],
    typicalRange: '$50K–$300K',
    typicalTimeline: '4–12 weeks depending on scope and permitting',
  },
  {
    slug: 'office-renovation',
    title: 'Office Renovation',
    h1: 'Commercial Office Renovation in Metro Atlanta',
    metaTitle: 'Commercial Office Renovation Atlanta | Mark Allan Contracting',
    metaDescription:
      'Office renovation and reconfiguration across Metro Atlanta. Phased work around occupied floors, real numbers, on-schedule delivery.',
    problem: [
      'You are reconfiguring a floor that people still work on, or turning over a suite between tenants with a hard move-in date.',
      'Either way you need the work sequenced so it does not shut down the business, and priced so you can defend it to ownership.',
    ],
    scope: ['Space planning coordination and demolition', 'Framing, drywall, and acoustic partitions', 'Ceilings, lighting, and electrical', 'HVAC zoning and controls', 'Glass fronts, doors, and hardware', 'Flooring and wall finishes', 'Break rooms and restroom upgrades', 'Phased work around occupied areas'],
    typicalRange: '$60K–$400K',
    typicalTimeline: '6–14 weeks depending on phasing',
  },
  {
    slug: 'warehouse-conversion',
    title: 'Warehouse Conversion',
    h1: 'Warehouse Conversion & Buildout Contractor in Georgia',
    metaTitle: 'Warehouse Buildout Contractor Georgia | Mark Allan Contracting',
    metaDescription:
      'Warehouse conversions and buildouts across Georgia — office build-in, dock work, restrooms, code upgrades. Get a scoped number.',
    problem: [
      'You have shell warehouse space and a tenant who needs office, restrooms, and a use the building was not originally finished for.',
      'The gap between an empty box and occupiable space is where the budget lives, and you need it scoped honestly before you commit.',
    ],
    scope: ['Office and mezzanine build-in', 'Restrooms and ADA compliance', 'Demising walls and tenant separation', 'Dock doors, levelers, and man doors', 'Warehouse lighting and power', 'HVAC for conditioned areas', 'Fire protection coordination', 'Epoxy and sealed floors'],
    typicalRange: '$75K–$500K',
    typicalTimeline: '8–16 weeks depending on scope',
  },
  {
    slug: 'restaurant-buildout',
    title: 'Restaurant Buildout',
    h1: 'Restaurant Buildout & Construction in Metro Atlanta',
    metaTitle: 'Restaurant Construction Company Atlanta | Mark Allan Contracting',
    metaDescription:
      'Restaurant buildouts across Metro Atlanta. Kitchen, hood, grease, and finish work coordinated to open on time. Over a hundred franchise buildouts.',
    problem: [
      'Every day past your target open date is revenue you do not get back.',
      'A restaurant build has more ways to slip than any other interior — health department, hood and grease, equipment lead times, and a franchisor watching the schedule. You need a GC who has run this exact play before.',
    ],
    scope: ['Kitchen build-out and equipment set', 'Hood, make-up air, and exhaust', 'Grease interceptor and plumbing', 'Walk-in coolers and freezers', 'Dining room framing, finishes, and millwork', 'Bar construction and equipment', 'Restrooms and ADA compliance', 'Storefront and patio work', 'Health department and franchisor punch'],
    typicalRange: '$100K–$500K',
    typicalTimeline: '8–16 weeks depending on kitchen scope',
  },
  {
    slug: 'retail-buildout',
    title: 'Retail Buildout',
    h1: 'Retail Buildout Contractor in Metro Atlanta',
    metaTitle: 'Retail Buildout Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Retail and shell buildouts across Metro Atlanta. Storefront, finishes, and code work delivered to a firm open date.',
    problem: [
      'You have a storefront to open and a brand standard to hit, often against a landlord’s shell condition that leaves more undone than the drawings suggest.',
      'You need someone to reconcile the brand package with the real building and give you a number you can open against.',
    ],
    scope: ['Storefront and entry construction', 'Framing, drywall, and ceilings', 'Brand-standard finishes coordination', 'Lighting and electrical', 'HVAC modification', 'Restrooms and ADA compliance', 'Flooring and wall finishes', 'Signage and life-safety coordination'],
    typicalRange: '$50K–$300K',
    typicalTimeline: '5–12 weeks depending on scope',
  },
  {
    slug: 'building-repair',
    title: 'Building Repair',
    h1: 'Commercial Building Repair in Metro Atlanta',
    metaTitle: 'Commercial Building Repair Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial building repair across Metro Atlanta — water damage, structural, envelope, and interior restoration. Fast walk, real number.',
    problem: [
      'Something failed — a roof, a pipe, a truck hit the storefront — and now you have a tenant asking when it will be fixed and an insurer asking for scope.',
      'You need a contractor who can assess it, document it, and turn it around without it becoming a second problem.',
    ],
    scope: ['Water and moisture damage repair', 'Structural and framing repair', 'Envelope, storefront, and door repair', 'Interior restoration and finishes', 'Roof-related interior repair', 'Insurance scope documentation', 'ADA and code corrections'],
    typicalRange: '$50K–$250K',
    typicalTimeline: '2–8 weeks depending on damage',
  },
  {
    slug: 'flooring-interior-trades',
    title: 'Flooring & Interior Trades',
    h1: 'Commercial Flooring & Interior Trades in Metro Atlanta',
    metaTitle: 'Commercial Flooring Contractor Atlanta | Mark Allan Contracting',
    metaDescription:
      'Commercial flooring and self-performed interior trades across Metro Atlanta — framing, drywall, paint, ACT, flooring under one contract.',
    problem: [
      'You need interior trades that show up and perform.',
      'Whether that is a full flooring package on a tight turnover or framing, drywall, and paint under one contract instead of four separate subs to chase.',
    ],
    scope: ['Commercial flooring — LVT, tile, carpet, sealed concrete', 'Metal stud framing', 'Drywall and finish', 'Acoustical ceiling (ACT)', 'Interior and exterior paint', 'Doors, frames, and hardware', 'Turnkey interior packages'],
    typicalRange: '$50K–$200K',
    typicalTimeline: '2–8 weeks depending on scope',
  },
].map((s) => ({
  _id: `service.${s.slug}`,
  _type: 'service',
  title: s.title,
  slug: { _type: 'slug', current: s.slug },
  h1: s.h1,
  metaTitle: s.metaTitle,
  metaDescription: s.metaDescription,
  problemStatement: blocks(s.problem),
  scopeItems: s.scope,
  typicalRange: s.typicalRange,
  typicalTimeline: s.typicalTimeline,
  planSteps,
}));

// --- Cities with REAL jurisdiction notes (confirm current rules with the AHJ) ---
const cities = [
  { slug: 'atlanta-ga', name: 'Atlanta', county: 'Fulton', tier: 1,
    note: ['Projects inside the City of Atlanta are permitted through the city’s Office of Buildings, not Fulton County — the city is its own authority having jurisdiction. Commercial interior work generally requires a building permit plus separate electrical, mechanical, and plumbing permits, and a change of occupancy triggers additional review. Confirm current requirements with the City of Atlanta Office of Buildings for your specific address.'] },
  { slug: 'alpharetta-ga', name: 'Alpharetta', county: 'Fulton', tier: 1,
    note: ['Alpharetta permits commercial work through the City of Alpharetta Community Development department, not Fulton County. Plan review and inspections run on the city’s process. As with any interior buildout, a change of use can pull in accessibility and life-safety upgrades. Confirm current requirements with the City of Alpharetta for your specific address.'] },
  { slug: 'marietta-ga', name: 'Marietta', county: 'Cobb', tier: 1,
    note: ['An address inside the City of Marietta is generally permitted by the city; addresses in unincorporated Cobb go through Cobb County. Which authority has jurisdiction is the first thing to confirm, because it sets the process and the timeline. Confirm current requirements with the City of Marietta or Cobb County for your specific address.'] },
  { slug: 'duluth-ga', name: 'Duluth', county: 'Gwinnett', tier: 1,
    note: ['Duluth addresses inside the city limits are typically permitted by the City of Duluth; unincorporated addresses go through Gwinnett County. Gwinnett runs commercial plan review with defined submittal steps, and inspection scheduling is a real factor near completion. Confirm current requirements with the City of Duluth or Gwinnett County for your specific address.'] },
  { slug: 'sandy-springs-ga', name: 'Sandy Springs', county: 'Fulton', tier: 1,
    note: ['Sandy Springs is its own municipality and permits commercial work through the city, not Fulton County. The city has historically used an outsourced development-services model with defined review windows. Confirm current requirements with the City of Sandy Springs for your specific address.'] },
  { slug: 'buford-ga', name: 'Buford', county: 'Gwinnett', tier: 1,
    note: ['Buford straddles Gwinnett and Hall counties and operates its own city school system and services; permitting authority depends on the exact address and whether it sits inside the city limits. Confirm which authority has jurisdiction — City of Buford, Gwinnett County, or Hall County — before planning the schedule.'] },
  { slug: 'gwinnett-ga', name: 'Gwinnett County', county: 'Gwinnett', tier: 1,
    note: ['Unincorporated Gwinnett County permits commercial work through its Department of Planning and Development, while the county’s many cities (Duluth, Lawrenceville, Suwanee, and others) permit their own. Gwinnett runs a defined commercial plan-review process; confirm current requirements and which authority applies to your specific address.'] },
  { slug: 'cobb-ga', name: 'Cobb County', county: 'Cobb', tier: 1,
    note: ['Unincorporated Cobb County permits through its Community Development department; cities like Marietta, Smyrna, and Kennesaw permit their own. Determine which authority has jurisdiction over your address first, since it governs the process and inspection scheduling. Confirm current requirements with the applicable authority.'] },
].map((c) => ({
  _id: `city.${c.slug}`,
  _type: 'city',
  name: c.name,
  state: 'ga',
  slug: { _type: 'slug', current: c.slug },
  county: c.county,
  tier: c.tier,
  jurisdictionNote: blocks(c.note),
  intro: blocks([
    `Mark Allan Contracting builds commercial interiors across ${c.name} and the surrounding market — tenant improvements, restaurant and retail buildouts, office and warehouse work. Family-owned since 1999, projects from $50K to $500K.`,
  ]),
}));

async function run() {
  const docs = [settings, ...services, ...cities];
  console.log(`Seeding ${docs.length} documents to ${projectId}/${dataset}...`);
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit();
  console.log('Done. Settings + 7 services + 8 cities seeded.');
  console.log('Note: projects and serviceCity docs are intentionally NOT seeded — the matrix stays gated until real delivered work exists.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
