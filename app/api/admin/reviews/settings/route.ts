import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { getReviewsSettings, saveReviewsSettings, type ReviewsSettings } from '@/lib/reviews';

export const runtime = 'nodejs';

/** Update the reviews-block settings (heading, intro, Google URL, real aggregate). */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  let body: ReviewsSettings;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  try {
    await saveReviewsSettings(body);
    for (const p of ['/', '/contact', '/about']) revalidatePath(p);
    const settings = await getReviewsSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed.' }, { status: 502 });
  }
}
