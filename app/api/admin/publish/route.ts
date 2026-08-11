import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { uploadToR2, isR2Configured, type R2Object } from '@/lib/r2';
import { linkifyMarkdown } from '@/lib/internal-links';
import { savePost, saveProject } from '@/lib/content';
import { isDbConfigured } from '@/lib/db';
import type { GeneratedPost, GeneratedProject } from '@/lib/anthropic';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILES = 12;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

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

  if (!isDbConfigured) {
    return NextResponse.json(
      { error: 'The CMS database is not configured. Set DATABASE_URL (attach Railway Postgres).' },
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
  const status = String(form.get('status') || 'published') === 'draft' ? 'draft' : 'published';

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
  const imageUrls = images.map((im) => im.url);
  const attachments = stored.map((s) => ({
    label: s.filename,
    url: s.url,
    contentType: s.contentType,
  }));
  const slug = slugify(content.slug || content.title);

  try {
    if (contentType === 'post') {
      const c = content as GeneratedPost;
      const { md, usedIndices } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
      const bodyMarkdown = linkifyMarkdown(md);
      const heroFromUpload = images.find((_, i) => !usedIndices.has(i))?.url;
      const heroImageUrl = c.coverImageUrl || heroFromUpload;
      await savePost({
        slug,
        title: c.title,
        excerpt: c.excerpt || '',
        cluster: c.cluster,
        tags: Array.isArray(c.tags) ? c.tags : [],
        primaryKeyword: c.primaryKeyword,
        secondaryKeywords: c.secondaryKeywords,
        bodyMarkdown,
        heroImageUrl,
        metaTitle: c.metaTitle || '',
        metaDescription: c.metaDescription || '',
        attachments,
        gbpPost: c.gbpPost || '',
        status,
      });
      revalidatePath('/insights');
      revalidatePath(`/insights/${slug}`);
      revalidatePath('/feed.xml');
      return NextResponse.json({ ok: true, slug, url: `/insights/${slug}`, status });
    }

    const c = content as GeneratedProject;
    const { md, usedIndices } = resolvePhotoPlaceholders(c.bodyMarkdown || '', imageUrls);
    const bodyMarkdown = linkifyMarkdown(md);
    const galleryImages = images
      .map((im, i) => ({ im, i }))
      .filter(({ i }) => !usedIndices.has(i))
      .map(({ im }) => ({ url: im.url, alt: c.title }));
    await saveProject({
      slug,
      title: c.title,
      clientType: c.clientType || '',
      scopeSummary: c.scopeSummary || '',
      bodyMarkdown,
      timeline: c.timeline || '',
      squareFootage: c.squareFootage || '',
      cardQuote: c.cardQuote || '',
      heroImageUrl: c.coverImageUrl,
      imageUrls: c.imageUrls?.length ? c.imageUrls : galleryImages,
      attachments,
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      status,
    });
    revalidatePath('/projects');
    revalidatePath(`/projects/${slug}`);
    revalidatePath('/');
    return NextResponse.json({ ok: true, slug, url: `/projects/${slug}`, status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: `Could not save: ${message}` }, { status: 502 });
  }
}
