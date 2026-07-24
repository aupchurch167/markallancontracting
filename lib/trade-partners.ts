/**
 * Trade Partner trades. GATED — built, not published, not in nav, noindex.
 * Register is Framework 2 (trade-partner side): the hero is a PM/super at a
 * larger GC short crews on an interior scope. Every capability value is
 * unsupplied — templates render labeled placeholders, never invented figures.
 */
export interface TradeDef {
  slug: string;
  name: string;
  keyword: string;
  blurb: string;
}

export const TRADES: TradeDef[] = [
  { slug: 'framing', name: 'Metal Stud Framing', keyword: 'metal stud framing subcontractor atlanta', blurb: 'Interior and exterior metal stud framing crews.' },
  { slug: 'drywall', name: 'Drywall', keyword: 'commercial drywall subcontractor atlanta', blurb: 'Hang, finish, and level-5 crews on commercial interiors.' },
  { slug: 'painting', name: 'Painting', keyword: 'commercial painting subcontractor atlanta', blurb: 'Commercial interior and exterior painting.' },
  { slug: 'flooring', name: 'Flooring', keyword: 'commercial flooring installer atlanta', blurb: 'LVT, tile, carpet, and sealed concrete installation.' },
  { slug: 'acoustical-ceiling', name: 'Acoustical Ceiling (ACT)', keyword: 'acoustical ceiling contractor atlanta', blurb: 'Grid and tile ceiling installation.' },
  { slug: 'turnkey-interiors', name: 'Turnkey Interiors', keyword: 'turnkey interior subcontractor georgia', blurb: 'Framing, drywall, paint, ACT, and flooring under one contract.' },
];

export function getTrade(slug: string): TradeDef | undefined {
  return TRADES.find((t) => t.slug === slug);
}

/** The values a PM screens for above the fold. All unsupplied → placeholders. */
export const CAPABILITY_LABELS: { key: string; label: string }[] = [
  { key: 'crewSizes', label: 'Crew sizes available' },
  { key: 'mobilizationTime', label: 'Typical mobilization time' },
  { key: 'selfPerformed', label: 'Self-performed vs. managed' },
  { key: 'insuranceLimits', label: 'Insurance limits' },
  { key: 'wcModRate', label: 'W/C mod rate' },
  { key: 'bondingCapacity', label: 'Bonding capacity' },
  { key: 'statesLicensed', label: 'States licensed' },
  { key: 'safetyRecord', label: 'Safety record / OSHA' },
  { key: 'prevailingWageExperience', label: 'Prevailing wage experience' },
  { key: 'unionExperience', label: 'Union project experience' },
];
