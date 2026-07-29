import 'server-only';
import { randomUUID } from 'crypto';
import { query, queryOne, safeQuery, safeQueryOne, ensureSchema, isDbConfigured } from './db';
import type { Attachment, Post, PostCard, Project, ProjectCard } from './types';
import type { HomepageMedia } from './homepage-media';

/**
 * The content layer for the custom CMS. Reads return published rows from
 * Postgres (or nothing, so the page falls back to shipped editorial content);
 * writes are used by the /admin console. All functions no-op safely when the
 * database isn't configured.
 */

// ---------- row shapes ----------
interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cluster: string | null;
  tags: string[] | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  body_markdown: string | null;
  hero_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  attachments: Attachment[] | null;
  featured: boolean;
  status: string;
  published_at: string | null;
}

interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  client_type: string | null;
  city_name: string | null;
  city_state: string | null;
  service_slug: string | null;
  scope_summary: string | null;
  body_markdown: string | null;
  timeline: string | null;
  square_footage: string | null;
  hero_image_url: string | null;
  image_urls: { url: string; alt?: string }[] | null;
  attachments: Attachment[] | null;
  testimonial: { quote?: string; attribution?: string; role?: string } | null;
  highlights: { value: string; label: string }[] | null;
  completed_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured: boolean;
  status: string;
  published_at: string | null;
}

// ---------- mappers ----------
/**
 * Repair URLs saved while S3_PUBLIC_URL was misconfigured — a "NAME=" prefix
 * (from pasting a whole .env line) and/or a stray path segment on an r2.dev URL
 * (e.g. …r2.dev/the-joy/covers/… when the object is really at …r2.dev/covers/…).
 * Objects always live under one of these key prefixes, so anything before the
 * first known prefix on an r2.dev host is dropped. No-op for valid URLs.
 */
const R2_KEY_PREFIXES = ['covers', 'insights', 'projects', 'home', 'admin'];
function cleanUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  let s = u.replace(/^[A-Za-z0-9_]+=(?=https?:\/\/)/, ''); // strip a "NAME=" prefix
  try {
    const url = new URL(s);
    if (url.hostname.endsWith('.r2.dev')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => R2_KEY_PREFIXES.includes(p));
      if (idx > 0) s = `${url.origin}/${parts.slice(idx).join('/')}`;
    }
  } catch {
    /* not a URL — leave as-is */
  }
  return s;
}
function cleanMd(md?: string | null): string | undefined {
  if (!md) return undefined;
  return md
    .replace(/\]\([A-Za-z0-9_]+=(https?:\/\/)/g, ']($1')
    .replace(/\]\((https?:\/\/[^)\s]+)\)/g, (_m, url) => `](${cleanUrl(url) || url})`);
}

function toPost(r: PostRow): Post {
  return {
    _id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || undefined,
    cluster: r.cluster || undefined,
    publishedAt: r.published_at || undefined,
    featured: r.featured,
    heroImageUrl: cleanUrl(r.hero_image_url),
    tags: r.tags || [],
    bodyMarkdown: cleanMd(r.body_markdown),
    metaTitle: r.meta_title || undefined,
    metaDescription: r.meta_description || undefined,
    attachments: r.attachments || [],
  };
}

function toProject(r: ProjectRow): Project {
  return {
    _id: r.id,
    title: r.title,
    slug: r.slug,
    clientType: r.client_type || undefined,
    cityName: r.city_name || undefined,
    cityState: r.city_state || undefined,
    serviceSlug: r.service_slug || undefined,
    scopeSummary: r.scope_summary || undefined,
    heroImageUrl: cleanUrl(r.hero_image_url),
    bodyMarkdown: cleanMd(r.body_markdown),
    timeline: r.timeline || undefined,
    squareFootage: r.square_footage || undefined,
    imageUrls: r.image_urls
      ? r.image_urls.map((im) => ({ url: cleanUrl(im.url) || im.url, alt: im.alt }))
      : undefined,
    attachments: r.attachments || undefined,
    testimonial: r.testimonial || undefined,
    highlights: r.highlights || undefined,
    completedDate: r.completed_date || undefined,
    status: r.status,
  };
}

const POST_COLS = `id, slug, title, excerpt, cluster, tags, primary_keyword, secondary_keywords,
  body_markdown, hero_image_url, meta_title, meta_description, attachments, featured, status, published_at`;
