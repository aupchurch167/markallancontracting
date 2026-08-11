import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { generateGbpPost, isAnthropicConfigured } from '@/lib/anthropic';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Draft a Google Business Profile "What's new" post from the current blog post,
 * for the editor's "Draft with Claude" button. Returns plain text the user
 * copies into GBP; it does not persist anything (the editor saves it with the
 * post like any other field).
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isAnthropicConfigured) {
    return NextResponse.json(
      { error: 'Generation is not configured. Set ANTHROPIC_API_KEY in the environment.' },
      { status: 503 },
    );
  }

  let body: { title?: string; excerpt?: string; bodyMarkdown?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const title = String(body.title || '').trim();
  if (!title) {
    return NextResponse.json({ error: 'Add a title first so Claude has something to work from.' }, { status: 400 });
  }

  try {
    const post = await generateGbpPost({
      title,
      excerpt: String(body.excerpt || ''),
      bodyMarkdown: String(body.bodyMarkdown || ''),
    });
    return NextResponse.json({ post });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json({ error: `Claude API error: ${err.message}` }, { status });
    }
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
