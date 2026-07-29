import { NextResponse } from 'next/server';
import { listAllContent } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

/** List all posts and projects (any status) for the Manage view. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ items: [], configured: false });
  }
  try {
    const items = await listAllContent();
    return NextResponse.json({ items, configured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load content.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
