import { NextResponse } from 'next/server';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const ACCEPTED = /^image\/(jpeg|png|gif|webp)$/;

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
  if (!ACCEPTED.test(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || 'unknown'}. Use JPG, PNG, GIF, or WEBP.` },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: `"${file.name}" is too large (max 12MB).` }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToR2({
      buffer: buf,
      contentType: file.type,
      filename: file.name,
      prefix: 'covers',
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `Could not upload: ${message}` }, { status: 502 });
  }
}
