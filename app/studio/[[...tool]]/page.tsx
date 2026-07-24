import { isSanityConfigured } from '@/sanity/env';
import { StudioClient } from './StudioClient';

export const dynamic = 'force-static';

/**
 * Embedded Sanity Studio at /studio. Renders only once a real project id is set
 * (open item {{SANITY_PROJECT_ID}}). Until then it shows setup instructions
 * instead of crashing. Schemas live in sanity/schemaTypes and are ready.
 */
export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-bold text-navy">Sanity Studio not configured</h1>
        <p className="mt-3 leading-relaxed text-stone-600">
          Set <code className="rounded bg-stone-100 px-1">NEXT_PUBLIC_SANITY_PROJECT_ID</code>{' '}
          in your environment, then reload. The schemas are already defined.
        </p>
      </div>
    );
  }
  return <StudioClient />;
}
