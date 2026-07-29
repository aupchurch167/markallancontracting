import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { setStatus } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

/** Publish or unpublish an item. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  const { type, id } = await params;
  if (type !== 'post' && type !== 'project') {
    return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
  }
  let status: string;
  try {
    status = (await req.json())?.status;
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  if (status !== 'draft' && status !== 'published') {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  try {
    await setStatus(type, id, status);
    revalidatePath(type === 'post' ? '/insights' : '/projects');
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
