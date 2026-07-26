import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { writeClient, isWriteConfigured } from '@/sanity/lib/writeClient';
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

  // Upload attached images as Sanity assets (PDFs are context-only, skipped here).
  const uploads = form.getAll('files').filter((f): f is File => f instanceof File);
  if (uploads.length > MAX_FILES) {
    return NextResponse.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });
  }

  const imageRefs: Array<{ _type: 'image'; _key: string; asset: { _type: 'reference'; _ref: string }; alt: string }> = [];
  try {
    for (const f of uploads) {
      if (!f.type.startsWith('image/')) continue; // skip PDFs — reference material only
      if (f.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `"${f.name}" is too large.` }, { status: 400 });
      }
      const buf = Buffer.from(await f.arrayBuffer());
      const asset = await writeClient.assets.upload('image', buf, { filename: f.name });
      imageRefs.push({
        _type: 'image',
        _key: randomUUID().replace(/-/g, '').slice(0, 12),
        asset: { _type: 'reference', _ref: asset._id },
        alt: content.title,
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image upload failed.';
    return NextResponse.json({ error: `Image upload failed: ${message}` }, { status: 502 });
  }

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
      ...(imageRefs[0]
        ? { mainImage: { _type: 'image', asset: imageRefs[0].asset, alt: c.title } }
        : {}),
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
      ...(imageRefs.length ? { images: imageRefs } : {}),
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
