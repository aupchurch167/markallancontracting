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

## Resolved inputs

Verified from the live macont.com (its own LocalBusiness JSON-LD) and confirmed
by the owner. All live in `lib/constants.ts` and are overridable from the Sanity
`sitewideSettings` singleton (`npm run seed` writes the same values):

| Item | Value |
|---|---|
| Phone (tracked CTA / CallRail DNI fallback) | (404) 724-8709 |
| Primary email | hello@macont.com |
| NAP | 3420 Oakcliff Rd, Suite 103, Atlanta, GA 30340 |
| Hours | Mon–Fri 8am–5pm · Sat–Sun 9am–1pm |
| CallRail | company `571875192`, swap `8a72377554f5e3b406a8` |
| GA4 | `G-Z9YX6SX90M` |
| Brand palette | navy `#1B3A5C` + accent `#2E75B6` (owner: keep, don't match live Webflow charcoal) |
| Trade Partners placement | main nav, once ungated (`FEATURES.tradePartnersPublished`) |
| Homepage price/build claim | softened (no strict estimator = builder claim) |

## CMS (blog, projects, team)

The Sanity schemas are built out for real editing, organized in the Studio desk
into Blog (Posts + Team/Authors), Projects, Team, Services & Types, Locations &
Matrix, and Campaign groups.

- **Blog** — posts carry a hero image, a rich body (`blockContent` with inline
  images + captions), an author reference to a **Team Member**, tags, featured
  flag, and curated related posts. Index shows a featured hero + author bylines;
  detail shows the byline (with photo), reading time, tags, and related.
- **Team** — a `teamMember` type (name, role, photo, bio, contact, order). The
  real team (Justin, Brian, Nick, Adam Upchurch) ships on `/team` from
  `lib/fallback-team.ts` + `public/team/*`, overridden per-slug by Sanity.
- **Projects** — add completed date, square footage, a testimonial, and a stat
  highlights row on top of the existing scope/challenge/solution/gallery.

`npm run seed` populates settings, services, cities, and the four team members
(add photos in Studio; they already render on `/team` until then).

## Projects

`/projects`, the homepage, and the service hubs render four real delivered jobs
carried over from the existing macont.com — Kennesaw Pilates studio, tanning
salon buildout, office-to-warehouse flex conversion, and a 12-building exterior
repaint — with their real photos in `public/projects/*`. Copy is rewritten in
the site voice (`lib/fallback-projects.ts`); Sanity `project` documents override
per-slug once authored with CompanyCam photos.

## Still open (need real assets, not decisions)

| Item | Unlocks |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` + write token | Authored CMS content overrides all code fallbacks |
| More delivered projects + CompanyCam photos | Deeper portfolio; local project references that ungate service×city matrix pages |
| Trade Partner figures — insurance limits, W/C mod rate, crew capacity, bonding | Ungate Trade Partners (flip `FEATURES.tradePartnersPublished`) |

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

## Backend & operations

- **Live publishing** — `POST /api/revalidate` does on-demand revalidation. Point
  a Sanity webhook at it (`?secret=$SANITY_REVALIDATE_SECRET`, projection in the
  route header) and publishing updates the affected pages in seconds, no
  redeploy. Refuses all requests until the secret env var is set.
- **Conversion tracking** — `components/ConversionTracking.tsx` fires GA4 events
  on every tap-to-call (`phone_call_click`) and lead-form submit
  (`generate_lead`), via event delegation, sitewide. Mark either as a GA4 key
  event to track the one thing that matters.
- **Legal** — `/privacy` and `/terms`, written around the real stack (CallRail,
  GA4, contact form), linked in the footer. Have counsel review before launch.
- **Security headers + CSP** — `next.config.mjs` `headers()` applies HSTS,
  nosniff, frame-options, referrer + permissions policy, and one pragmatic CSP
  (locks script/connect/frame to self + GA4/CallRail/Sanity/Calendly; permissive
  on inline/eval so the embedded Studio still runs).
- **Dynamic OG images** — `/api/og` renders a branded 1200×630 card per page;
  `pageMetadata` defaults every route's social card to it (title + eyebrow).
- **RSS** — `/feed.xml` (Sanity posts over the authored fallback), advertised via
  a discovery `<link>` sitewide.
- **Error boundaries** — branded `app/(site)/error.tsx` + root `global-error.tsx`
  (the graceful-failure foundation; Sentry is a drop-in once a DSN exists).
- **Site-walk booking** — `BookingEmbed` shows a Calendly scheduler on `/contact`
  when `NEXT_PUBLIC_CALENDLY_URL` is set; hidden otherwise (calls stay primary).
- **`/admin` content console** — a password-gated console for drafting blog posts
  and projects with Claude. Pick a type, write a brief, attach images/PDFs for
  context, and `Generate with Claude` (`claude-opus-5`, vision + PDF reading)
  produces a structured draft in the site voice. Every field is editable before
  `Save as draft to Sanity`, which uploads attached images as assets and writes a
  `drafts.*` document that opens straight in the Studio to review and publish.
  Auth is a signed session cookie (`ADMIN_PASSWORD` + `ADMIN_SESSION_SECRET`);
  generation needs `ANTHROPIC_API_KEY`; saving needs `SANITY_WRITE_TOKEN`. The
  console denies access and returns clear errors until each is set. `noindex`,
  disallowed in robots, and never invents figures not in the brief/attachments.
  - **Refine** — after generating, a note ("make it punchier, add a permitting
    section") rewrites the whole draft in place via `POST /api/admin/refine`,
    grounded on the current draft (no new facts). Truncated (`max_tokens`)
    replies are caught and surfaced instead of saving a cut-off draft.
  - **Internal auto-linking** — on save, generated post/project bodies weave in
    links to our own service, project-type, and market pages
    (`lib/internal-links.ts`): first mention only, longest phrase first, capped
    per paragraph, headings/lists left alone. Builds topical authority and
    funnels readers toward the conversion pages.
- **Media storage (Cloudflare R2)** — `/admin` uploads (images + PDFs) go to R2
  (S3-compatible), not Sanity's asset store. Images land on `heroImageUrl`
  (posts) / `imageUrls[]` (projects); every file is also linked under
  `attachments[]`, and PDFs render as a Documents list on the project page.
  Rendering prefers a Sanity-uploaded image, then the R2 URL, then the built-in
  fallback, so hand-uploaded Studio images still win. Needs `S3_ENDPOINT`,
  `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`
  (Cloudflare R2, S3-compatible); the public host is registered for `next/image`
  in `next.config.mjs`.
- **Home-page photos (`/admin` → "Home page photos")** — replace the hero and
  about photos and add/remove/reorder the "On the job" gallery, each with alt
  text. Uploads go to R2; the slot config is saved to a `homepage` Sanity
  singleton (`GET`/`POST /api/admin/homepage`) and the home page is revalidated
  so changes go live immediately. `lib/homepage-media.ts` holds the shipped
  fallback photos and merges the singleton over them, so the page always renders
  even before the first edit. Editable in Studio too (🏠 Home Page).
- **Deferred, need external setup:**
  - Working scope form (owner wants leads in a CRM — needs to pick which; mailto
    form + `data-lead-form` marker in place).
  - Sanity draft/preview (Presentation) — needs a viewer token; deferred to avoid
    half-wiring the static build before Sanity is live.
  - Sentry error reporting — needs a DSN; error boundaries already capture the UI.

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
