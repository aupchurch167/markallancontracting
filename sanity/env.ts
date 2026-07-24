export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

// {{SANITY_PROJECT_ID}} — open item. Empty until the Sanity project exists.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/** Sanity is only wired up once a real project id is present. */
export const isSanityConfigured = projectId.length > 0;
