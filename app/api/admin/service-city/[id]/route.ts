import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { setServiceCityStatus, deleteServiceCity, listServiceCities } from '@/lib/content';

export const runtime = 'nodejs';

async function pathFor(id: string): Promise<string | null> {
  const items = await listServiceCities();
  const it = items.find((i) => i.id === id);
  return it ? `/project-types/${it.serviceSlug}/${it.citySlug}` : null;
}

/** Publish / unpublish a service×city page. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  const { id } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  const status = body.status === 'published' || body.status === 'draft' ? body.status : null;
  if (!status) return NextResponse.json({ error: 'status must be draft or published.' }, { status: 400 });

  try {
    const path = await pathFor(id);
    await setServiceCityStatus(id, status);
    if (path) revalidatePath(path);
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Delete a service×city page. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  const { id } = await params;
  try {
    const path = await pathFor(id);
    await deleteServiceCity(id);
    if (path) revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
