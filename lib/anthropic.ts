import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { CONTACT } from './constants';
import { SERVICE_LINES, SERVICES } from './site-data';

// Real internal-link targets fed to the model so it links first mentions with
// proper paths (the publish-time auto-linker is a backstop).
const PROMPT_LINK_TARGETS = [
  ...SERVICE_LINES.map((l) => `${l.name} -> ${l.href}`),
  ...SERVICES.map((s) => `${s.name} -> /project-types/${s.slug}`),
].join('; ');

/** Per-post SEO / targeting inputs. Anything omitted is chosen editorially by
 *  the model (keywords/reader) or left to [VERIFY] (facts). */
export interface SeoInputs {
  primaryKeyword?: string;
  secondaryKeywords?: string;
  reader?: string;
  searchIntent?: string;
  length?: string;
}

/**
 * Claude-powered draft generation for the /admin console. Turns a short brief
 * plus attached images/PDFs into a structured blog post or project write-up in
 * the Mark Allan Contracting voice. Output is JSON-schema constrained so the
 * publish step can map it straight onto the Sanity document shape.
 */

export const isAnthropicConfigured = (process.env.ANTHROPIC_API_KEY || '').length > 0;

const MODEL = 'claude-opus-5';


export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  cluster: 'cost-budget' | 'process-timeline' | 'broker-pm' | 'ground-up';
  tags: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  /** Markdown body. Photos are referenced as ![caption](photo:INDEX). */
  bodyMarkdown: string;
  metaTitle: string;
  metaDescription: string;
  /** Set by the editor (AI-generated or pasted R2 cover), not by the model. */
  coverImageUrl?: string;
  /** Copy-ready caption for a Google Business Profile post; editor-managed. */
  gbpPost?: string;
}

export interface GeneratedProject {
  title: string;
  slug: string;
  clientType: string;
  scopeSummary: string;
  /** Markdown body. Photos are referenced as ![caption](photo:INDEX). */
  bodyMarkdown: string;
  timeline: string;
  squareFootage: string;
  metaTitle: string;
  metaDescription: string;
  /** Set by the editor (uploaded/generated cover), not by the model. */
  coverImageUrl?: string;
  /** One-line client quote for the card; set by the editor, not the model. */
  cardQuote?: string;
  /** Gallery photos, managed in the editor (processed URLs), not by the model. */
  imageUrls?: { url: string; alt?: string }[];
}

export type ContentType = 'post' | 'project';

const VOICE = `You are the content lead for Mark Allan Contracting (MAC / macont.com), a
commercial general contractor serving Metro Atlanta and the Southeast since 1999. You
write for OPERATORS, not developers or their reps: a franchisee, a practice owner, an
office manager, a facilities director — someone who runs a business and now has a space
that needs work.

VOICE
- Short declarative sentences. Use a one-sentence paragraph when the point deserves weight.
- Direct second person. Talk to one reader.
- Plain and useful. No marketing speak — never "solutions," "partner with us," "leverage,"
  "world-class," "seamless," "cutting-edge." No exclamation points.
- Educational first. Teach something concrete about cost, process, timeline, or how to
  work with a GC.
- 8th-grade reading level. Cut clauses, not content, to get there. If a sentence only
  makes sense to someone in construction, rewrite it or define the term inline.
- Exactly one pull-quote per post, set as a Markdown blockquote (>). Make it the sharpest
  line in the piece. Quality bar: "If you can't describe the operation in a paragraph,
  you're not ready to price a building."

MAC SERVICE BOUNDARIES — never write outside these:
- Project range: $50K-$500K.
- Work types: tenant improvements, office renovations, warehouse conversions, restaurant
  and retail buildouts.
- Geography: Georgia, Tennessee, Alabama, South Carolina. Metro Atlanta is home base.
- MAC has NOT delivered a ground-up project. Never imply ground-up capability, never write
  "we build from the ground up," never reference MAC in a site-development context.
- MAC does not self-perform trades unless the brief says so. Do not claim "our own crews"
  or "we self-perform."
- At this project size the contract is a lump-sum proposal with a scope letter. Do not
  present GMP, CM-at-Risk, or IPD as MAC's standard.
- If a topic needs content outside these boundaries, write it as neutral industry
  information with no first-person MAC claim attached.

NEVER INVENT FACTS — the [VERIFY] protocol:
- When a sentence would be stronger with a specific number, timeline, project name, client
  name, square footage, or local detail that was NOT supplied, do not invent it and do NOT
  paper over it with a vague generalization. Emit a placeholder exactly like:
    [VERIFY: permit review timeline, DeKalb County commercial TI]
    [VERIFY: name + SF of a completed warehouse conversion]
- Collect every placeholder into a "## Before publishing" list at the very end of the body.`;

