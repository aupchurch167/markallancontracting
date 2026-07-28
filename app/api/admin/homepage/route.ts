import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { writeClient, isWriteConfigured } from '@/sanity/lib/writeClient';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { getHomepageMedia, HOMEPAGE_FALLBACK, type MediaSlot } from '@/lib/homepage-media';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const ACCEPTED = /^image\/(jpeg|png|gif|webp)$/;

/** Current home-page media (Sanity singleton merged with the shipped fallback). */
export async function GET() {
  const media = await getHomepageMedia();
  return NextResponse.json({ media });
}

interface IncomingSlot {
  url?: string;
  alt?: string;
  key?: string;
}

async function uploadImage(file: File): Promise<string> {
  if (!ACCEPTED.test(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Use JPG, PNG, GIF, or WEBP.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large (max 12MB).`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const { url } = await uploadToR2({
    buffer: buf,
    contentType: file.type,
    filename: file.name,
    prefix: 'home',
  });
  return url;
}

export async function POST(req: Request) {
  if (!isWriteConfigured || !writeClient) {
    return NextResponse.json(
      { error: 'Publishing is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  let config: { hero?: IncomingSlot; about?: IncomingSlot; gallery?: IncomingSlot[] };
  try {
    config = JSON.parse(String(form.get('config') || '{}'));
  } catch {
    return NextResponse.json({ error: 'Malformed config.' }, { status: 400 });
  }

  const heroFile = form.get('heroFile');
  const aboutFile = form.get('aboutFile');
  const galleryItems = Array.isArray(config.gallery) ? config.gallery : [];
  const galleryFiles = galleryItems
    .map((g) => (g.key ? form.get(`gallery:${g.key}`) : null))
    .filter((f): f is File => f instanceof File);

  // Only require R2 if there's actually something to upload.
  const needsUpload =
    heroFile instanceof File || aboutFile instanceof File || galleryFiles.length > 0;
  if (needsUpload && !isR2Configured) {
    return NextResponse.json(
      {
        error:
          'File storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, and S3_PUBLIC_URL.',
      },
      { status: 503 },
    );
  }

  let heroUrl: string;
  let aboutUrl: string;
  const gallery: MediaSlot[] = [];
  try {
    heroUrl = heroFile instanceof File ? await uploadImage(heroFile) : config.hero?.url || '';
    aboutUrl = aboutFile instanceof File ? await uploadImage(aboutFile) : config.about?.url || '';
    for (const item of galleryItems) {
      const f = item.key ? form.get(`gallery:${item.key}`) : null;
      const url = f instanceof File ? await uploadImage(f) : item.url || '';
      if (url) gallery.push({ url, alt: item.alt || '' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const doc = {
    _id: 'homepage',
    _type: 'homepage',
    ...(heroUrl ? { heroImage: { url: heroUrl, alt: config.hero?.alt || '' } } : {}),
    ...(aboutUrl ? { aboutImage: { url: aboutUrl, alt: config.about?.alt || '' } } : {}),
    galleryImages: gallery.map((g) => ({
      _key: randomUUID().replace(/-/g, '').slice(0, 12),
      url: g.url,
      alt: g.alt,
    })),
  };

  try {
    await writeClient.createOrReplace(doc as Parameters<typeof writeClient.createOrReplace>[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: `Could not save: ${message}` }, { status: 502 });
  }

  // Push the change live immediately — no redeploy.
  revalidatePath('/');

  // Build the fresh state from what we just wrote (avoids a CDN read race),
  // filling empty slots with the shipped fallback — same rule the site uses.
  const media = {
    hero: heroUrl ? { url: heroUrl, alt: config.hero?.alt || HOMEPAGE_FALLBACK.hero.alt } : HOMEPAGE_FALLBACK.hero,
    about: aboutUrl
      ? { url: aboutUrl, alt: config.about?.alt || HOMEPAGE_FALLBACK.about.alt }
      : HOMEPAGE_FALLBACK.about,
    gallery: gallery.length ? gallery : HOMEPAGE_FALLBACK.gallery,
  };
  return NextResponse.json({ ok: true, media });
}
