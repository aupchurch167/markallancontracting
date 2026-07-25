/**
 * Single source of truth for NAP + tracking + brand tokens.
 *
 * Placeholders are LITERAL tokens on purpose. Do not invent values. Every one of
 * these is an "open item — blocking" per the build spec. When real values arrive
 * they get swapped here (and, preferably, authored into the Sanity
 * `sitewideSettings` singleton, which overrides these at render time — see
 * getSiteSettings() in lib/queries.ts).
 *
 * Nothing in the app should hardcode a phone number, email, or address. Read it
 * from here, or from the merged settings object.
 */

export const SITE = {
  name: 'Mark Allan Contracting',
  shortName: 'MAC',
  // Commercial general contractor. Metro Atlanta since 1999.
  tagline: 'Commercial general contractor. Metro Atlanta since 1999.',
  oneLiner:
    "We build out commercial space across the Southeast — and you'll know where things stand the whole way.",
  established: 1999,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.macont.com',
  statesServed: ['Georgia', 'Tennessee', 'Alabama', 'South Carolina'],
  projectRange: '$50K to $500K',
} as const;

/**
 * Contact. Verified from the live macont.com (its own LocalBusiness JSON-LD) and
 * confirmed by the owner. The displayed phone is CallRail's DNI fallback — DNI
 * swaps it to a tracked number at runtime. NAP here must stay in lockstep with
 * the Google Business Profile; edit it in the Sanity sitewideSettings singleton
 * (which overrides these) so there is one source of truth.
 */
export const CONTACT = {
  phone: '(404) 724-8709',
  phoneRaw: '+14047248709',
  email: 'hello@macont.com',
  address: {
    street: '3420 Oakcliff Rd, Suite 103',
    city: 'Atlanta',
    state: 'GA',
    zip: '30340',
  },
  hours: 'Mon–Fri 8am–5pm · Sat–Sun 9am–1pm',
  gbpUrl:
    'https://www.google.com/maps/place/3420+Oakcliff+Rd,+Atlanta,+GA+30340',
  // Structured hours for LocalBusiness schema.
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '17:00' },
    { days: ['Saturday', 'Sunday'], opens: '09:00', closes: '13:00' },
  ],
  geo: { lat: 33.9042153, lng: -84.25362 },
} as const;

/**
 * Tracking IDs, verified from the live site. Public client-side IDs (not secrets).
 * Env vars override so staging can point elsewhere. CallRail DNI needs both the
 * company id and the per-account swap resource.
 */
export const TRACKING = {
  callRailId: process.env.NEXT_PUBLIC_CALLRAIL_ID || '571875192',
  callRailResource: process.env.NEXT_PUBLIC_CALLRAIL_SWAP || '8a72377554f5e3b406a8',
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || 'G-Z9YX6SX90M',
} as const;

/**
 * Brand tokens. Decision (owner, confirmed): keep the navy palette rather than
 * matching the live Webflow site, whose charcoal + default blue were not a
 * deliberate identity. Mirror any change in tailwind.config.ts.
 */
export const BRAND = {
  navy: '#1B3A5C',
  accent: '#2E75B6',
} as const;

/** tel: href helper. Uses raw token until a real number is supplied. */
export function telHref(phoneRaw: string = CONTACT.phoneRaw): string {
  return `tel:${phoneRaw}`;
}
