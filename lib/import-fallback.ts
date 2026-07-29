import 'server-only';
import { FALLBACK_PROJECTS } from './fallback-projects';
import { FALLBACK_POSTS, type Block } from './fallback-insights';
import { savePost, saveProject, getExistingSlugs } from './content';

/**
 * One-time migration of the shipped fallback content (the "old" projects and
 * blog posts that render before anything is authored) into the Postgres CMS,
 * so they show up in the Manage tab and can be edited like anything else.
 *
 * Existing slugs are skipped — this never overwrites content already in the
 * database, so it's safe to run more than once.
 */

/** Render a fallback post's block body to Markdown. */
function blocksToMarkdown(blocks: Block[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if ('h2' in b) parts.push(`## ${b.h2}`);
    else if ('p' in b) parts.push(b.p);
    else if ('ul' in b) parts.push(b.ul.map((li) => `- ${li}`).join('\n'));
    else if ('ol' in b) parts.push(b.ol.map((li, i) => `${i + 1}. ${li}`).join('\n'));
  }
  return parts.join('\n\n');
}

/** Render a fallback project's challenge/solution to a Markdown body. */
function projectToMarkdown(challenge: string[], solution: string[]): string {
  const parts: string[] = [];
  if (challenge.length) {
    parts.push('## The challenge', ...challenge);
  }
  if (solution.length) {
    parts.push('## What we did', ...solution);
  }
  return parts.join('\n\n');
}

export interface ImportResult {
  posts: { imported: string[]; skipped: string[] };
  projects: { imported: string[]; skipped: string[] };
}

export async function importFallbackContent(): Promise<ImportResult> {
  const existing = await getExistingSlugs();
  const result: ImportResult = {
    posts: { imported: [], skipped: [] },
    projects: { imported: [], skipped: [] },
  };

  for (const p of FALLBACK_POSTS) {
    if (existing.posts.has(p.slug)) {
      result.posts.skipped.push(p.slug);
      continue;
    }
    await savePost({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      cluster: p.cluster,
      bodyMarkdown: blocksToMarkdown(p.body),
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      publishedAt: p.publishedAt,
      status: 'published',
    });
    result.posts.imported.push(p.slug);
  }

  for (const pr of FALLBACK_PROJECTS) {
    if (existing.projects.has(pr.slug)) {
      result.projects.skipped.push(pr.slug);
      continue;
    }
    await saveProject({
      slug: pr.slug,
      title: pr.title,
      clientType: pr.clientType,
      cityName: pr.cityName,
      cityState: pr.cityState,
      serviceSlug: pr.serviceSlug,
      scopeSummary: pr.scopeSummary,
      bodyMarkdown: projectToMarkdown(pr.challenge, pr.solution),
      timeline: pr.timeline,
      imageUrls: pr.images,
      featured: pr.featured,
      status: 'published',
    });
    result.projects.imported.push(pr.slug);
  }

  return result;
}
