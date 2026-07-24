import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env';

/**
 * Returns a configured Sanity client, or null when no project id is set yet.
 * Query helpers in lib/queries.ts check for null and return safe empties so the
 * marketing site builds and renders before Sanity is provisioned.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;
