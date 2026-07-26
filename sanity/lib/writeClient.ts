import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env';

/**
 * Server-only Sanity client with write access. Requires SANITY_WRITE_TOKEN
 * (create one at sanity.io/manage — Editor role or higher). Returns null when
 * either the project id or the write token is missing, so callers can fail
 * gracefully with a clear message instead of throwing at import time.
 *
 * NEVER import this into a client component — the token must stay server-side.
 */
const writeToken = process.env.SANITY_WRITE_TOKEN || '';

export const isWriteConfigured = isSanityConfigured && writeToken.length > 0;

export const writeClient: SanityClient | null = isWriteConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token: writeToken,
      useCdn: false,
    })
  : null;
