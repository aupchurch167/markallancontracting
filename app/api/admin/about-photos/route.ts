import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { getAboutPhotos, saveAboutPhotos, type AboutPhotos } from '@/lib/content';

export const runtime = 'nodejs';

/** Current About-page photos for the admin editor. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) return NextResponse.json({ configured: false });
  try {
    const photos = await getAboutPhotos();
    return NextResponse.json({ configured: true, photos });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to load.' }, { status: 502 });
  }
}

/** Save the three About-page photo slots (url + alt each). */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  let body: AboutPhotos;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  try {
    await saveAboutPhotos({
      team: { url: body.team?.url || '', alt: body.team?.alt || '' },
      early: { url: body.early?.url || '', alt: body.early?.alt || '' },
      recent: { url: body.recent?.url || '', alt: body.recent?.alt || '' },
    });
    revalidatePath('/about');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed.' }, { status: 502 });
  }
}
