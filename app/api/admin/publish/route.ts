import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeClient, isWriteConfigured } from '@/sanity/lib/writeClient';
import { uploadToR2, isR2Configured, type R2Object } from '@/lib/r2';
import { linkifyMarkdown } from '@/lib/internal-links';
import type { GeneratedPost, GeneratedProject } from '@/lib/anthropic';
import { requireAdmin } from '@/lib/admin-guard';

/**
 * Replace ![caption](photo:N) placeholders in a Markdown body with the uploaded
 * R2 URLs. Drops any image whose index has no upload. Returns which photo
 * indices were used so they aren't reused as the hero.
 */
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

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILES = 12;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isWriteConfigured || !writeClient) {
    return NextResponse.json(
      {
        error:
          'Publishing is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN.',
      },
      { status: 503 },
    );
  }
  if (!isR2Configured) {
    return NextResponse.json(
      {
        error:
          'File storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, and S3_PUBLIC_URL.',
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  const contentType = String(form.get('contentType') || '');
  if (contentType !== 'post' && contentType !== 'project') {
    return NextResponse.json({ error: 'Invalid content type.' }, { status: 400 });
  }

  let content: GeneratedPost | GeneratedProject;
  try {
    content = JSON.parse(String(form.get('content') || ''));
  } catch {
    return NextResponse.json({ error: 'Missing or malformed content.' }, { status: 400 });
  }
  if (!content?.title || !content?.slug) {
    return NextResponse.json({ error: 'Content needs at least a title and slug.' }, { status: 400 });
  }

  // Upload every attached file (images + PDFs) to Cloudflare R2.
  const uploads = form.getAll('files').filter((f): f is File => f instanceof File);
  if (uploads.length > MAX_FILES) {
    return NextResponse.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });
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
          prefix: contentType === 'post' ? 'insights' : 'projects',
        }),
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `File upload to R2 failed: ${message}` }, { status: 502 });
  }

  const images = stored.filter((s) => s.contentType.startsWith('image/'));
  const attachments = stored.map((s) => ({
    _key: randomUUID().replace(/-/g, '').slice(0, 12),
    label: s.filename,
    url: s.url,
    contentType: s.contentType,
  }));

  const baseId = randomUUID();
  const draftId = `drafts.${baseId}`;
  const slug = { _type: 'slug', current: slugify(content.slug || content.title) };

  let doc: Record<string, unknown>;
  if (contentType === 'post') {
    const c = content as GeneratedPost;
    const imageUrls = images.map((im) => im.url);
    // Resolve photo placeholders to R2 URLs, then weave in internal links.
    const { md, usedIndices } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
    const bodyMarkdown = linkifyMarkdown(md);
    // A photo placed inline isn't reused as the hero; cover wins over uploads.
    const heroFromUpload = images.find((_, i) => !usedIndices.has(i))?.url;
    const heroImageUrl = c.coverImageUrl || heroFromUpload;
    doc = {
      _id: draftId,
      _type: 'post',
      title: c.title,
      slug,
      excerpt: c.excerpt || '',
      cluster: c.cluster,
      tags: Array.isArray(c.tags) ? c.tags : [],
      bodyMarkdown,
      publishedAt: new Date().toISOString(),
      featured: false,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      ...(heroImageUrl ? { heroImageUrl } : {}),
      ...(attachments.length ? { attachments } : {}),
    };
  } else {
    const c = content as GeneratedProject;
    const imageUrls = images.map((im) => im.url);
    const { md, usedIndices } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
    const bodyMarkdown = linkifyMarkdown(md);
    // Photos not placed inline in the body become the gallery.
    const galleryImages = images
      .map((im, i) => ({ im, i }))
      .filter(({ i }) => !usedIndices.has(i))
      .map(({ im }) => ({
        _key: randomUUID().replace(/-/g, '').slice(0, 12),
        url: im.url,
        alt: c.title,
      }));
    doc = {
      _id: draftId,
      _type: 'project',
      title: c.title,
      slug,
      clientType: c.clientType || '',
      scopeSummary: c.scopeSummary || '',
      bodyMarkdown,
      timeline: c.timeline || '',
      squareFootage: c.squareFootage || '',
      status: 'delivered',
      featured: false,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      ...(galleryImages.length ? { imageUrls: galleryImages } : {}),
      ...(attachments.length ? { attachments } : {}),
    };
  }

  try {
    await writeClient.createOrReplace(doc as Parameters<typeof writeClient.createOrReplace>[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: `Could not save draft: ${message}` }, { status: 502 });
  }

  // Sanity Studio intent link resolves to the draft for editing/publishing.
  const studioUrl = `/studio/intent/edit/id=${baseId};type=${contentType}/`;
  return NextResponse.json({ ok: true, id: baseId, studioUrl });
}
