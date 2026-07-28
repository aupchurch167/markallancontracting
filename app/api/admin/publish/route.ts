import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeClient, isWriteConfigured } from '@/sanity/lib/writeClient';
import { uploadToR2, isR2Configured, type R2Object } from '@/lib/r2';
import { blocksToPortableText } from '@/lib/portable-text';
import type { GeneratedPost, GeneratedProject } from '@/lib/anthropic';

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
    doc = {
      _id: draftId,
      _type: 'post',
      title: c.title,
      slug,
      excerpt: c.excerpt || '',
      cluster: c.cluster,
      tags: Array.isArray(c.tags) ? c.tags : [],
      body: blocksToPortableText(c.body),
      publishedAt: new Date().toISOString(),
      featured: false,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      // A generated/chosen cover wins; otherwise the first uploaded image.
      ...(c.coverImageUrl || images[0]
        ? { heroImageUrl: c.coverImageUrl || images[0].url }
        : {}),
      ...(attachments.length ? { attachments } : {}),
    };
  } else {
    const c = content as GeneratedProject;
    doc = {
      _id: draftId,
      _type: 'project',
      title: c.title,
      slug,
      clientType: c.clientType || '',
      scopeSummary: c.scopeSummary || '',
      challenge: blocksToPortableText(c.challenge),
      solution: blocksToPortableText(c.solution),
      timeline: c.timeline || '',
      squareFootage: c.squareFootage || '',
      status: 'delivered',
      featured: false,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      ...(images.length
        ? {
            imageUrls: images.map((im) => ({
              _key: randomUUID().replace(/-/g, '').slice(0, 12),
              url: im.url,
              alt: c.title,
            })),
          }
        : {}),
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
