import { NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { alignAndCrop, orientOptimize, type CropAspect } from '@/lib/image-process';
import { enhanceImage, checkImage, isGeminiConfigured } from '@/lib/gemini';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ASPECTS: CropAspect[] = ['16:9', '4:3', '1:1', 'original'];

/**
 * Process one uploaded photo and return three versions the admin can choose
 * from — the original (auto-oriented + optimized), an auto-cropped/aligned
 * version at the target aspect, and a Gemini-enhanced version — plus a
 * quality/appropriateness note. Nothing is destructive: all three live in R2 and
 * the caller decides which URL to keep.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isR2Configured) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set the S3_* (R2) variables.' },
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
  if (file.size > MAX_FILE_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json({ error: `That image is ${mb}MB — the max is 25MB.` }, { status: 400 });
  }
  if (/image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
    return NextResponse.json(
      {
        error:
          'That looks like an iPhone HEIC photo, which can’t be processed. On your iPhone: ' +
          'Settings → Camera → Formats → “Most Compatible”, or export as JPEG, then try again.',
      },
      { status: 400 },
    );
  }

  const aspect: CropAspect = ASPECTS.includes(form.get('aspect') as CropAspect)
    ? (form.get('aspect') as CropAspect)
    : '16:9';
  const prefix = String(form.get('prefix') || 'covers');
  const base = Buffer.from(await file.arrayBuffer());

  // Deterministic versions (sharp). If sharp can't read the input, it's not a
  // usable web image — fail clearly.
  let original, cropped;
  try {
    original = await orientOptimize(base);
    cropped = await alignAndCrop(base, aspect);
  } catch {
    return NextResponse.json(
      { error: 'Could not read that image. Use a standard JPEG, PNG, or WEBP.' },
      { status: 400 },
    );
  }

  const put = (buf: Buffer, ct: string) =>
    uploadToR2({ buffer: buf, contentType: ct, filename: file.name, prefix });

  let originalUrl: string;
  let croppedUrl: string;
  try {
    [originalUrl, croppedUrl] = await Promise.all([
      put(original.buffer, original.mimeType).then((r) => r.url),
      put(cropped.buffer, cropped.mimeType).then((r) => r.url),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `Upload to R2 failed: ${message}` }, { status: 502 });
  }

  // Gemini — best effort. Enhancement can fail or be unconfigured; the deterministic
  // versions are always available, so we degrade gracefully.
  let enhancedUrl: string | null = null;
  let enhanceError: string | null = null;
  let check = { ok: true, notes: '' };

  if (isGeminiConfigured) {
    const [checkResult, enhanced] = await Promise.all([
      checkImage(cropped.buffer, cropped.mimeType),
      enhanceImage(cropped.buffer, cropped.mimeType).catch((e: unknown) => {
        enhanceError = e instanceof Error ? e.message : 'Enhancement failed.';
        return null;
      }),
    ]);
    check = checkResult;
    if (enhanced) {
      try {
        enhancedUrl = (await put(enhanced.buffer, enhanced.mimeType)).url;
      } catch (e) {
        enhanceError = e instanceof Error ? e.message : 'Storing the enhanced image failed.';
      }
    }
  }

  return NextResponse.json({
    originalUrl,
    croppedUrl,
    enhancedUrl,
    enhanceError,
    check,
    geminiConfigured: isGeminiConfigured,
  });
}
