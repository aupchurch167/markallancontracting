import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Repo copy of three Insights posts whose live text is stored in Postgres
 * (`posts.body_markdown`). These files are what the site renders when that
 * row is missing. A published database row still wins; nothing here writes
 * to the database.
 */
const DIR = join(process.cwd(), 'content/insights');

export function readRepoInsight(slug: string): string {
  return readFileSync(join(DIR, `${slug}.md`), 'utf8').trim();
}
