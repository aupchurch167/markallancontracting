import 'server-only';

/**
 * Minimal password gate for /admin. This protects a single owner-operated
 * console — it is not a multi-user identity system. A correct password mints a
 * signed, time-boxed session cookie (HMAC-SHA256 over an expiry timestamp using
 * the Web Crypto API, so it runs in both the Edge middleware and Node routes).
 *
 * Required env:
 *   ADMIN_PASSWORD        — the shared password.
 *   ADMIN_SESSION_SECRET  — a long random string used to sign the cookie.
 *
 * Until both are set, the gate denies everything (isAdminAuthConfigured=false).
 */

export const ADMIN_COOKIE = 'mac_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const password = process.env.ADMIN_PASSWORD || '';
const secret = process.env.ADMIN_SESSION_SECRET || '';

export const isAdminAuthConfigured = password.length > 0 && secret.length >= 16;

const encoder = new TextEncoder();

/** base64url encode without depending on the Node Buffer polyfill (Edge-safe). */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return toBase64Url(new Uint8Array(sig));
}

/** Constant-time-ish string compare to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/** True when the supplied password matches the configured one. */
export function checkPassword(candidate: string): boolean {
  if (!isAdminAuthConfigured) return false;
  return safeEqual(candidate, password);
}

/** Mint a signed session token: `<expiryEpoch>.<sig>`. */
export async function createSessionToken(): Promise<string> {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS);
  const sig = await hmac(expiry);
  return `${expiry}.${sig}`;
}

/** Validate a session token: signature must match and expiry must be future. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!isAdminAuthConfigured || !token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(expiry);
  if (!safeEqual(sig, expected)) return false;
  const expiryNum = Number(expiry);
  if (!Number.isFinite(expiryNum)) return false;
  return expiryNum > Math.floor(Date.now() / 1000);
}

export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;
