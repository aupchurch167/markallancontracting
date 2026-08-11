import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { saveUpdate, deleteUpdate, type UpdateInput } from '@/lib/links';

export const runtime = 'nodejs';

async function guard() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  return null;
}

/** Create or update a jobsite update. Image is uploaded separately (cover/upload). */
export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  let body: UpdateInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!body.body?.trim()) {
    return NextResponse.json({ error: 'Write something first.' }, { status: 422 });
  }
  const status = body.status === 'draft' ? 'draft' : 'published';
  try {
    const id = await saveUpdate({ id: body.id, body: body.body, imageUrl: body.imageUrl ?? null, status });
    revalidatePath('/links');
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed.' }, { status: 502 });
  }
}

/** Delete: body { id }. */
export async function DELETE(req: Request) {
  const g = await guard();
  if (g) return g;
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: 'id is required.' }, { status: 422 });
  try {
    await deleteUpdate(body.id);
    revalidatePath('/links');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed.' }, { status: 502 });
  }
}