const PROJECT_COLS = `id, slug, title, client_type, city_name, city_state, service_slug, scope_summary,
  body_markdown, timeline, square_footage, hero_image_url, image_urls, attachments, testimonial,
  highlights, completed_date, meta_title, meta_description, featured, status, published_at`;

// ---------- public reads ----------
export async function getPublishedPostCards(): Promise<PostCard[]> {
  const rows = await safeQuery<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`,
  );
  return rows.map(toPost);
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const row = await safeQueryOne<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
  if (!row) return null;
  const post = toPost(row);
  const related = await safeQuery<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE status = 'published' AND slug <> $1
       AND cluster IS NOT DISTINCT FROM $2 ORDER BY published_at DESC NULLS LAST LIMIT 2`,
    [slug, row.cluster],
  );
  post.relatedPosts = related.map(toPost);
  return post;
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  const rows = await safeQuery<{ slug: string }>(
    `SELECT slug FROM posts WHERE status = 'published'`,
  );
  return rows.map((r) => r.slug);
}

export async function getPublishedProjectCards(): Promise<ProjectCard[]> {
  const rows = await safeQuery<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`,
  );
  return rows.map(toProject);
}

export async function getFeaturedProjectCards(): Promise<ProjectCard[]> {
  const rows = await safeQuery<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE status = 'published' AND featured = true
       ORDER BY published_at DESC NULLS LAST LIMIT 3`,
  );
  return rows.map(toProject);
}

export async function getPublishedProject(slug: string): Promise<Project | null> {
  const row = await safeQueryOne<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
  return row ? toProject(row) : null;
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const rows = await safeQuery<{ slug: string }>(
    `SELECT slug FROM projects WHERE status = 'published'`,
  );
  return rows.map((r) => r.slug);
}

export async function getHomepageValue(): Promise<HomepageMedia | null> {
  const row = await safeQueryOne<{ value: HomepageMedia }>(
    `SELECT value FROM singletons WHERE key = 'homepage'`,
  );
  const v = row?.value;
  if (!v) return null;
  const slot = (s: { url: string; alt: string }) => ({ url: cleanUrl(s.url) || s.url, alt: s.alt });
  return {
    hero: slot(v.hero),
    about: slot(v.about),
    gallery: (v.gallery || []).map(slot),
  };
}

// ---------- admin writes ----------
export interface PostInput {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  cluster?: string;
  tags?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  bodyMarkdown?: string;
  heroImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  attachments?: Attachment[];
  featured?: boolean;
  /** Preserve an original publish date (used when importing existing posts). */
  publishedAt?: string;
  status: 'draft' | 'published';
}

export interface ProjectInput {
  id?: string;
  slug: string;
  title: string;
  clientType?: string;
  cityName?: string;
  cityState?: string;
  serviceSlug?: string;
  scopeSummary?: string;
  bodyMarkdown?: string;
  timeline?: string;
  squareFootage?: string;
  heroImageUrl?: string;
  imageUrls?: { url: string; alt?: string }[];
  attachments?: Attachment[];
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  status: 'draft' | 'published';
}

const j = (v: unknown) => JSON.stringify(v ?? null);

/** Insert or update a post by slug. Returns its id. */
export async function savePost(input: PostInput): Promise<string> {
  await ensureSchema();
  const id = input.id || randomUUID();
  const publishedAt =
    input.status === 'published' ? input.publishedAt || new Date().toISOString() : null;
  const row = await queryOne<{ id: string }>(
    `INSERT INTO posts (id, slug, title, excerpt, cluster, tags, primary_keyword,
        secondary_keywords, body_markdown, hero_image_url, meta_title, meta_description,
        attachments, featured, status, published_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb,$9,$10,$11,$12,$13::jsonb,$14,$15,$16, now())
     ON CONFLICT (slug) DO UPDATE SET
        title=$3, excerpt=$4, cluster=$5, tags=$6::jsonb, primary_keyword=$7,
        secondary_keywords=$8::jsonb, body_markdown=$9, hero_image_url=$10, meta_title=$11,
        meta_description=$12, attachments=$13::jsonb, featured=$14, status=$15,
        published_at=COALESCE(posts.published_at, $16), updated_at=now()
     RETURNING id`,
    [
      id, input.slug, input.title, input.excerpt || null, input.cluster || null,
      j(input.tags || []), input.primaryKeyword || null, j(input.secondaryKeywords || []),
      input.bodyMarkdown || null, input.heroImageUrl || null, input.metaTitle || null,
      input.metaDescription || null, j(input.attachments || []), input.featured || false,
      input.status, publishedAt,
    ],
  );
  return row?.id || id;
}

