import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { importFallbackContent } from '@/lib/import-fallback';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * Import the shipped fallback projects/posts into the CMS so they can be
 * managed and edited. Idempotent: slugs already in the database are skipped.
 */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isDbConfigured) {
    return NextResponse.json(
      { error: 'The CMS database is not configured. Set DATABASE_URL (attach Railway Postgres).' },
      { status: 503 },
    );
  }

  try {
    const result = await importFallbackContent();
    revalidatePath('/insights');
    revalidatePath('/projects');
    revalidatePath('/');
    revalidatePath('/feed.xml');
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed.';
    return NextResponse.json({ error: `Import failed: ${message}` }, { status: 502 });
  }
}
