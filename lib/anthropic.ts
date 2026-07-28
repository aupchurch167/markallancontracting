import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude-powered draft generation for the /admin console. Turns a short brief
 * plus attached images/PDFs into a structured blog post or project write-up in
 * the Mark Allan Contracting voice. Output is JSON-schema constrained so the
 * publish step can map it straight onto the Sanity document shape.
 */

export const isAnthropicConfigured = (process.env.ANTHROPIC_API_KEY || '').length > 0;

const MODEL = 'claude-opus-5';

/** A single rich-text block in the generated body. Maps 1:1 to Portable Text. */
export type GenBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbers'; items: string[] };

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  cluster: 'cost-budget' | 'process-timeline' | 'broker-pm' | 'ground-up';
  tags: string[];
  body: GenBlock[];
  metaTitle: string;
  metaDescription: string;
  /** Set by the editor (AI-generated or pasted R2 cover), not by the model. */
  coverImageUrl?: string;
}

export interface GeneratedProject {
  title: string;
  slug: string;
  clientType: string;
  scopeSummary: string;
  challenge: GenBlock[];
  solution: GenBlock[];
  timeline: string;
  squareFootage: string;
  metaTitle: string;
  metaDescription: string;
}

export type ContentType = 'post' | 'project';

const VOICE = `You are the content lead for Mark Allan Contracting (macont.com), a commercial
general contractor serving Metro Atlanta and the Southeast since 1999. The audience is
commercial property owners, tenants, brokers, and facility managers — not homeowners.

Voice:
- Plain, direct, and useful. Write like an experienced builder explaining how the work
  actually goes, not like marketing copy.
- Educational first. Every piece should teach the reader something concrete about cost,
  process, timeline, or how to work with a GC.
- Never invent specific dollar figures, dates, client names, square footages, or
  credentials that were not supplied in the brief or attachments. If a fact is not given,
  write around it rather than fabricating it.
- No hype adjectives ("world-class", "cutting-edge"), no exclamation points.
- Short paragraphs. Use headings to structure. Prefer specifics over generalities.`;

const BLOCK_SCHEMA = {
  type: 'array',
  description: 'Ordered rich-text blocks.',
  items: {
    type: 'object',
    additionalProperties: false,
    properties: {
      type: {
        type: 'string',
        enum: ['heading', 'subheading', 'paragraph', 'quote', 'bullets', 'numbers'],
      },
      text: { type: 'string', description: 'Used for heading/subheading/paragraph/quote.' },
      items: {
        type: 'array',
        items: { type: 'string' },
        description: 'Used for bullets/numbers.',
      },
    },
    required: ['type'],
  },
} as const;

const POST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    slug: { type: 'string', description: 'Lowercase, hyphenated, no leading/trailing hyphen.' },
    excerpt: { type: 'string', description: 'One or two sentences, under 200 characters.' },
    cluster: {
      type: 'string',
      enum: ['cost-budget', 'process-timeline', 'broker-pm', 'ground-up'],
    },
    tags: { type: 'array', items: { type: 'string' }, description: '2-5 short tags.' },
    body: BLOCK_SCHEMA,
    metaTitle: { type: 'string', description: 'Under 60 characters.' },
    metaDescription: { type: 'string', description: 'Under 160 characters.' },
  },
  required: ['title', 'slug', 'excerpt', 'cluster', 'tags', 'body', 'metaTitle', 'metaDescription'],
} as const;

const PROJECT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    slug: { type: 'string', description: 'Lowercase, hyphenated.' },
    clientType: { type: 'string', description: 'e.g. "Pilates studio", "Facility manager".' },
    scopeSummary: { type: 'string', description: 'One or two sentences describing the work.' },
    challenge: BLOCK_SCHEMA,
    solution: BLOCK_SCHEMA,
    timeline: { type: 'string', description: 'Only if supplied in the brief; else empty string.' },
    squareFootage: { type: 'string', description: 'Only if supplied; else empty string.' },
    metaTitle: { type: 'string' },
    metaDescription: { type: 'string' },
  },
  required: [
    'title', 'slug', 'clientType', 'scopeSummary', 'challenge', 'solution',
    'timeline', 'squareFootage', 'metaTitle', 'metaDescription',
  ],
} as const;