/** Insert or update a project by slug. Returns its id. */
export async function saveProject(input: ProjectInput): Promise<string> {
  await ensureSchema();
  const id = input.id || randomUUID();
  const publishedAt = input.status === 'published' ? new Date().toISOString() : null;
  const row = await queryOne<{ id: string }>(
    `INSERT INTO projects (id, slug, title, client_type, city_name, city_state, service_slug,
        scope_summary, body_markdown, timeline, square_footage, hero_image_url, image_urls,
        attachments, meta_title, meta_description, featured, status, published_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15,$16,$17,$18,$19, now())
     ON CONFLICT (slug) DO UPDATE SET
        title=$3, client_type=$4,
        city_name=COALESCE($5, projects.city_name),
        city_state=COALESCE($6, projects.city_state),
        service_slug=COALESCE($7, projects.service_slug),
        scope_summary=$8, body_markdown=$9, timeline=$10,
        square_footage=$11, hero_image_url=COALESCE(NULLIF($12,''), projects.hero_image_url),
        image_urls=$13::jsonb, attachments=$14::jsonb, meta_title=$15,
        meta_description=$16, featured=$17, status=$18,
        published_at=COALESCE(projects.published_at, $19), updated_at=now()
     RETURNING id`,
    [
      id, input.slug, input.title, input.clientType || null,
      input.cityName || null, input.cityState || null, input.serviceSlug || null,
      input.scopeSummary || null, input.bodyMarkdown || null, input.timeline || null,
      input.squareFootage || null, input.heroImageUrl || '', j(input.imageUrls || []),
      j(input.attachments || []), input.metaTitle || null, input.metaDescription || null,
      input.featured || false, input.status, publishedAt,
    ],
  );
  return row?.id || id;
}

export async function saveHomepage(value: HomepageMedia): Promise<void> {
  await ensureSchema();
  await query(
    `INSERT INTO singletons (key, value, updated_at) VALUES ('homepage', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = now()`,
    [j(value)],
  );
}

// ---------- admin management ----------
export interface ContentListItem {
  id: string;
  type: 'post' | 'project';
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  /** Cover/header image, for the Manage list and dashboard thumbnails. */
  heroImageUrl?: string;
}

