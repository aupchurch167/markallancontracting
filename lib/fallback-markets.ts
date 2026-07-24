import type { MarketKey } from './site-data';

/**
 * Fallback audience copy for market pages, overridden by the Sanity `market`
 * document when authored. Register is Framework 1 (GC side): the hero is a
 * broker / PM / operator on the hook for a date they don't control. No
 * responsiveness guarantees.
 */
export const MARKET_CONTENT: Record<
  MarketKey,
  { h1: string; metaTitle: string; metaDescription: string; problem: string }
> = {
  'franchise-restaurant-operators': {
    h1: 'A GC That Has Run Your Buildout Before',
    metaTitle: 'Contractor for Franchise & Restaurant Operators | Mark Allan Contracting',
    metaDescription:
      'Franchise and restaurant buildouts across the Southeast. Over a hundred Domino’s buildouts and work for Darden. Open on your date.',
    problem:
      'You answer to a franchisor and a target open date, and every restaurant build has more ways to slip than any other interior. You need a GC who has already run this exact play — hood, grease, health department, equipment — not one learning it on your dime.',
  },
  'commercial-real-estate-brokers': {
    h1: 'A Contractor Who Makes You Look Good to the Tenant',
    metaTitle: 'Contractor for Commercial Real Estate Brokers | Mark Allan Contracting',
    metaDescription:
      'A GC brokers can hand a deal to with confidence. Real numbers for TI allowances, on-schedule delivery, and a tenant who opens on time.',
    problem:
      'The deal closes and now the tenant needs the space built. If the GC prices it wrong or starts late, it lands on you — you are the one who brought them in. You need a number you can trust and a build that does not become your problem.',
  },
  'property-managers': {
    h1: 'A GC Who Does Not Make You Chase Them',
    metaTitle: 'Contractor for Property Managers | Mark Allan Contracting',
    metaDescription:
      'Tenant improvements, repairs, and turnovers for property managers across the Southeast. Scoped numbers you can take to ownership.',
    problem:
      'You are managing a portfolio, not a single project, and a contractor who goes quiet turns into a tenant complaint and an owner asking questions. You need scope you can hand up the chain and a build that holds its date.',
  },
  'multifamily-operators': {
    h1: 'Common-Area and Unit Work That Holds Its Schedule',
    metaTitle: 'Contractor for Multifamily Operators | Mark Allan Contracting',
    metaDescription:
      'Multifamily common-area renovations, clubhouse and amenity buildouts, and repair work across the Southeast. Real numbers, on-schedule crews.',
    problem:
      'Amenity and common-area work has to happen around residents, on a schedule leasing is counting on. You need a GC who can phase it, price it honestly, and keep the disruption where it belongs.',
  },
  'facility-managers': {
    h1: 'One Contractor for the Work That Keeps Coming Up',
    metaTitle: 'Contractor for Facility Managers | Mark Allan Contracting',
    metaDescription:
      'Repairs, renovations, and buildouts for facility managers across the Southeast. One GC who shows up, scopes it right, and closes it out.',
    problem:
      'You have a building — or a portfolio of them — and work that never stops coming: a repair here, a reconfiguration there, a code correction due. You need one contractor who knows the building and does not have to be re-taught it every time.',
  },
};
