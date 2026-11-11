/**
 * Startup entry for the published Insights body patch.
 * The work lives in `insight-body-fixes.ts` so the unit test can run it
 * without opening Postgres. This module is what the server imports.
 */
export { applyPublishedInsightFixes } from './insight-body-fixes';