export interface AttachedFile {
  /** MIME type, e.g. image/jpeg or application/pdf. */
  mediaType: string;
  /** Base64-encoded file bytes. */
  data: string;
}

type ContentBlockParam = Anthropic.Messages.ContentBlockParam;

function fileToContentBlock(file: AttachedFile): ContentBlockParam | null {
  if (file.mediaType === 'application/pdf') {
    return {
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: file.data },
    };
  }
  if (file.mediaType.startsWith('image/')) {
    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: file.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        data: file.data,
      },
    };
  }
  return null;
}

/**
 * Generate a structured draft. Throws Anthropic SDK errors (caught by the route
 * and turned into a clean message) — the caller checks isAnthropicConfigured
 * first.
 */
export async function generateContent(opts: {
  contentType: ContentType;
  brief: string;
  context?: string;
  files?: AttachedFile[];
}): Promise<GeneratedPost | GeneratedProject> {
  const client = new Anthropic();
  const { contentType, brief, context, files = [] } = opts;

  const isPost = contentType === 'post';
  const schema = isPost ? POST_SCHEMA : PROJECT_SCHEMA;

  const instruction = isPost
    ? `Write a complete insight/blog post for macont.com from the brief below. Pick the single best cluster. Structure the body with headings, short paragraphs, and lists where they help. Aim for 500-900 words.`
    : `Write a project case study for macont.com from the brief below. Describe the client type, scope, the challenge, and how Mark Allan Contracting solved it. Ground every detail in the brief and attachments — do not invent specifics. Keep challenge and solution to a few blocks each.`;

  // Attachments first, then the text instruction (per Claude vision/PDF guidance).
  const content: ContentBlockParam[] = [];
  for (const f of files) {
    const block = fileToContentBlock(f);
    if (block) content.push(block);
  }
  content.push({
    type: 'text',
    text: [
      instruction,
      '',
      `BRIEF:\n${brief.trim()}`,
      context?.trim() ? `\nADDITIONAL CONTEXT:\n${context.trim()}` : '',
      files.length
        ? `\n${files.length} file(s) are attached above for reference. Use them to ground the write-up; describe only what you can actually see or read.`
        : '',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  return runStructured(client, schema, VOICE, content);
}

/**
 * Shared structured call: forces JSON-schema output, guards against a truncated
 * (max_tokens) reply, and parses. Accepts a plain string or content blocks.
 */
async function runStructured(
  client: Anthropic,
  schema: Record<string, unknown>,
  system: string,
  content: string | ContentBlockParam[],
): Promise<GeneratedPost | GeneratedProject> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system,
    output_config: { format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content }],
  });

  if (message.stop_reason === 'max_tokens') {
    throw new Error('The draft got cut off before it finished. Shorten the brief and try again.');
  }

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  if (!text) throw new Error('The model returned no content. Try again or adjust the input.');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The model returned malformed content. Try again.');
  }
}

/**
 * Refine an existing draft per editor instructions (tone + notes), returning the
 * full revised object in the same shape so the editor can swap it in. Grounded
 * on the current draft — it does not invent new facts.
 */
export async function refineContent(opts: {
  contentType: ContentType;
  current: GeneratedPost | GeneratedProject;
  tone?: string;
  notes?: string;
}): Promise<GeneratedPost | GeneratedProject> {
  const client = new Anthropic();
  const { contentType, current, tone, notes } = opts;
  const schema = contentType === 'post' ? POST_SCHEMA : PROJECT_SCHEMA;

  const userText = [
    `Revise the following ${contentType === 'post' ? 'blog post' : 'project case study'} for macont.com.`,
    'Keep it accurate — do not introduce facts, figures, names, or dates that are not already present.',
    tone?.trim() ? `Desired tone: ${tone.trim()}.` : '',
    notes?.trim()
      ? `Editor notes: ${notes.trim()}`
      : 'Tighten and sharpen the writing while preserving the meaning and structure.',
    '',
    'CURRENT DRAFT (JSON):',
    JSON.stringify(current),
    '',
    'Return the complete revised object.',
  ]
    .filter(Boolean)
    .join('\n');

  return runStructured(client, schema, VOICE, userText);
}
