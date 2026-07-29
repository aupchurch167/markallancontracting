import 'server-only';
import { randomUUID } from 'crypto';
import { query, queryOne, ensureSchema, isDbConfigured } from './db';
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
function toPost(r: PostRow): Post {
  return {
    _id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || undefined,
    cluster: r.cluster || undefined,
    publishedAt: r.published_at || undefined,
    featured: r.featured,
    heroImageUrl: r.hero_image_url || undefined,
    tags: r.tags || [],
    bodyMarkdown: r.body_markdown || undefined,
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
    bodyMarkdown: r.body_markdown || undefined,
    timeline: r.timeline || undefined,
    squareFootage: r.square_footage || undefined,
    imageUrls: r.image_urls || undefined,
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
  const rows = await query<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`,
  );
  return rows.map(toPost);
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const row = await queryOne<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
  if (!row) return null;
  const post = toPost(row);
  const related = await query<PostRow>(
    `SELECT ${POST_COLS} FROM posts WHERE status = 'published' AND slug <> $1
       AND cluster IS NOT DISTINCT FROM $2 ORDER BY published_at DESC NULLS LAST LIMIT 2`,
    [slug, row.cluster],
  );
  post.relatedPosts = related.map(toPost);
  return post;
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    `SELECT slug FROM posts WHERE status = 'published'`,
  );
  return rows.map((r) => r.slug);
}

export async function getPublishedProjectCards(): Promise<ProjectCard[]> {
  const rows = await query<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE status = 'published' ORDER BY published_at DESC NULLS LAST`,
  );
  return rows.map(toProject);
}

export async function getFeaturedProjectCards(): Promise<ProjectCard[]> {
  const rows = await query<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE status = 'published' AND featured = true
       ORDER BY published_at DESC NULLS LAST LIMIT 3`,
  );
  return rows.map(toProject);
}

export async function getPublishedProject(slug: string): Promise<Project | null> {
  const row = await queryOne<ProjectRow>(
    `SELECT ${PROJECT_COLS} FROM projects WHERE slug = $1 AND status = 'published'`,
    [slug],
  );
  return row ? toProject(row) : null;
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const rows = await query<{ slug: string }>(
    `SELECT slug FROM projects WHERE status = 'published'`,
  );
  return rows.map((r) => r.slug);
}

export async function getHomepageValue(): Promise<HomepageMedia | null> {
  const row = await queryOne<{ value: HomepageMedia }>(
    `SELECT value FROM singletons WHERE key = 'homepage'`,
  );
  return row?.value ?? null;
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
  status: 'draft' | 'published';
}

export interface ProjectInput {
  id?: string;
  slug: string;
  title: string;
  clientType?: string;
  scopeSummary?: string;
  bodyMarkdown?: string;
  timeline?: string;
  squareFootage?: string;
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
  const publishedAt = input.status === 'published' ? new Date().toISOString() : null;
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
    `INSERT INTO projects (id, slug, title, client_type, scope_summary, body_markdown,
        timeline, square_footage, image_urls, attachments, meta_title, meta_description,
        featured, status, published_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13,$14,$15, now())
     ON CONFLICT (slug) DO UPDATE SET
        title=$3, client_type=$4, scope_summary=$5, body_markdown=$6, timeline=$7,
        square_footage=$8, image_urls=$9::jsonb, attachments=$10::jsonb, meta_title=$11,
        meta_description=$12, featured=$13, status=$14,
        published_at=COALESCE(projects.published_at, $15), updated_at=now()
     RETURNING id`,
    [
      id, input.slug, input.title, input.clientType || null, input.scopeSummary || null,
      input.bodyMarkdown || null, input.timeline || null, input.squareFootage || null,
      j(input.imageUrls || []), j(input.attachments || []), input.metaTitle || null,
      input.metaDescription || null, input.featured || false, input.status, publishedAt,
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
}

export async function listAllContent(): Promise<ContentListItem[]> {
  if (!isDbConfigured) return [];
  await ensureSchema();
  const rows = await query<ContentListItem & { updated_at: string }>(
    `SELECT id, 'post' AS type, title, slug, status, updated_at FROM posts
     UNION ALL
     SELECT id, 'project' AS type, title, slug, status, updated_at FROM projects
     ORDER BY updated_at DESC`,
  );
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    slug: r.slug,
    status: r.status,
    updatedAt: r.updated_at,
  }));
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
      coverImageUrl: r.hero_image_url || '',
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
  };
}

/** Update a post's editable fields by id, preserving hero/attachments/status. */
export async function updatePostById(fields: EditorPost): Promise<void> {
  await query(
    `UPDATE posts SET title=$2, slug=$3, excerpt=$4, cluster=$5, tags=$6::jsonb,
        primary_keyword=$7, secondary_keywords=$8::jsonb, body_markdown=$9, meta_title=$10,
        meta_description=$11, hero_image_url=COALESCE(NULLIF($12,''), hero_image_url),
        updated_at=now()
     WHERE id=$1`,
    [
      fields.id, fields.title, fields.slug, fields.excerpt || null, fields.cluster || null,
      j(fields.tags || []), fields.primaryKeyword || null, j(fields.secondaryKeywords || []),
      fields.bodyMarkdown || null, fields.metaTitle || null, fields.metaDescription || null,
      fields.coverImageUrl || '',
    ],
  );
}

/** Update a project's editable fields by id, preserving gallery/attachments/status. */
export async function updateProjectById(fields: EditorProject): Promise<void> {
  await query(
    `UPDATE projects SET title=$2, slug=$3, client_type=$4, scope_summary=$5, body_markdown=$6,
        timeline=$7, square_footage=$8, meta_title=$9, meta_description=$10, updated_at=now()
     WHERE id=$1`,
    [
      fields.id, fields.title, fields.slug, fields.clientType || null, fields.scopeSummary || null,
      fields.bodyMarkdown || null, fields.timeline || null, fields.squareFootage || null,
      fields.metaTitle || null, fields.metaDescription || null,
    ],
  );
}
