import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/admin-guard';
import { isDbConfigured } from '@/lib/db';
import { uploadToR2, isR2Configured } from '@/lib/r2';
import { getService } from '@/lib/site-data';
import {
  saveServiceCity,
  publishedServiceCityExists,
} from '@/lib/content';
import {
  validateFacts,
  generateCityCopy,
  lintCopy,
  citySlug,
  isAnthropicConfigured,
  type CityFacts,
} from '@/lib/service-city';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const REVIEW_CHECKLIST = [
  'Every number in the copy matches the facts file',
  'Client naming honors client_nameable',
  "Jurisdiction section says nothing you couldn't defend to that county's permit office",
  'Photo is the right project',
  'Reads like MAC, not like AI',
];

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!isDbConfigured) {
    return NextResponse.json({ error: 'The CMS database is not configured.' }, { status: 503 });
  }
  if (!isR2Configured) {
    return NextResponse.json({ error: 'File storage (R2) is not configured.' }, { status: 503 });
  }
  if (!isAnthropicConfigured) {
    return NextResponse.json(
      { error: 'Generation is not configured. Set ANTHROPIC_API_KEY.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data.' }, { status: 400 });
  }

  const s = (k: string) => String(form.get(k) || '').trim();
  const scope = s('scope')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const facts: CityFacts = {
    service: s('service'),
    city: s('city'),
    state: s('state'),
    county: s('county'),
    project: {
      clientNameable: s('clientNameable') === 'true',
      clientName: s('clientName') || undefined,
      descriptor: s('descriptor') || undefined,
      year: Number(s('year')) || 0,
      sqft: s('sqft') ? Number(s('sqft')) : undefined,
      scope,
      photoAlt: s('photoAlt') || undefined,
      refSlug: s('refSlug') || undefined,
    },
    jurisdiction: { notes: s('jurisdictionNotes') },
  };

  // [1] validate — named missing fields, no partial writes.
  const missing = validateFacts(facts);

  const photo = form.get('photo');
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (!hasPhoto) missing.push('project.photo (required)');
  if (hasPhoto && (photo as File).size > MAX_PHOTO_BYTES) {
    missing.push('project.photo (too large — max 20MB)');
  }

  if (missing.length) {
    return NextResponse.json({ ok: false, stage: 'validate', missing }, { status: 422 });
  }

  const def = getService(facts.service)!; // validated above
  const slug = citySlug(facts.city);

  // "One project unlocks one page." Refuse to overwrite a live page unless the
  // caller explicitly asked for a revision draft.
  const forceDraft = s('forceDraft') === 'true';
  if (!forceDraft && (await publishedServiceCityExists(facts.service, slug))) {
    return NextResponse.json(
      {
        ok: false,
        stage: 'duplicate',
        error: `A published page already exists for ${def.name} / ${facts.city}. Re-run with "Create revision draft" to draft a revision.`,
      },
      { status: 409 },
    );
  }

  // [2] generate.
  let draft;
  try {
    draft = await generateCityCopy(facts);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
      return NextResponse.json({ error: `Claude API error: ${err.message}` }, { status });
    }
    const message = err instanceof Error ? err.message : 'Generation failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // [3] lint — any violation writes nothing.
  const lint = lintCopy(draft, facts);
  if (!lint.ok) {
    return NextResponse.json({ ok: false, stage: 'lint', violations: lint.violations, draft }, { status: 422 });
  }

  // [4] upload photo (only after lint passes, so a failed run leaves no orphan).
  let photoUrl: string;
  try {
    const buf = Buffer.from(await (photo as File).arrayBuffer());
    const up = await uploadToR2({
      buffer: buf,
      contentType: (photo as File).type || 'image/jpeg',
      filename: (photo as File).name || 'city.jpg',
      prefix: 'projects',
    });
    photoUrl = up.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: `Photo upload to R2 failed: ${message}` }, { status: 502 });
  }

  // [5] write DRAFT (never published — a human publishes from the list).
  let id: string;
  try {
    id = await saveServiceCity({
      serviceSlug: facts.service,
      citySlug: slug,
      cityName: facts.city,
      cityState: facts.state.toUpperCase(),
      county: facts.county,
      metaTitle: draft.metaTitle,
      metaDescription: draft.metaDescription,
      h1: draft.h1,
      intro: draft.intro,
      projectTitle: facts.project.clientNameable ? facts.project.clientName : facts.project.descriptor,
      projectBody: draft.projectBody,
      projectRefSlug: facts.project.refSlug,
      photoUrl,
      photoAlt: facts.project.photoAlt || `${def.name} in ${facts.city}, ${facts.state.toUpperCase()}`,
      jurisdictionBody: draft.jurisdictionBody,
      ctaLine: draft.ctaLine,
      clientNameable: facts.project.clientNameable,
      status: 'draft',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Save failed.';
    return NextResponse.json({ error: `Could not save draft: ${message}` }, { status: 502 });
  }

  revalidatePath(`/project-types/${facts.service}/${slug}`);

  return NextResponse.json({
    ok: true,
    id,
    draft,
    slug,
    serviceName: def.name,
    path: `/project-types/${facts.service}/${slug}`,
    checklist: REVIEW_CHECKLIST,
  });
}
