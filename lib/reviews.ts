import 'server-only';
import { randomUUID } from 'crypto';
import { query, queryOne, safeQuery, safeQueryOne, ensureSchema, isDbConfigured } from './db';

/**
 * Content layer for curated Google reviews shown on the marketing site.
 *
 * These are REAL reviews the owner copies from their Google Business Profile.
 * We do not scrape Google (ToS + brittle) and never invent quotes or stars. The
 * owner hand-picks which reviews to feature — curating your best is fine; the
 * honesty rules we hold to are: real text, real names, real per-review stars,
 * and a link out to the full Google reviews so the complete picture is one tap
 * away. The site-wide aggregate rating is shown/marked-up ONLY when the owner
 * enters the true GMB numbers (see ReviewsSettings), so the on-page number and
 * the JSON-LD aggregateRating always match a real source they maintain.
 *
 * Reads never throw (safeQuery) so pages always render. Nothing is seeded —
 * with no real reviews entered, the block simply doesn't render.
 */

// ---------- types ----------
export interface Review {
  id: string;
  author: string;
  /** e.g. "Owner, Glenwood Kitchen" — optional. */
  role: string;
  /** 1–5. */
  rating: number;
  body: string;
  /** ISO date string, or '' if not recorded. */
  reviewDate: string;
  /** Where the review came from — shown as "via Google". */
  source: string;
  visible: boolean;
  sortOrder: number;
}

export interface ReviewsSettings {
  /** Section heading on the public block. */
  heading: string;
  /** Optional intro line under the heading. */
  intro: string;
  /** GBP reviews URL for the "Read all our Google reviews" button. */
  reviewsUrl: string;
  /**
   * The REAL Google Business Profile aggregate — the average across ALL reviews,
   * not the curated subset. Null until the owner enters it. Shown on-page and
   * marked up in JSON-LD only when both value and count are present.
   */
  aggregateRating: number | null;
  reviewCount: number | null;
  /** Master switch — hide the whole block without deleting content. */
  visible: boolean;
}

const DEFAULT_SETTINGS: ReviewsSettings = {
  heading: 'What our clients say',
  intro: '',
  reviewsUrl: '',
  aggregateRating: null,
  reviewCount: null,
  visible: true,
};

// ---------- settings (singleton) ----------
export async function getReviewsSettings(): Promise<ReviewsSettings> {
  if (!isDbConfigured) return DEFAULT_SETTINGS;
  await ensureSchema();
  const row = await safeQueryOne<{ value: Partial<ReviewsSettings> }>(
    `SELECT value FROM singletons WHERE key = 'reviews-settings'`,
  );
  const v = row?.value || {};
  return {
    ...DEFAULT_SETTINGS,
    ...v,
    aggregateRating: typeof v.aggregateRating === 'number' ? v.aggregateRating : null,
    reviewCount: typeof v.reviewCount === 'number' ? v.reviewCount : null,
  };
}

export async function saveReviewsSettings(value: ReviewsSettings): Promise<void> {
  await ensureSchema();
  // Normalize: an out-of-range or missing aggregate becomes null (nothing shown).
  const rating =
    typeof value.aggregateRating === 'number' && value.aggregateRating > 0 && value.aggregateRating <= 5
      ? Math.round(value.aggregateRating * 10) / 10
      : null;
  const count =
    typeof value.reviewCount === 'number' && value.reviewCount > 0 ? Math.round(value.reviewCount) : null;
  const clean: ReviewsSettings = {
    heading: value.heading?.trim() || DEFAULT_SETTINGS.heading,
    intro: value.intro?.trim() || '',
    reviewsUrl: value.reviewsUrl?.trim() || '',
    aggregateRating: rating,
    reviewCount: count,
    visible: value.visible !== false,
  };
  await query(
    `INSERT INTO singletons (key, value, updated_at) VALUES ('reviews-settings', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = now()`,
    [JSON.stringify(clean)],
  );
}

// ---------- reviews ----------
interface ReviewRow {
  id: string;
  author: string;
  role: string | null;
  rating: number;
  body: string;
  review_date: string | null;
  source: string | null;
  visible: boolean;
  sort_order: number;
}
const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  author: r.author,
  role: r.role || '',
  rating: Math.min(5, Math.max(1, r.rating || 5)),
  body: r.body,
  reviewDate: r.review_date ? String(r.review_date).slice(0, 10) : '',
  source: r.source || 'Google',
  visible: r.visible,
  sortOrder: r.sort_order,
});

/** Visible reviews for the public block, in display order. */
export async function getPublicReviews(limit = 6): Promise<Review[]> {
  if (!isDbConfigured) return [];
  await ensureSchema();
  const rows = await safeQuery<ReviewRow>(
    `SELECT * FROM reviews WHERE visible = true ORDER BY sort_order ASC, created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map(toReview);
}

/** All reviews for the admin, in order. */
export async function listReviews(): Promise<Review[]> {
  if (!isDbConfigured) return [];
  await ensureSchema();
  const rows = await safeQuery<ReviewRow>(
    `SELECT * FROM reviews ORDER BY sort_order ASC, created_at DESC`,
  );
  return rows.map(toReview);
}

export interface ReviewInput {
  id?: string;
  author: string;
  role?: string;
  rating?: number;
  body: string;
  reviewDate?: string | null;
  source?: string;
  visible?: boolean;
}

export async function saveReview(input: ReviewInput): Promise<string> {
  await ensureSchema();
  const rating = Math.min(5, Math.max(1, Math.round(input.rating || 5)));
  const date = input.reviewDate?.trim() ? input.reviewDate.trim() : null;
  if (input.id) {
    await query(
      `UPDATE reviews SET author=$2, role=$3, rating=$4, body=$5, review_date=$6, source=$7, visible=$8, updated_at=now()
       WHERE id=$1`,
      [input.id, input.author, input.role || null, rating, input.body, date, input.source || 'Google', input.visible !== false],
    );
    return input.id;
  }
  const id = randomUUID();
  const max = await queryOne<{ m: number | null }>(`SELECT max(sort_order) AS m FROM reviews`);
  const nextOrder = (max?.m ?? -1) + 1;
  await query(
    `INSERT INTO reviews (id, author, role, rating, body, review_date, source, visible, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, input.author, input.role || null, rating, input.body, date, input.source || 'Google', input.visible !== false, nextOrder],
  );
  return id;
}

export async function deleteReview(id: string): Promise<void> {
  await query(`DELETE FROM reviews WHERE id = $1`, [id]);
}

/** Persist an explicit id order (0-based). */
export async function reorderReviews(orderedIds: string[]): Promise<void> {
  await ensureSchema();
  for (let i = 0; i < orderedIds.length; i++) {
    await query(`UPDATE reviews SET sort_order=$2, updated_at=now() WHERE id=$1`, [orderedIds[i], i]);
  }
}
