import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getEditorContent,
  updatePostById,
  updateProjectById,
  deleteItem,
  type EditorPost,
  type EditorProject,
} from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';

function parseType(type: string): 'post' | 'project' | null {
  return type === 'post' || type === 'project' ? type : null;
}

/** Load one item in the editor shape. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { type, id } = await params;
  const t = parseType(type);
  if (!t) return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
  const content = await getEditorContent(t, id);
  if (!content) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ content });
}

/** Update editable fields (preserves images/attachments). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  const { type, id } = await params;
  const t = parseType(type);
  if (!t) return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });

  let body: EditorPost | EditorProject;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  if (!body?.title || !body?.slug) {
    return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
  }

  try {
    if (t === 'post') {
      await updatePostById({ ...(body as EditorPost), id });
      revalidatePath('/insights');
      revalidatePath(`/insights/${body.slug}`);
      return NextResponse.json({ ok: true, url: `/insights/${body.slug}` });
    }
    await updateProjectById({ ...(body as EditorProject), id });
    revalidatePath('/projects');
    revalidatePath(`/projects/${body.slug}`);
    revalidatePath('/');
    return NextResponse.json({ ok: true, url: `/projects/${body.slug}` });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Delete an item. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { type, id } = await params;
  const t = parseType(type);
  if (!t) return NextResponse.json({ error: 'Invalid type.' }, { status: 400 });
  try {
    await deleteItem(t, id);
    revalidatePath(t === 'post' ? '/insights' : '/projects');
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
