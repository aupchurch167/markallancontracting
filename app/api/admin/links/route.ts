import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { getLinksProfile, listButtons, listUpdates, listLeads } from '@/lib/links';

export const runtime = 'nodejs';

/** Aggregate load for the admin Links view. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ configured: false });
  }
  try {
    const [profile, buttons, updates, leads] = await Promise.all([
      getLinksProfile(),
      listButtons(),
      listUpdates(),
      listLeads(),
    ]);
    return NextResponse.json({ configured: true, profile, buttons, updates, leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