export async function listAllContent(): Promise<ContentListItem[]> {
  if (!isDbConfigured) return [];
  await ensureSchema();
  const rows = await query<{
    id: string;
    type: 'post' | 'project';
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    hero_image_url: string | null;
  }>(
    `SELECT id, 'post' AS type, title, slug, status, updated_at, hero_image_url FROM posts
     UNION ALL
     SELECT id, 'project' AS type, title, slug, status, updated_at, hero_image_url FROM projects
     ORDER BY updated_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    slug: r.slug,
    status: r.status,
    updatedAt: r.updated_at,
    heroImageUrl: cleanUrl(r.hero_image_url),
  }));
}

/** Slugs already stored in the CMS, by type — used to skip on import. */
export async function getExistingSlugs(): Promise<{ posts: Set<string>; projects: Set<string> }> {
  await ensureSchema();
  const [posts, projects] = await Promise.all([
    query<{ slug: string }>(`SELECT slug FROM posts`),
    query<{ slug: string }>(`SELECT slug FROM projects`),
  ]);
  return {
    posts: new Set(posts.map((r) => r.slug)),
    projects: new Set(projects.map((r) => r.slug)),
  };
}

export async function getPostForEdit(id: string): Promise<Post | null> {
  const row = await queryOne<PostRow>(`SELECT ${POST_COLS} FROM posts WHERE id = $1`, [id]);
  return row ? toPost(row) : null;
}

export async function getProjectForEdit(id: string): Promise<Project | null> {
  const row = await queryOne<ProjectRow>(`SELECT ${PROJECT_COLS} FROM projects WHERE id = $1`, [id]);
  return row ? toProject(row) : null;
}

export async function setStatus(
  type: 'post' | 'project',
  id: string,
  status: 'draft' | 'published',
): Promise<void> {
  const table = type === 'post' ? 'posts' : 'projects';
  const pubClause = status === 'published' ? 'COALESCE(published_at, now())' : 'published_at';
  await query(
    `UPDATE ${table} SET status = $2, published_at = ${pubClause}, updated_at = now() WHERE id = $1`,
    [id, status],
  );
}

export async function deleteItem(type: 'post' | 'project', id: string): Promise<void> {
  const table = type === 'post' ? 'posts' : 'projects';
  await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

// ---------- editor load/update (preserves media not touched by the editor) ----------
export interface EditorPost {
  id: string;
  contentType: 'post';
  title: string;
  slug: string;
  excerpt: string;
  cluster: string;
  tags: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  bodyMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string;
  status: string;
}
export interface EditorProject {
  id: string;
  contentType: 'project';
  title: string;
  slug: string;
  clientType: string;
  scopeSummary: string;
  bodyMarkdown: string;
  timeline: string;
  squareFootage: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl: string;
  status: string;
}

export async function getEditorContent(
  type: 'post' | 'project',
  id: string,
): Promise<EditorPost | EditorProject | null> {
  if (type === 'post') {
    const r = await queryOne<PostRow>(`SELECT ${POST_COLS} FROM posts WHERE id = $1`, [id]);
    if (!r) return null;
    return {
      id: r.id,
      contentType: 'post',
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt || '',
      cluster: r.cluster || '',
      tags: r.tags || [],
      primaryKeyword: r.primary_keyword || '',
      secondaryKeywords: r.secondary_keywords || [],
      bodyMarkdown: r.body_markdown || '',
      metaTitle: r.meta_title || '',
      metaDescription: r.meta_description || '',
      coverImageUrl: cleanUrl(r.hero_image_url) || '',
      status: r.status,
    };
  }
  const r = await queryOne<ProjectRow>(`SELECT ${PROJECT_COLS} FROM projects WHERE id = $1`, [id]);
  if (!r) return null;
  return {
    id: r.id,
    contentType: 'project',
    title: r.title,
    slug: r.slug,
    clientType: r.client_type || '',
    scopeSummary: r.scope_summary || '',
    bodyMarkdown: r.body_markdown || '',
    timeline: r.timeline || '',
    squareFootage: r.square_footage || '',
    metaTitle: r.meta_title || '',
    metaDescription: r.meta_description || '',
    coverImageUrl: cleanUrl(r.hero_image_url) || '',
    status: r.status,
  };
}

/**
 * Update a post's editable fields by id. Hero/status are preserved; newly
 * uploaded attachments (from editing) are appended to the existing list.
 */
export async function updatePostById(
  fields: EditorPost,
  appendAttachments: Attachment[] = [],
): Promise<void> {
  // The editor always sends the authoritative cover (empty = intentionally
  // cleared), so set it directly rather than COALESCE — otherwise a replaced or
  // removed cover silently keeps the old value.
  await query(
    `UPDATE posts SET title=$2, slug=$3, excerpt=$4, cluster=$5, tags=$6::jsonb,
        primary_keyword=$7, secondary_keywords=$8::jsonb, body_markdown=$9, meta_title=$10,
        meta_description=$11, hero_image_url=$12,
        attachments=COALESCE(attachments,'[]'::jsonb) || $13::jsonb, updated_at=now()
     WHERE id=$1`,
    [
      fields.id, fields.title, fields.slug, fields.excerpt || null, fields.cluster || null,
      j(fields.tags || []), fields.primaryKeyword || null, j(fields.secondaryKeywords || []),
      fields.bodyMarkdown || null, fields.metaTitle || null, fields.metaDescription || null,
      fields.coverImageUrl || null, j(appendAttachments),
    ],
  );
}

/**
 * Update a project's editable fields by id. Status is preserved; newly uploaded
 * gallery photos and attachments are appended to the existing lists.
 */
export async function updateProjectById(
  fields: EditorProject,
  appendImageUrls: { url: string; alt?: string }[] = [],
  appendAttachments: Attachment[] = [],
): Promise<void> {
  // Cover set directly (editor sends the authoritative value; empty = cleared).
  await query(
    `UPDATE projects SET title=$2, slug=$3, client_type=$4, scope_summary=$5, body_markdown=$6,
        timeline=$7, square_footage=$8, meta_title=$9, meta_description=$10,
        hero_image_url=$13,
        image_urls=COALESCE(image_urls,'[]'::jsonb) || $11::jsonb,
        attachments=COALESCE(attachments,'[]'::jsonb) || $12::jsonb, updated_at=now()
     WHERE id=$1`,
    [
      fields.id, fields.title, fields.slug, fields.clientType || null, fields.scopeSummary || null,
      fields.bodyMarkdown || null, fields.timeline || null, fields.squareFootage || null,
      fields.metaTitle || null, fields.metaDescription || null,
      j(appendImageUrls), j(appendAttachments), fields.coverImageUrl || null,
    ],
  );
}
