import 'server-only';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

/**
 * Cloudflare R2 storage (S3-compatible). Admin uploads (images + PDFs) go here
 * instead of Sanity's asset store; the resulting public URLs are written onto
 * the draft document and rendered directly.
 *
 * Required env (server-side only):
 *   S3_ENDPOINT           — R2 S3 endpoint. May include the bucket path
 *                           (…/mac-website); only the origin is used.
 *   S3_ACCESS_KEY_ID      — R2 S3 API token access key.
 *   S3_SECRET_ACCESS_KEY  — R2 S3 API token secret.
 *   S3_BUCKET             — bucket name.
 *   S3_PUBLIC_URL         — public base for reads, e.g. https://pub-xxx.r2.dev
 *                           or a custom domain. No trailing slash.
 *   S3_REGION             — optional; defaults to "auto".
 */

/**
 * Read an env var, tolerating two common paste mistakes: a value that still
 * includes its own `NAME=` prefix (from pasting a whole .env line into the
 * value field), and surrounding quotes/whitespace.
 */
function env(name: string): string {
  let v = (process.env[name] || '').trim();
  const prefix = `${name}=`;
  if (v.toLowerCase().startsWith(prefix.toLowerCase())) v = v.slice(prefix.length).trim();
  return v.replace(/^['"]|['"]$/g, '').trim();
}

const endpointRaw = env('S3_ENDPOINT');
const region = env('S3_REGION') || 'auto';
const accessKeyId = env('S3_ACCESS_KEY_ID');
const secretAccessKey = env('S3_SECRET_ACCESS_KEY');
const bucket = env('S3_BUCKET');
const publicBase = env('S3_PUBLIC_URL').replace(/\/+$/, '');

// The endpoint may be given with a bucket path appended; the S3 client wants
// only the host origin (the bucket is addressed via forcePathStyle below).
function endpointOrigin(): string {
  try {
    return new URL(endpointRaw).origin;
  } catch {
    return '';
  }
}
const endpoint = endpointOrigin();

export const isR2Configured =
  !!endpoint && !!accessKeyId && !!secretAccessKey && !!bucket && !!publicBase;

let cached: S3Client | null = null;
function s3(): S3Client {
  if (!cached) {
    cached = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      // R2's wildcard cert doesn't cover <bucket>.<account>.r2.cloudflarestorage.com,
      // so address the bucket in the path instead of the host.
      forcePathStyle: true,
    });
  }
  return cached;
}

/** Public hostname of the read base URL — handy for next.config remotePatterns. */
export function r2PublicHostname(): string | null {
  if (!publicBase) return null;
  try {
    return new URL(publicBase).hostname;
  } catch {
    return null;
  }
}

function safeName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const ext = dot > -1 ? filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, '') : '';
  const base = (dot > -1 ? filename.slice(0, dot) : filename)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'file'}${ext}`;
}

export interface R2Object {
  url: string;
  key: string;
  contentType: string;
  filename: string;
}

/**
 * Upload one object under a keyed prefix and return its public URL. Keys are
 * `<prefix>/<uuid>-<safe-name>` so nothing collides and the original name stays
 * readable. Throws on failure (the route turns it into a clean message).
 */
export async function uploadToR2(opts: {
  buffer: Buffer;
  contentType: string;
  filename: string;
  prefix?: string;
}): Promise<R2Object> {
  if (!isR2Configured) throw new Error('R2 is not configured.');
  const { buffer, contentType, filename, prefix = 'admin' } = opts;
  const key = `${prefix}/${randomUUID()}-${safeName(filename)}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  return { url: `${publicBase}/${key}`, key, contentType, filename };
}
