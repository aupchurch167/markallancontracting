/**
 * Lead source + first-touch attribution shared by the public scope forms and
 * the /links contact form.
 *
 * Canonical keys are what we store and submit. Visitor-facing labels stay on
 * the <option> text. Nothing here talks to a CRM or an email provider.
 */

export const LEAD_SOURCES = [
  { key: 'referral', label: 'Referral from someone I know' },
  { key: 'inbound_call', label: 'I called you' },
  { key: 'web_form', label: 'Found you online / website' },
  { key: 'outbound', label: 'You reached out to me' },
  { key: 'repeat_client', label: "I'm a past client" },
  { key: 'walk_in_other', label: 'Other' },
] as const;

export type LeadSourceKey = (typeof LEAD_SOURCES)[number]['key'];

export const LEAD_SOURCE_KEYS: readonly LeadSourceKey[] = LEAD_SOURCES.map((s) => s.key);

/** Hidden-field / payload names. `submitted_from` is the page at submit time, not first touch. */
export const ATTRIBUTION_FIELDS = [
  { key: 'utm_source', label: 'UTM source', max: 512 },
  { key: 'utm_medium', label: 'UTM medium', max: 512 },
  { key: 'utm_campaign', label: 'UTM campaign', max: 512 },
  { key: 'utm_term', label: 'UTM term', max: 512 },
  { key: 'utm_content', label: 'UTM content', max: 512 },
  { key: 'gclid', label: 'Google click ID', max: 512 },
  { key: 'fbclid', label: 'Facebook click ID', max: 512 },
  { key: 'landing_page', label: 'Landing page', max: 2048 },
  { key: 'referrer', label: 'Referrer', max: 2048 },
  { key: 'submitted_from', label: 'Submitted from', max: 2048 },
] as const;

export type AttributionKey = (typeof ATTRIBUTION_FIELDS)[number]['key'];

export type Attribution = Record<AttributionKey, string>;

/** First-touch values persisted in sessionStorage. Excludes `submitted_from`. */
export const FIRST_TOUCH_KEYS = ATTRIBUTION_FIELDS.map((f) => f.key).filter(
  (key): key is Exclude<AttributionKey, 'submitted_from'> => key !== 'submitted_from',
);

export const FIRST_TOUCH_STORAGE_KEY = 'mac_first_touch';

/** Mailto body label so the office email shows the visitor wording next to the key. */
export const HEARD_ABOUT_FIELD = 'How did you hear about us';

const CAMEL_ALIASES: Partial<Record<AttributionKey, string>> = {
  landing_page: 'landingPage',
  submitted_from: 'submittedFrom',
};

export function emptyAttribution(): Attribution {
  return {
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    gclid: '',
    fbclid: '',
    landing_page: '',
    referrer: '',
    submitted_from: '',
  };
}

export function labelFor(key: string): string {
  return LEAD_SOURCES.find((s) => s.key === key)?.label ?? '';
}

export function isLeadSource(value: string): value is LeadSourceKey {
  return (LEAD_SOURCE_KEYS as readonly string[]).includes(value);
}

/** Trim, strip control / zero-width characters, and cap length. Non-strings become ''. */
export function cleanAttributionValue(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .slice(0, max);
}

export function parseLeadSource(value: unknown): LeadSourceKey | null {
  if (typeof value !== 'string') return null;
  const key = value.trim();
  return isLeadSource(key) ? key : null;
}

/**
 * Build a complete attribution object from a nested `attribution` object when
 * present, otherwise from flat fields on the same record. Unknown keys are
 * dropped. Camel-case aliases are accepted for the two URL fields.
 */
export function sanitizeAttribution(input: unknown): Attribution {
  const out = emptyAttribution();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  const record = input as Record<string, unknown>;
  for (const field of ATTRIBUTION_FIELDS) {
    const alias = CAMEL_ALIASES[field.key];
    const raw = record[field.key] ?? (alias ? record[alias] : undefined);
    out[field.key] = cleanAttributionValue(raw, field.max);
  }
  return out;
}

export type LeadDecision =
  | { action: 'drop' }
  | { action: 'reject'; error: string }
  | { action: 'accept'; leadSource: LeadSourceKey; label: string; attribution: Attribution };

/**
 * Honeypot (`company`) drops the submission. `leadSource` must be one of the
 * canonical keys. Attribution strings are sanitized either way.
 */
export function evaluateLeadRequest(body: unknown): LeadDecision {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { action: 'reject', error: 'Bad request.' };
  }
  const record = body as Record<string, unknown>;
  if (typeof record.company === 'string' && record.company.trim()) {
    return { action: 'drop' };
  }
  const leadSource = parseLeadSource(record.leadSource);
  if (!leadSource) {
    return { action: 'reject', error: 'Tell us how you heard about us.' };
  }
  const nested = record.attribution;
  const hasNested = !!nested && typeof nested === 'object' && !Array.isArray(nested);
  const attribution = sanitizeAttribution(hasNested ? nested : record);
  return { action: 'accept', leadSource, label: labelFor(leadSource), attribution };
}
