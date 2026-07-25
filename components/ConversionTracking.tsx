'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function track(event: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

/**
 * Sitewide conversion tracking. The whole site's goal is phone calls, so every
 * tap-to-call click and every lead-form submit fires a GA4 event. Rendered once
 * in the root layout; no-ops when GA4 isn't loaded. Uses event delegation so the
 * phone links stay server components.
 */
export function ConversionTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (link) {
        track('phone_call_click', {
          // GA4 recommended key so this can be marked a key event / conversion.
          link_url: link.getAttribute('href'),
          link_text: link.textContent?.trim().slice(0, 80),
          page_path: window.location.pathname,
        });
      }
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLElement | null;
      if (form?.closest('[data-lead-form]')) {
        track('generate_lead', {
          form_id: 'scope',
          page_path: window.location.pathname,
        });
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('submit', onSubmit);
    };
  }, []);

  return null;
}
