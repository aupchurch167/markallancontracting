import {
  FIRST_TOUCH_KEYS,
  FIRST_TOUCH_STORAGE_KEY,
  type AttributionKey,
  emptyAttribution,
  sanitizeAttribution,
} from './lead-attribution';

/**
 * First-touch attribution for this tab. sessionStorage survives in-site
 * navigation and is cleared when the tab closes. No cookies and no
 * third-party scripts. `submitted_from` is intentionally not stored here —
 * that is the page the form is sent from, captured at submit time.
 */
export function captureFirstTouch(): Record<Exclude<AttributionKey, 'submitted_from'>, string> {
  const blank = emptyAttribution();
  const empty = {
    utm_source: blank.utm_source,
    utm_medium: blank.utm_medium,
    utm_campaign: blank.utm_campaign,
    utm_term: blank.utm_term,
    utm_content: blank.utm_content,
    gclid: blank.gclid,
    fbclid: blank.fbclid,
    landing_page: blank.landing_page,
    referrer: blank.referrer,
  };

  if (typeof window === 'undefined') return empty;

  try {
    const existing = sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (existing) {
      const sanitized = sanitizeAttribution(JSON.parse(existing));
      // A real snapshot always has the landing URL. Anything else is corrupt.
      if (sanitized.landing_page) return pickFirstTouch(sanitized);
    }
  } catch {
    /* unreadable storage — capture again below */
  }

  const params = new URLSearchParams(window.location.search);
  const fresh = sanitizeAttribution({
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
    landing_page: window.location.href,
    referrer: document.referrer,
  });
  const stored = pickFirstTouch(fresh);
  try {
    sessionStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* private mode / quota — the form still submits with whatever we have */
  }
  return stored;
}

function pickFirstTouch(attribution: ReturnType<typeof sanitizeAttribution>) {
  const out = {} as Record<Exclude<AttributionKey, 'submitted_from'>, string>;
  for (const key of FIRST_TOUCH_KEYS) out[key] = attribution[key];
  return out;
}
