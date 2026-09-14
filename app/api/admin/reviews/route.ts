import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { getReviewsSettings, listReviews } from '@/lib/reviews';

export const runtime = 'nodejs';

/** Aggregate load for the admin Reviews view. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ configured: false });
  }
  try {
    const [settings, reviews] = await Promise.all([getReviewsSettings(), listReviews()]);
    return NextResponse.json({ configured: true, settings, reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
