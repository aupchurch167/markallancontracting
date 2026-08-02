import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getClientLogos, saveClientLogos, type ClientLogo } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

/** Load the client-logo strip. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) return NextResponse.json({ logos: [], configured: false });
  try {
    const logos = await getClientLogos();
    return NextResponse.json({ logos, configured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load logos.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Save the whole logo list (images already uploaded via /api/admin/cover/upload). */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  let logos: ClientLogo[];
  try {
    const raw = await req.json();
    logos = Array.isArray(raw?.logos)
      ? raw.logos
          .filter((l: unknown): l is ClientLogo => !!l && typeof (l as ClientLogo).url === 'string')
          .map((l: ClientLogo) => ({ url: l.url, name: String(l.name || '') }))
      : [];
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  try {
    await saveClientLogos(logos);
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
