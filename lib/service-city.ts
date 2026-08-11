import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { getService } from './site-data';
import { SERVICE_CITY_SYSTEM_PROMPT } from './service-city-prompt';

/**
 * ServiceCity page builder pipeline (spec 09): facts in, copy out — never the
 * reverse. validateFacts → generateCityCopy → lintCopy. The route wires these
 * together, uploads the photo, and writes a DRAFT only. No publish path here.
 */

export const isAnthropicConfigured = (process.env.ANTHROPIC_API_KEY || '').length > 0;

// The spec pins generation to "current Sonnet".
const MODEL = 'claude-sonnet-5';

export interface CityFacts {
  service: string; // service document slug
  city: string;
  state: string;
  county: string;
  project: {
    clientNameable: boolean;
    clientName?: string;
    descriptor?: string;
    year: number;
    sqft?: number;
    scope: string[];
    photoAlt?: string;
    refSlug?: string; // related /projects/[slug], if any
  };
  jurisdiction: { notes: string };
}

export interface GeneratedCity {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  projectBody: string;
  jurisdictionBody: string;
  ctaLine: string;
}

// ---------- [1] validate ----------
/**
 * Mechanical gate. Returns the list of missing/invalid field names; empty =
 * valid. Photo presence and the published-duplicate check are enforced in the
 * route (they need the request + DB). "No page without a project" lives here as
 * a tooling-layer duplicate of the schema gate — both stay.
 */
export function validateFacts(f: Partial<CityFacts> | null | undefined): string[] {
  const missing: string[] = [];
  if (!f) return ['facts (empty)'];

  if (!f.service?.trim()) missing.push('service');
  else if (!getService(f.service.trim())) missing.push('service (unknown slug — must match a service)');
  if (!f.city?.trim()) missing.push('city');
  if (!f.state?.trim()) missing.push('state');
  if (!f.county?.trim()) missing.push('county');

  const p = f.project;
  if (!p) {
    missing.push('project');
  } else {
    if (!p.year || Number.isNaN(Number(p.year))) missing.push('project.year');
    const scope = (p.scope || []).map((s) => s.trim()).filter(Boolean);
    if (scope.length < 2) missing.push('project.scope (need at least 2 items)');
    // One of a nameable client name OR a descriptor is required.
    const hasName = p.clientNameable && !!p.clientName?.trim();
    const hasDescriptor = !!p.descriptor?.trim();
    if (!hasName && !hasDescriptor) missing.push('project.client_name (nameable) or project.descriptor');
  }

  const notes = f.jurisdiction?.notes?.trim() || '';
  if (notes.length < 120) missing.push('jurisdiction.notes (min 120 characters)');

  return missing;
}

// ---------- [2] generate ----------
function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Serialize the facts the model may use. Only what a nameable client allows is
 * included — the client name is withheld entirely when not nameable, so it
 * cannot leak even if the model tried.
 */
function factsForModel(f: CityFacts) {
  const def = getService(f.service);
  return {
    serviceDisplayName: def?.name || f.service,
    serviceSlug: f.service,
    city: f.city,
    state: f.state.toUpperCase(),
    county: f.county,
    project: {
      client: f.project.clientNameable ? f.project.clientName || null : null,
      client_nameable: f.project.clientNameable,
      descriptor: f.project.descriptor || null,
      year: f.project.year,
      ...(f.project.sqft ? { sqft: f.project.sqft } : {}),
      scope: f.project.scope.map((s) => s.trim()).filter(Boolean),
    },
    jurisdiction_notes: f.jurisdiction.notes.trim(),
  };
}

const CITY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    metaTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    h1: { type: 'string' },
    intro: { type: 'string' },
    projectBody: { type: 'string' },
    jurisdictionBody: { type: 'string' },
    ctaLine: { type: 'string' },
  },
  required: ['metaTitle', 'metaDescription', 'h1', 'intro', 'projectBody', 'jurisdictionBody', 'ctaLine'],
} as const;

async function callOnce(client: Anthropic, userJson: string): Promise<GeneratedCity> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    temperature: 0.3,
    system: SERVICE_CITY_SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: CITY_SCHEMA } },
    messages: [{ role: 'user', content: userJson }],
  });
  if (message.stop_reason === 'max_tokens') {
    throw new Error('The draft got cut off before it finished.');
  }
  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  if (!text) throw new Error('The model returned no content.');
  return JSON.parse(stripFences(text)) as GeneratedCity;
}

