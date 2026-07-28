import { NextResponse } from 'next/server';
import { generateCoverImage, isGeminiConfigured } from '@/lib/gemini';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isGeminiConfigured) {
    return NextResponse.json(
      { error: 'Cover generation is not configured. Set GEMINI_API_KEY in the environment.' },
      { status: 503 },
    );
  }
  if (!isR2Configured) {
    return NextResponse.json(
      { error: 'File storage is not configured. Set the S3_* (R2) environment variables.' },
      { status: 503 },
    );
  }

  let prompt = '';
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }
  if (prompt.length < 3) {
    return NextResponse.json({ error: 'Describe the cover in a few words first.' }, { status: 400 });
  }

  let image;
  try {
    image = await generateCoverImage(prompt);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Cover generation failed.';
    const timedOut = /timed out/i.test(message);
    return NextResponse.json({ error: message }, { status: timedOut ? 504 : 502 });
  }

  try {
    const ext = EXT[image.mimeType] || 'png';
    const { url } = await uploadToR2({
      buffer: image.buffer,
      contentType: image.mimeType,
      filename: `cover.${ext}`,
      prefix: 'covers',
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Storing the cover failed.';
    return NextResponse.json({ error: `Could not store cover: ${message}` }, { status: 502 });
  }
}
