import { NextResponse } from 'next/server';
import { setCoverImage } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

/**
 * Persist just the cover/header image for an existing item, immediately — so a
 * cover uploaded or generated in the editor sticks without a separate Save.
 */
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
  let coverImageUrl = '';
  try {
    coverImageUrl = String((await req.json())?.coverImageUrl ?? '');
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  try {
    await setCoverImage(type, id, coverImageUrl);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save cover.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
