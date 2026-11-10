/**
 * Node-only startup hook. Imported from instrumentation.ts only when
 * NEXT_RUNTIME is nodejs, so the edge bundle does not pull in Postgres.
 */
export async function registerInsightFixes(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { ensureSchema } = await import('./db');
    const { applyPublishedInsightFixes } = await import('./insight-body-fix-run');
    await ensureSchema();
    await applyPublishedInsightFixes();
  } catch (err) {
    console.warn('[insight-fix] startup skipped:', err instanceof Error ? err.message : err);
  }
}
