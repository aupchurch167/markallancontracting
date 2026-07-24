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
 * Contact placeholders. LITERAL TOKENS until CallRail-tracked values are supplied.
 * Every displayed number must be a tracked number (CallRail DNI swaps it at
 * runtime), so the human-readable value here is the fallback only.
 */
export const CONTACT = {
  phone: '{{PHONE}}',
  phoneRaw: '{{PHONE_RAW}}',
  email: '{{EMAIL}}',
  // Full NAP is an open item; must match Google Business Profile exactly at launch.
  address: {
    street: '{{ADDRESS_STREET}}',
    city: '{{ADDRESS_CITY}}',
    state: '{{ADDRESS_STATE}}',
    zip: '{{ADDRESS_ZIP}}',
  },
  hours: '{{HOURS}}',
  gbpUrl: '{{GBP_URL}}',
} as const;

/** Tracking IDs — open items, block Phase 0. Empty string = script does not render. */
export const TRACKING = {
  callRailId: process.env.NEXT_PUBLIC_CALLRAIL_ID || '', // {{CALLRAIL_ID}}
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || '', // {{GA4_ID}}
} as const;

/**
 * Brand tokens — assumed values from the spec, flagged for verification against
 * macont.com. Mirror any change in tailwind.config.ts.
 */
export const BRAND = {
  navy: '#1B3A5C', // {{BRAND_NAVY}} — verify
  accent: '#2E75B6', // {{BRAND_ACCENT}} — verify
} as const;

/** tel: href helper. Uses raw token until a real number is supplied. */
export function telHref(phoneRaw: string = CONTACT.phoneRaw): string {
  return `tel:${phoneRaw}`;
}
