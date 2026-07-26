import { getPosts } from '@/lib/queries';
import { FALLBACK_POSTS } from '@/lib/fallback-insights';
import { SITE } from '@/lib/constants';

export const dynamic = 'force-static';

function esc(s = ''): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** RSS 2.0 feed for /insights — Sanity posts merged over the authored fallback. */
export async function GET() {
  const sanity = await getPosts();
  const seen = new Set(sanity.map((p) => p.slug));
  const items = [
    ...sanity.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      author: p.author?.name,
      publishedAt: p.publishedAt,
    })),
    ...FALLBACK_POSTS.filter((p) => !seen.has(p.slug)).map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      author: p.author,
      publishedAt: p.publishedAt,
    })),
  ].sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} — Insights</title>
    <link>${SITE.url}/insights</link>
    <description>Straight answers on commercial construction cost, timeline, and process.</description>
    <language>en-us</language>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (i) => `    <item>
      <title>${esc(i.title)}</title>
      <link>${SITE.url}/insights/${i.slug}</link>
      <guid isPermaLink="true">${SITE.url}/insights/${i.slug}</guid>
      ${i.author ? `<author>${esc(i.author)}</author>` : ''}
      ${i.publishedAt ? `<pubDate>${new Date(i.publishedAt).toUTCString()}</pubDate>` : ''}
      <description>${esc(i.excerpt)}</description>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
