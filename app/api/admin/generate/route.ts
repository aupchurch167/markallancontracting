import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import {
  generateContent,
  isAnthropicConfigured,
  type AttachedFile,
  type ContentType,
} from '@/lib/anthropic';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Guardrails so a stray upload can't blow past Claude's per-request limits.
const MAX_FILES = 8;
const MAX_FILE_BYTES = 12 * 1024 * 1024; // 12MB each
const ACCEPTED = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/;

/**
 * Prepare an image for the Claude vision API. Full-resolution phone/camera
 * photos base64-encode past the API's 10MB-per-image limit (a ~9MB JPEG becomes
 * ~12MB base64), so downscale the long edge to 1568px — the size the API would
 * downsample to anyway — and re-encode as JPEG. Keeps every image well under the
 * limit and cuts token cost. Falls back to the original only if it's already small.
 */
async function toClaudeImage(buf: Buffer, mediaType: string): Promise<AttachedFile> {
  try {
    const out = await sharp(buf)
      .rotate() // honor EXIF orientation (portrait phone photos)
      .resize({ width: 1568, height: 1568, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return { mediaType: 'image/jpeg', data: out.toString('base64') };
  } catch {
    if (buf.length <= 6 * 1024 * 1024) return { mediaType, data: buf.toString('base64') };
    throw new Error('Could not process an attached image — please try a smaller or different photo.');
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isAnthropicConfigured) {
    return NextResponse.json(
      { error: 'Generation is not configured. Set ANTHROPIC_API_KEY in the environment.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    // Surface WHY it failed. The usual prod cause is the POST being redirected
    // (apex→www, http→https, or a domain forward), which drops the body and its
    // multipart content-type. The received content-type makes that diagnosable.
    const ct = req.headers.get('content-type') || '(none)';
    const detail = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json(
      {
        error: `Could not read the upload (content-type: ${ct}). If you're on a redirecting URL, open /admin on the canonical domain. [${detail}]`,
      },
      { status: 400 },
    );
  }

  const contentType = String(form.get('contentType') || '') as ContentType;
  if (contentType !== 'post' && contentType !== 'project') {
    return NextResponse.json({ error: 'Invalid content type.' }, { status: 400 });
  }

  const brief = String(form.get('brief') || '').trim();
  if (brief.length < 10) {
    return NextResponse.json({ error: 'Give a brief of at least a sentence.' }, { status: 400 });
  }
  const context = String(form.get('context') || '').trim();
  const seo = {
    primaryKeyword: String(form.get('primaryKeyword') || '').trim(),
    secondaryKeywords: String(form.get('secondaryKeywords') || '').trim(),
    reader: String(form.get('reader') || '').trim(),
    searchIntent: String(form.get('searchIntent') || '').trim(),
    length: String(form.get('length') || '').trim(),
  };

  const uploads = form.getAll('files').filter((f): f is File => f instanceof File);
  if (uploads.length > MAX_FILES) {
    return NextResponse.json({ error: `Attach at most ${MAX_FILES} files.` }, { status: 400 });
  }

  const files: AttachedFile[] = [];
  for (const f of uploads) {
    if (!ACCEPTED.test(f.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${f.type || 'unknown'}. Use JPG, PNG, GIF, WEBP, or PDF.` },
        { status: 400 },
      );
    }
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${f.name}" is too large (max 12MB).` },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await f.arrayBuffer());
    if (f.type.startsWith('image/')) {
      files.push(await toClaudeImage(buf, f.type));
    } else {
      files.push({ mediaType: f.type, data: buf.toString('base64') }); // PDF
    }
  }

  try {
    const content = await generateContent({ contentType, brief, context, files, seo });
    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json(
        { error: `Claude API error: ${err.message}` },
        { status },
      );
    }
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
