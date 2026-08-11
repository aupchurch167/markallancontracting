import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { listServiceCities } from '@/lib/content';

export const runtime = 'nodejs';

/** List every service×city page (all statuses) for the admin builder. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ configured: false, items: [] });
  }
  try {
    const items = await listServiceCities();
    return NextResponse.json({ configured: true, items });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
