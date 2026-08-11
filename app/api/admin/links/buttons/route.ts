import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { saveButton, deleteButton, reorderButtons, type ButtonInput } from '@/lib/links';

export const runtime = 'nodejs';

async function guard() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  return null;
}

/** Create or update a button. */
export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  let body: ButtonInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!body.label?.trim() || !body.href?.trim()) {
    return NextResponse.json({ error: 'Label and URL are required.' }, { status: 422 });
  }
  try {
    const id = await saveButton(body);
    revalidatePath('/links');
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Save failed.' }, { status: 502 });
  }
}

/** Reorder: body { orderedIds: string[] }. */
export async function PUT(req: Request) {
  const g = await guard();
  if (g) return g;
  let body: { orderedIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }
  if (!Array.isArray(body.orderedIds)) {
    return NextResponse.json({ error: 'orderedIds must be an array.' }, { status: 422 });
  }
  try {
    await reorderButtons(body.orderedIds);
    revalidatePath('/links');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Reorder failed.' }, { status: 502 });
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
    await deleteButton(body.id);
    revalidatePath('/links');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed.' }, { status: 502 });
  }
}
