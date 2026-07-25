# Mark Allan Contracting — macont.com rebuild

Commercial general contractor, Metro Atlanta, established 1999. Full from-scratch
rebuild of macont.com. **Primary conversion goal: phone calls.**

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Sanity** — all page content is authored in the CMS (schemas in `sanity/schemaTypes`)
- **Tailwind CSS** — custom design tokens, no UI kit
- **Vercel** hosting
- **CallRail** DNI loaded before first paint on every route

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the placeholders below
npm run dev
```

Embedded Sanity Studio is at [`/studio`](http://localhost:3000/studio) once a
project id is set.

## Open items (blocking — do not invent values)

These are literal placeholder tokens, centralized in `lib/constants.ts` and
overridable from the Sanity `sitewideSettings` singleton. Nothing ships until
they are real:

| Token | Where | Blocks |
|---|---|---|
| `{{PHONE}}` / `{{PHONE_RAW}}` | constants + settings | everything |
| `{{EMAIL}}`, full NAP | constants + settings | Phase 0 |
| `{{CALLRAIL_ID}}` | `NEXT_PUBLIC_CALLRAIL_ID` | everything |
| `{{GA4_ID}}` | `NEXT_PUBLIC_GA4_ID` | Phase 0 |
| `{{SANITY_PROJECT_ID}}` | `NEXT_PUBLIC_SANITY_PROJECT_ID` | content |
| `{{BRAND_NAVY}}` / `{{BRAND_ACCENT}}` | `tailwind.config.ts` + constants | Phase 0 |

Brand hexes use the *assumed* values from the spec (`#1B3A5C` / `#2E75B6`) and
must be verified against macont.com before launch — change them in
`tailwind.config.ts` and `lib/constants.ts` together.

## Seeding the CMS

Once a project id and a write token exist, populate the structural content
(settings singleton, the 7 services, and the Tier-1 cities with real county
jurisdiction notes) in one command:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=xxx npm run seed
```

The seed intentionally does **not** create projects or `serviceCity` documents —
those require real delivered work and CompanyCam photos, and fabricating them
would violate the anti-thin-content and claim-honesty rules. The matrix stays
gated until that content is real.

## Architecture notes

- **Content lives in Sanity.** Query helpers in `lib/queries.ts` return safe
  empties when Sanity is not configured, so the site builds before the CMS is
  provisioned. Service hubs, market pages, campaign LPs, and the blog ship with
  editorial fallback copy (`lib/fallback-*.ts`) that Sanity content overrides
  per-slug with zero code changes.
- **Blog is written.** All 12 posts across the four clusters live in
  `lib/fallback-insights.ts` (ground-up cluster first, per its strategic
  weight). Service hubs carry genuine FAQ blocks with `FAQPage` schema.
- **Redirect map is built.** `next.config.mjs` 301s the full legacy macont.com
  URL set — 889 URLs, dominated by an 862-page `/service-city/*` matrix — to the
  most relevant new destination. Nothing 404s on cutover.
- **NAP single source of truth:** `lib/constants.ts` ← `sitewideSettings`.
- **Anti-thin-content rule is enforced at the data layer.** A
  `/services/[service]/[city]` route 404s unless a `serviceCity` document exists
  with its three required unique blocks (H1, local project note, jurisdiction
  note).
- **Route groups:** `app/(site)/*` carries the header + NAP footer. `app/lp/*`
  sits outside it — locked layout, no nav, `noindex,nofollow`, single phone CTA.
- **Gated routes:** `/trade-partners/*` is built but `noindex` and omitted from
  nav; capability figures render as labeled placeholders until supplied.
  `/development` returns 404 until a ground-up delivery exists.
- **Every page ends with a phone CTA.** The header phone is a persistent CTA,
  not a nav item, and is tap-to-call on mobile.

## SEO

- Sitewide `GeneralContractor`/`LocalBusiness` JSON-LD; `Service` +
  `areaServed`, `BreadcrumbList`, and `Article` schema on the relevant routes.
- `sitemap.ts` excludes `/lp/*` and gated routes. `robots.ts` disallows `/lp/`,
  `/studio`, `/trade-partners`.
- Every route exports unique `title` + `description`; pages self-canonicalize
  (city pages never canonical to the hub).

## Build phases

Phases 0–3 are scaffolded here. The redirect map from the existing Webflow site
(Phase 4) is authored in `next.config.mjs` `redirects()` once the crawl is done.
Tier 2 matrix pages, the blog clusters, and Trade Partners ungating are Phase 5.
