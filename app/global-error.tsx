'use client';

import { CONTACT, telHref } from '@/lib/constants';

/**
 * Root error boundary — catches failures in the root layout itself, so it must
 * render its own <html>/<body>. Intentionally dependency-free and inline-styled
 * (the app's CSS may not have loaded) but on the print palette.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          margin: 0,
          background: '#E8E1D5',
          color: '#5A2634',
        }}
      >
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ color: '#A98B62', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 3, fontSize: 11 }}>
            Something broke
          </div>
          <h1 style={{ color: '#5A2634', fontSize: 34, textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>
            This one&apos;s on us
          </h1>
          <p style={{ color: '#5A2634', opacity: 0.7, lineHeight: 1.65 }}>
            The page hit an error. Try again, or call us at{' '}
            <a href={telHref()} style={{ color: '#5A2634', fontWeight: 700 }}>
              {CONTACT.phone}
            </a>
            .
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              background: '#5A2634',
              color: '#E8E1D5',
              border: 0,
              padding: '12px 28px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
