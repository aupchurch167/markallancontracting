import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/**
 * On-demand revalidation for Sanity content.
 *
 * Wire a Sanity webhook (Manage → API → Webhooks) to POST here on
 * create/update/delete with this projection so we know what changed:
 *
 *   {
 *     "_type": _type,
 *     "slug": slug.current,
 *     "serviceSlug": service->slug.current,
 *     "citySlug": city->slug.current
 *   }
 *
 * Authenticate with a shared secret: set SANITY_REVALIDATE_SECRET, then add it
 * to the webhook URL as ?secret=… or an `Authorization: Bearer …` header.
 * Without the env var set, this endpoint refuses all requests.
 */

const SITEMAP = '/sitemap.xml';

function pathsFor(body: {
  _type?: string;
  slug?: string;
  serviceSlug?: string;
  citySlug?: string;
}): { paths: (string | undefined | false)[]; layout?: boolean } {
  const { _type, slug, serviceSlug, citySlug } = body;
  switch (_type) {
    case 'sitewideSettings':
      // NAP / tracking live in the root layout → revalidate everything.
      return { paths: [], layout: true };
    case 'post':
      return { paths: ['/insights', slug && `/insights/${slug}`, '/new-construction', SITEMAP] };
    case 'project':
      return { paths: ['/projects', slug && `/projects/${slug}`, '/', SITEMAP] };
    case 'service':
      return { paths: ['/project-types', slug && `/project-types/${slug}`, '/services', '/', SITEMAP] };
    case 'city':
      return { paths: [slug && `/locations/${slug}`, SITEMAP] };
    case 'serviceCity':
      return {
        paths: [
          serviceSlug && `/project-types/${serviceSlug}`,
          serviceSlug && citySlug && `/project-types/${serviceSlug}/${citySlug}`,
          SITEMAP,
        ],
      };
    case 'market':
      return { paths: ['/markets', slug && `/markets/${slug}`, SITEMAP] };
    case 'teamMember':
      return { paths: ['/team', '/insights'] };
    case 'landingPage':
      return { paths: [slug && `/lp/${slug}`] };
    default:
      return { paths: ['/', SITEMAP] };
  }
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get('secret');
  const auth = req.headers.get('authorization') || '';
  const fromHeader = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return fromQuery === secret || fromHeader === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, string> = {};
  try {
    body = await req.json();
  } catch {
    // Empty/invalid body → fall through to a homepage revalidation.
  }

  const { paths, layout } = pathsFor(body);
  const revalidated: string[] = [];

  if (layout) {
    revalidatePath('/', 'layout');
    revalidated.push('layout:/');
  }
  for (const p of paths.filter((x): x is string => Boolean(x))) {
    revalidatePath(p);
    revalidated.push(p);
  }

  return NextResponse.json({ revalidated: true, type: body._type ?? null, paths: revalidated });
}
