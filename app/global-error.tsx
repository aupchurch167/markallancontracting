'use client';

/**
 * Root error boundary — catches failures in the root layout itself, so it must
 * render its own <html>/<body>. Intentionally dependency-free and inline-styled
 * (the app's CSS may not have loaded).
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
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#fff', color: '#14212E' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <div style={{ color: '#2E75B6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, fontSize: 13 }}>
            Something broke
          </div>
          <h1 style={{ color: '#1B3A5C', fontSize: 30, margin: '12px 0 8px' }}>This one&apos;s on us</h1>
          <p style={{ color: '#556270', lineHeight: 1.6 }}>
            The page hit an error. Try again, or call us at (404) 724-8709.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, background: '#2E75B6', color: '#fff', border: 0, borderRadius: 6, padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
