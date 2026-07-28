import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  refineContent,
  isAnthropicConfigured,
  type ContentType,
  type GeneratedPost,
  type GeneratedProject,
} from '@/lib/anthropic';
import { requireAdmin } from '@/lib/admin-guard';

export const runtime = 'nodejs';
export const maxDuration = 120;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isAnthropicConfigured) {
    return NextResponse.json(
      { error: 'Refine is not configured. Set ANTHROPIC_API_KEY in the environment.' },
      { status: 503 },
    );
  }

  let body: {
    contentType?: ContentType;
    content?: GeneratedPost | GeneratedProject;
    tone?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 400 });
  }

  const { contentType, content, tone, notes } = body;
  if (contentType !== 'post' && contentType !== 'project') {
    return NextResponse.json({ error: 'Invalid content type.' }, { status: 400 });
  }
  if (!content || !content.title) {
    return NextResponse.json({ error: 'No draft to refine.' }, { status: 400 });
  }

  try {
    const revised = await refineContent({ contentType, current: content, tone, notes });
    return NextResponse.json({ content: revised });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json({ error: `Claude API error: ${err.message}` }, { status });
    }
    const message = err instanceof Error ? err.message : 'Refine failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
