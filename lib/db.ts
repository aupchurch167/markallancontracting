import 'server-only';
import { Pool } from 'pg';

/**
 * Postgres connection (Railway). DATABASE_URL is injected by Railway when you
 * attach a Postgres service. When it's absent, the whole content layer falls
 * back to the shipped editorial content, so the site still builds and renders.
 *
 * Use Railway's PRIVATE url (…​.railway.internal) in production — no SSL needed.
 * The public proxy url needs SSL; set PGSSLMODE=require (or ?sslmode=require).
 */

const url = process.env.DATABASE_URL || '';
export const isDbConfigured = url.length > 0;

const needsSsl = /sslmode=require/.test(url) || process.env.PGSSLMODE === 'require';

let pool: Pool | null = null;
function getPool(): Pool | null {
  if (!isDbConfigured) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

/** Run a query, returning rows. Returns [] when the DB isn't configured. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  const res = await p.query(text, params);
  return res.rows as T[];
}

/** Run a query, returning the first row or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Read-only query that never throws — on any error (notably: the DB is
 * unreachable at BUILD time, when Railway's private host isn't resolvable) it
 * logs and returns []. Public content reads use this so the build and render
 * fall back to shipped content instead of crashing. Writes use the strict
 * query()/queryOne() so failures surface to the admin.
 */
export async function safeQuery<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  try {
    return await query<T>(text, params);
  } catch (err) {
    console.warn('[db] read failed, using fallback:', (err as Error).message);
    return [];
  }
}

export async function safeQueryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await safeQuery<T>(text, params);
  return rows[0] ?? null;
}

const DDL = `
CREATE TABLE IF NOT EXISTS posts (
  id                 TEXT PRIMARY KEY,
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  excerpt            TEXT,
  cluster            TEXT,
  tags               JSONB DEFAULT '[]'::jsonb,
  primary_keyword    TEXT,
  secondary_keywords JSONB DEFAULT '[]'::jsonb,
  body_markdown      TEXT,
  hero_image_url     TEXT,
  meta_title         TEXT,
  meta_description   TEXT,
  attachments        JSONB DEFAULT '[]'::jsonb,
  featured           BOOLEAN DEFAULT false,
  status             TEXT NOT NULL DEFAULT 'draft',
  published_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id               TEXT PRIMARY KEY,
  slug             TEXT UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  client_type      TEXT,
  city_name        TEXT,
  city_state       TEXT,
  service_slug     TEXT,
  scope_summary    TEXT,
  body_markdown    TEXT,
  timeline         TEXT,
  square_footage   TEXT,
  hero_image_url   TEXT,
  image_urls       JSONB DEFAULT '[]'::jsonb,
  attachments      JSONB DEFAULT '[]'::jsonb,
  testimonial      JSONB,
  highlights       JSONB DEFAULT '[]'::jsonb,
  completed_date   DATE,
  meta_title       TEXT,
  meta_description TEXT,
  featured         BOOLEAN DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'draft',
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS singletons (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

let schemaReady: Promise<void> | null = null;
/** Create tables if they don't exist. Idempotent; runs at most once per process. */
export async function ensureSchema(): Promise<void> {
  const p = getPool();
  if (!p) return;
  if (!schemaReady) {
    schemaReady = p.query(DDL).then(() => undefined);
  }
  return schemaReady;
}