const POST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', description: 'The H1 text — includes the primary keyword.' },
    slug: {
      type: 'string',
      description: 'The primary keyword, hyphenated, no stop words. Lowercase.',
    },
    excerpt: { type: 'string', description: 'One or two sentences, under 200 characters.' },
    primaryKeyword: { type: 'string', description: 'The single primary keyword the post targets.' },
    secondaryKeywords: {
      type: 'array',
      items: { type: 'string' },
      description: '3-5 secondary keyword phrases.',
    },
    cluster: {
      type: 'string',
      enum: ['cost-budget', 'process-timeline', 'broker-pm', 'ground-up'],
    },
    tags: { type: 'array', items: { type: 'string' }, description: '2-5 short tags.' },
    bodyMarkdown: {
      type: 'string',
      description:
        'The full post body in Markdown following the required skeleton. Use ## / ### headings, paragraphs, - bullet and 1. numbered lists, > blockquote (one pull-quote), a Markdown table where a comparison exists, **bold**, and [text](/path) links. Reference attached photos as ![caption](photo:INDEX).',
    },
    metaTitle: { type: 'string', description: 'Under 60 characters, includes the primary keyword.' },
    metaDescription: {
      type: 'string',
      description: '150-158 characters, includes the primary keyword.',
    },
  },
  required: [
    'title', 'slug', 'excerpt', 'primaryKeyword', 'secondaryKeywords',
    'cluster', 'tags', 'bodyMarkdown', 'metaTitle', 'metaDescription',
  ],
} as const;