/** Single generation with one retry on parse failure, then throw. */
export async function generateCityCopy(f: CityFacts): Promise<GeneratedCity> {
  const client = new Anthropic();
  const userJson = JSON.stringify(factsForModel(f));
  try {
    return await callOnce(client, userJson);
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw err; // don't retry API-level failures blindly
    // one retry for a parse/format hiccup
    return await callOnce(client, userJson);
  }
}

// ---------- [3] lint ----------
const BANNED = [
  'on time', 'on-time', 'on budget', 'on-budget', 'on schedule',
  'trusted partner', 'proud to', 'we pride',
  'clear communication', 'always available', 'responsive', 'never miss',
  'residential', 'homeowner', 'your home',
  'ground-up', 'ground up construction', 'new construction capability', 'industrial construction',
  'guarantee', 'guaranteed',
  'state-of-the-art', 'best-in-class', 'world-class', 'premier', 'unmatched', 'seamless',
];

// MAC's standing facts the copy may state even though they aren't in the facts
// file: established 1999, 25+ years. Everything else numeric must trace to facts.
const BASELINE_NUMBERS = ['1999', '25'];

function numbersIn(text: string): string[] {
  const out: string[] = [];
  const re = /\d[\d,]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[0].replace(/,/g, ''));
  return out;
}

export interface LintResult {
  ok: boolean;
  violations: { field: string; issue: string }[];
}

/**
 * Case-insensitive banned-phrase scan + structural checks + the numeric
 * anti-hallucination backstop. Any hit fails the run; the route writes nothing.
 */
export function lintCopy(out: GeneratedCity, f: CityFacts): LintResult {
  const violations: { field: string; issue: string }[] = [];
  const fields: [keyof GeneratedCity, string][] = [
    ['metaTitle', out.metaTitle || ''],
    ['metaDescription', out.metaDescription || ''],
    ['h1', out.h1 || ''],
    ['intro', out.intro || ''],
    ['projectBody', out.projectBody || ''],
    ['jurisdictionBody', out.jurisdictionBody || ''],
    ['ctaLine', out.ctaLine || ''],
  ];

  // Banned phrases across every field.
  for (const [field, value] of fields) {
    const lower = value.toLowerCase();
    for (const phrase of BANNED) {
      if (lower.includes(phrase)) {
        violations.push({ field, issue: `banned phrase: "${phrase}"` });
      }
    }
  }

  // Structural checks.
  if ((out.metaTitle || '').length > 60) {
    violations.push({ field: 'metaTitle', issue: `length ${out.metaTitle.length} > 60` });
  }
  const mdLen = (out.metaDescription || '').length;
  if (mdLen < 140 || mdLen > 155) {
    violations.push({ field: 'metaDescription', issue: `length ${mdLen} not in 140–155` });
  }
  const def = getService(f.service);
  const expectedH1 = `${def?.name || f.service} in ${f.city}, ${f.state.toUpperCase()}`;
  if ((out.h1 || '').trim() !== expectedH1) {
    violations.push({ field: 'h1', issue: `must equal "${expectedH1}"` });
  }

  // Client-name leak when not nameable.
  if (!f.project.clientNameable && f.project.clientName?.trim()) {
    const name = f.project.clientName.trim().toLowerCase();
    for (const [field, value] of fields) {
      if (value.toLowerCase().includes(name)) {
        violations.push({ field, issue: 'reveals a non-nameable client name' });
      }
    }
  }

  // Numeric anti-hallucination backstop: every number in the output must trace
  // to the facts file (or the MAC baseline). Allowed set = numbers appearing
  // anywhere in the facts, plus baseline.
  const allowed = new Set<string>([...BASELINE_NUMBERS, ...numbersIn(JSON.stringify(factsForModel(f)))]);
  for (const [field, value] of fields) {
    for (const n of numbersIn(value)) {
      if (!allowed.has(n)) {
        violations.push({ field, issue: `number "${n}" not found in the facts` });
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

/** Slugify a city name for the /project-types/[service]/[city] route. */
export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
