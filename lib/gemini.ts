import 'server-only';

/**
 * AI cover-image generation via Google Gemini (plain REST — no SDK). Best-effort
 * and gated by GEMINI_API_KEY: missing key → isGeminiConfigured is false and the
 * caller returns a clean 503. Returns raw image bytes for the caller to store in
 * R2 (so we serve a stable public URL, not an expiring one).
 *
 * Env:
 *   GEMINI_API_KEY      — required to enable.
 *   GEMINI_IMAGE_MODEL  — default "gemini-2.5-flash-image".
 *   GEMINI_IMAGE_BASE   — default "https://generativelanguage.googleapis.com".
 */

const apiKey = process.env.GEMINI_API_KEY || '';
const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const base = (process.env.GEMINI_IMAGE_BASE || 'https://generativelanguage.googleapis.com').replace(
  /\/+$/,
  '',
);

export const isGeminiConfigured = apiKey.length > 0;

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 45_000;

export interface GeneratedImage {
  buffer: Buffer;
  mimeType: string;
}

/** Wrap a subject in the house cover aesthetic. */
export function coverPrompt(subject: string): string {
  return (
    `Create a wide 16:9 landscape editorial cover image for a commercial construction ` +
    `company's blog. Subject: ${subject}. Realistic architectural/editorial photography of ` +
    `commercial spaces and construction, clean and professional, natural light, no people's ` +
    `faces, no text, no watermarks, no logos.`
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findInlineData(obj: any): { data: string; mimeType?: string } | null {
  if (!obj || typeof obj !== 'object') return null;
  const inline = obj.inlineData || obj.inline_data;
  if (inline?.data) return { data: inline.data, mimeType: inline.mimeType || inline.mime_type };
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') {
      const found = findInlineData(v);
      if (found) return found;
    }
  }
  return null;
}

function collectText(obj: any): string {
  const parts: string[] = [];
  const walk = (o: any) => {
    if (!o || typeof o !== 'object') return;
    if (typeof o.text === 'string') parts.push(o.text);
    for (const v of Object.values(o)) if (v && typeof v === 'object') walk(v);
  };
  walk(obj);
  return parts.join(' ').trim();
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Generate a cover image from a prompt subject. Throws on failure/timeout. */
export async function generateCoverImage(subject: string): Promise<GeneratedImage> {
  if (!isGeminiConfigured) throw new Error('Gemini is not configured.');
  const endpoint = `${base}/v1beta/models/${model}:generateContent`;
  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: coverPrompt(subject) }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });

  let lastErr = 'Cover generation failed.';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        if (RETRYABLE.has(res.status) && attempt < MAX_ATTEMPTS) {
          lastErr = `Gemini ${res.status}`;
          await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
      }
      const json = await res.json();
      const inline = findInlineData(json);
      if (!inline) {
        const reason =
          json?.promptFeedback?.blockReason || collectText(json) || 'no image returned';
        throw new Error(`Gemini returned no image (${reason}).`);
      }
      return {
        buffer: Buffer.from(inline.data, 'base64'),
        mimeType: inline.mimeType || 'image/png',
      };
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      lastErr = isAbort ? 'Gemini timed out.' : err instanceof Error ? err.message : lastErr;
      if (attempt >= MAX_ATTEMPTS) break;
      if (!isAbort) break; // non-timeout, non-retryable error already thrown above
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(lastErr);
}