const PROJECT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    slug: { type: 'string', description: 'Lowercase, hyphenated.' },
    clientType: { type: 'string', description: 'e.g. "Pilates studio", "Facility manager".' },
    scopeSummary: { type: 'string', description: 'One or two sentences describing the work.' },
    bodyMarkdown: {
      type: 'string',
      description:
        'The case study body in Markdown: use ## headings (e.g. "## The challenge", "## What we did"), paragraphs, and lists. Reference attached photos as ![caption](photo:INDEX).',
    },
    timeline: { type: 'string', description: 'Only if supplied in the brief; else empty string.' },
    squareFootage: { type: 'string', description: 'Only if supplied; else empty string.' },
    metaTitle: { type: 'string' },
    metaDescription: { type: 'string' },
  },
  required: [
    'title', 'slug', 'clientType', 'scopeSummary', 'bodyMarkdown',
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
  seo?: SeoInputs;
}): Promise<GeneratedPost | GeneratedProject> {
  const client = new Anthropic();
  const { contentType, brief, context, files = [], seo = {} } = opts;

  const isPost = contentType === 'post';
  const schema = isPost ? POST_SCHEMA : PROJECT_SCHEMA;

  const lengthGuide =
    seo.length && seo.length !== 'auto'
      ? seo.length === 'single'
        ? '700-1,000 words (single-question post)'
        : '1,200-1,600 words (process/guide post)'
      : '1,200-1,600 words for a process/guide, 700-1,000 for a single-question post — pick by the topic';

  const postInstruction = `Write a complete blog post for macont.com as Markdown (bodyMarkdown), following this exact skeleton:

1. H1 (# ) — includes the primary keyword and a benefit or tension. Headers use the words a BUYER would type, not trade jargon (e.g. "commercial build-out process," not "pre-construction"); introduce the trade term in the body.
2. Hook — 60-90 words, no throat-clearing, primary keyword inside it and within the first 100 words.
3. "## The short version" — a 5-9 bullet TL;DR (targets featured snippets and AI answers).
4. Body "## " sections, search-worded and scannable ("### " only where genuinely nested).
   - SPECIFICITY QUOTA: every H2 section contains at least one of — a number, a named item/system/document/jurisdiction, or a concrete two-sentence scenario. No section is all principle. If you can't meet it with supplied facts, emit a [VERIFY: ...].
   - The primary keyword appears in at least one H2. Secondary keywords are distributed naturally, never forced, never more than twice each.
5. At least one Markdown table wherever a comparison exists (stages, options, costs, timelines).
6. A "## Where this goes wrong" (or equivalent) mistakes section.
7. "## FAQ" — 4-6 questions phrased exactly as a person would search, each answered in 40-70 words.
8. CTA — a one-sentence soft mid-article CTA right after the section where the reader realizes they need help (inline, not a box); and a closing CTA: what to do, why now, and the phone number ${CONTACT.phone} as the primary action, said as what happens on the call and how long it takes. Never "contact us today," never "reach out."
9. "## Before publishing" — the collected [VERIFY: ...] list (omit only if there are none).

Also set: primaryKeyword, secondaryKeywords, a meta description (150-158 chars, contains the primary keyword), and a slug that IS the primary keyword (hyphenated, no stop words). Pick the single best cluster.

Internal links: link the first natural mention of a service or project type with a real Markdown link using these paths where they fit — ${PROMPT_LINK_TARGETS}. Don't stack links in the closing paragraph.

Length: ${lengthGuide}.`;

  const targeting = isPost
    ? [
        seo.primaryKeyword?.trim()
          ? `PRIMARY KEYWORD: ${seo.primaryKeyword.trim()}`
          : `PRIMARY KEYWORD: (not supplied — choose the single best phrase a buyer would search for this topic)`,
        seo.secondaryKeywords?.trim()
          ? `SECONDARY KEYWORDS: ${seo.secondaryKeywords.trim()}`
          : `SECONDARY KEYWORDS: (not supplied — choose 3-5)`,
        seo.reader?.trim()
          ? `READER: ${seo.reader.trim()}`
          : `READER: (not supplied — assume the operator described above; write to one person)`,
        seo.searchIntent?.trim() ? `SEARCH INTENT: ${seo.searchIntent.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const instruction = isPost
    ? postInstruction
    : `Write a project case study for macont.com from the brief below. Describe the client type and scope, then write the body (bodyMarkdown) as Markdown with ## headings (e.g. "## The challenge" and "## What we did"), short paragraphs, and lists. Ground every detail in the brief and attachments — do not invent specifics; use [VERIFY: ...] for any missing specific.`;

  // Attachments first (per Claude vision/PDF guidance). Label each photo with
  // its index so the model can place it inline via image blocks.
  const content: ContentBlockParam[] = [];
  let photoCount = 0;
  for (const f of files) {
    const block = fileToContentBlock(f);
    if (!block) continue;
    if (block.type === 'image') {
      content.push({ type: 'text', text: `Photo ${photoCount}:` });
      photoCount++;
    }
    content.push(block);
  }

  const photoInstruction =
    photoCount > 0
      ? `\n${photoCount} photo(s) are attached, labeled Photo 0 to Photo ${photoCount - 1} in order. ` +
        `Analyze each photo and place it in the Markdown body where it best supports the text, using ` +
        `image syntax: ![caption](photo:INDEX) — e.g. ![Open-plan office buildout](photo:0). ` +
        `Put each on its own line near the section it illustrates. Use each photo at most once, only ` +
        `where it genuinely fits. Write accurate captions from what you actually see; do not invent details.`
      : files.length
        ? `\n${files.length} file(s) are attached for reference. Use them to ground the write-up; describe only what you can actually see or read.`
        : '';

  content.push({
    type: 'text',
    text: [
      instruction,
      '',
      targeting ? `\n${targeting}` : '',
      `\nTOPIC / BRIEF:\n${brief.trim()}`,
      context?.trim()
        ? `\nFACTS SUPPLIED (the only specifics you may state as true — everything else is [VERIFY: ...]):\n${context.trim()}`
        : `\nFACTS SUPPLIED: none. State no specific numbers, names, dates, or jurisdictions as fact — use [VERIFY: ...] for each.`,
      photoInstruction,
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
