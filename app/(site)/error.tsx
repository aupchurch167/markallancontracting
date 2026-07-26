'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CONTACT, telHref } from '@/lib/constants';

/**
 * Branded error boundary for the site. If Sentry (or any window error reporter)
 * is wired later, capture here — the DSN is the only missing piece.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-sm font-bold uppercase tracking-widest text-accent">Something broke</div>
      <h1 className="mt-3 text-3xl font-bold text-navy">This one&apos;s on us</h1>
      <p className="mt-3 text-stone-600">
        The page hit an error. Try again, or just call us — that&apos;s the fastest
        way to reach the team anyway.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-ghost">
          Try again
        </button>
        <a href={telHref(CONTACT.phoneRaw)} className="btn-call" data-tracked-phone>
          Call {CONTACT.phone}
        </a>
        <Link href="/" className="btn-ghost">
          Home
        </Link>
      </div>
    </div>
  );
}
