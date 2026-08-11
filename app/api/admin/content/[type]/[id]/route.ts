import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  getEditorContent,
  updatePostById,
  updateProjectById,
  setStatus,
  deleteItem,
  type EditorPost,
  type EditorProject,
} from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import { uploadToR2, isR2Configured, type R2Object } from '@/lib/r2';
import { linkifyMarkdown } from '@/lib/internal-links';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILES = 12;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function parseType(type: string): 'post' | 'project' | null {
  return type === 'post' || type === 'project' ? type : null;
}

/** Replace ![caption](photo:N) with the newly uploaded R2 URLs. */
function resolvePhotoPlaceholders(md: string, urls: string[]) {
  const used = new Set<number>();
  const out = md.replace(/!\[([^\]]*)\]\(photo:(\d+)\)/g, (_m, caption, idx) => {
    const n = Number(idx);
    const url = urls[n];
    if (!url) return '';
    used.add(n);
    return `![${caption}](${url})`;
  });
  return { md: out, usedIndices: used };
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

/**
 * Update editable fields. Accepts multipart with optional new photo/PDF files:
 * new images resolve any ![](photo:N) placeholders in the body and are appended
 * to the gallery (projects); existing images/attachments are preserved.
 */
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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  let content: EditorPost | EditorProject;
  try {
    content = JSON.parse(String(form.get('content') || ''));
  } catch {
    return NextResponse.json({ error: 'Missing or malformed content.' }, { status: 400 });
  }
  if (!content?.title || !content?.slug) {
    return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
  }

  // Upload any newly attached files.
  const uploads = form.getAll('files').filter((f): f is File => f instanceof File);
  if (uploads.length > MAX_FILES) {
    return NextResponse.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });
  }
  if (uploads.length && !isR2Configured) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set the S3_* (R2) variables.' },
      { status: 503 },
    );
  }
  const stored: R2Object[] = [];
  try {
    for (const f of uploads) {
      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `"${f.name}" is too large.` }, { status: 400 });
      }
      const buf = Buffer.from(await f.arrayBuffer());
      stored.push(
        await uploadToR2({
          buffer: buf,
          contentType: f.type || 'application/octet-stream',
          filename: f.name,
          prefix: t === 'post' ? 'insights' : 'projects',
        }),
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `File upload failed: ${message}` }, { status: 502 });
  }

  const images = stored.filter((s) => s.contentType.startsWith('image/'));
  const imageUrls = images.map((im) => im.url);
  const newAttachments = stored.map((s) => ({
    label: s.filename,
    url: s.url,
    contentType: s.contentType,
  }));

  // Optional status change from the editor's Save-draft / Publish / Unpublish.
  const rawStatus = String(form.get('status') || '');
  const nextStatus = rawStatus === 'draft' || rawStatus === 'published' ? rawStatus : null;

  try {
    if (t === 'post') {
      const c = content as EditorPost;
      const { md } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
      const bodyMarkdown = linkifyMarkdown(md);
      await updatePostById({ ...c, id, bodyMarkdown }, newAttachments);
      if (nextStatus) await setStatus('post', id, nextStatus);
      revalidatePath('/insights');
      revalidatePath(`/insights/${c.slug}`);
      revalidatePath('/feed.xml');
      return NextResponse.json({ ok: true, url: `/insights/${c.slug}`, status: nextStatus });
    }

    const c = content as EditorProject;
    // The gallery is managed explicitly in the editor (c.imageUrls); newly
    // uploaded files here are only for placing inline body photos (photo:N).
    const { md } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
    const bodyMarkdown = linkifyMarkdown(md);
    await updateProjectById({ ...c, id, bodyMarkdown }, newAttachments);
    if (nextStatus) await setStatus('project', id, nextStatus);
    revalidatePath('/projects');
    revalidatePath(`/projects/${c.slug}`);
    revalidatePath('/');
    return NextResponse.json({ ok: true, url: `/projects/${c.slug}`, status: nextStatus });
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
