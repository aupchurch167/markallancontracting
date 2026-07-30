import { NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

// Match the (working) gallery/body upload: accept any web-renderable image up
// to 20MB. The header photo was previously limited to exactly jpeg/png/gif/webp
// at 12MB, which rejected common cases — an iPhone HEIC photo, a file whose type
// arrives as "image/jpg" or empty, or a 12–20MB high-res shot.
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const WEB_IMAGE_MIME = /^image\/(jpe?g|png|gif|webp|avif)$/i;

/**
 * Resolve a web-safe image content-type from the file's MIME, falling back to
 * its extension when the browser sends an empty or non-standard type. Returns
 * null if it isn't a supported web image.
 */
function resolveImageType(type: string, name: string): string | null {
  const t = (type || '').toLowerCase();
  if (t === 'image/jpg') return 'image/jpeg';
  if (WEB_IMAGE_MIME.test(t)) return t;
  const ext = name.toLowerCase().slice(name.lastIndexOf('.'));
  const byExt: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
  };
  return byExt[ext] || null;
}

function isHeic(type: string, name: string): boolean {
  return /image\/hei[cf]/i.test(type) || /\.hei[cf]$/i.test(name);
}

/** Upload a single header/cover photo to R2 and return its public URL. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isR2Configured) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set the S3_* (R2) environment variables.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  // HEIC/HEIF (the default iPhone format) can't be displayed on the web, so
  // reject it with a clear, actionable message instead of storing a broken image.
  if (isHeic(file.type, file.name)) {
    return NextResponse.json(
      {
        error:
          'That looks like an iPhone HEIC photo, which browsers can’t display. On your iPhone: Settings → Camera → Formats → “Most Compatible”, or export the photo as JPEG, then try again.',
      },
      { status: 400 },
    );
  }

  const contentType = resolveImageType(file.type, file.name);
  if (!contentType) {
    return NextResponse.json(
      {
        error: `That file isn’t a supported image${file.type ? ` (${file.type})` : ''}. Use JPEG, PNG, GIF, WEBP, or AVIF.`,
      },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      { error: `That image is ${mb}MB — the maximum is 20MB. Please use a smaller version.` },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToR2({
      buffer: buf,
      contentType,
      filename: file.name,
      prefix: 'covers',
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `Could not upload: ${message}` }, { status: 502 });
  }
}
