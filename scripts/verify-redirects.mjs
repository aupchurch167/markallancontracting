/**
 * Redirect integrity check for the legacy → new URL map in next.config.mjs.
 *
 * Enforces the three rules we committed to for the SEO cutover:
 *   1. Permanent only — every rule is a 301 (statusCode: 301 or permanent: true).
 *      Temporary redirects leak link equity and confuse crawlers.
 *   2. No chains — no destination, if requested, would itself be redirected
 *      again. Search engines follow at most a few hops; a chain wastes crawl
 *      budget and can strand equity. Every legacy URL must reach its target in
 *      a single hop.
 *   3. Nothing lands on a 404 — every destination resolves to a live App Router
 *      route (a real page.tsx / route.ts), so no redirect dead-ends.
 *
 * Pure Node, no test framework or dependencies. Run: `node scripts/verify-redirects.mjs`.
 * Exits non-zero (and prints every failing rule) if any invariant is violated.
 */

import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/* ------------------------------------------------------------------ */
/* 1. Load the redirect table straight from next.config.mjs           */
/* ------------------------------------------------------------------ */

const nextConfig = (await import(join(ROOT, 'next.config.mjs'))).default;
const redirects = await nextConfig.redirects();

/* ------------------------------------------------------------------ */
/* 2. Discover live routes by walking the App Router tree             */
/* ------------------------------------------------------------------ */

/**
 * Convert an app-directory path into a URL route pattern:
 *   - `(group)` route-group segments are dropped (they don't appear in URLs)
 *   - `[param]`        → a single-segment wildcard
 *   - `[...param]`     → a catch-all (one or more segments)
 *   - `[[...param]]`   → an optional catch-all (zero or more segments)
 * Returns null for non-routable files.
 */
function fileToRoutePattern(relPath) {
  const parts = relPath.split('/');
  const file = parts.pop();
  if (!/^(page|route)\.(t|j)sx?$/.test(file)) return null;

  const segs = [];
  for (const seg of parts) {
    if (seg === 'app') continue;
    if (seg.startsWith('(') && seg.endsWith(')')) continue; // route group
    segs.push(seg);
  }
  return '/' + segs.join('/');
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full.slice(ROOT.length + 1));
    }
  }
  return acc;
}

const liveRoutes = walk(join(ROOT, 'app'))
  .map(fileToRoutePattern)
  .filter(Boolean)
  .sort();

/**
 * Compile a route pattern into a matcher against a concrete URL path.
 * Handles the dynamic-segment forms above.
 */
function routeMatcher(pattern) {
  const segs = pattern.split('/').filter(Boolean);
  const re = segs.map((seg) => {
    if (/^\[\[\.\.\..+\]\]$/.test(seg)) return '(?:/[^/]+)*'; // optional catch-all
    if (/^\[\.\.\..+\]$/.test(seg)) return '/[^/]+(?:/[^/]+)*'; // catch-all
    if (/^\[.+\]$/.test(seg)) return '/[^/]+'; // single dynamic
    return '/' + seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  // For optional catch-all the leading slash is inside the group.
  const body = re
    .map((r, i) => (r.startsWith('(?:') ? r : r))
    .join('')
    .replace(/^\(\?:/, '/(?:'); // ensure a leading slash if first seg is optional catch-all
  return new RegExp('^' + (body || '/') + '/?$');
}

const routeMatchers = liveRoutes.map((r) => ({ pattern: r, re: routeMatcher(r) }));

function resolvesToLiveRoute(path) {
  const clean = path.split('?')[0].split('#')[0];
  return routeMatchers.some(({ re }) => re.test(clean));
}

/* ------------------------------------------------------------------ */
/* 3. Compile redirect SOURCE patterns (Next.js path-to-regexp subset) */
/* ------------------------------------------------------------------ */

/**
 * Next.js sources use `:name` (single segment) and `:name*` (catch-all), and
 * may embed a param mid-segment (e.g. `/service-city/:phrase-:city`). This
 * compiles that subset well enough to detect whether a concrete path would be
 * caught by the rule.
 */
function sourceMatcher(source) {
  let re = '';
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === ':') {
      let j = i + 1;
      while (j < source.length && /[A-Za-z0-9_]/.test(source[j])) j++;
      const star = source[j] === '*';
      if (star) j++;
      re += star ? '.*' : '[^/]+';
      i = j;
    } else {
      re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  return new RegExp('^' + re + '/?$');
}

const sourceMatchers = redirects.map((r) => ({
  source: r.source,
  re: sourceMatcher(r.source),
}));

/**
 * Substitute concrete sample tokens for any `:param` in a destination so we can
 * test the resolved URL for both liveness and chaining.
 */
function concreteDestination(dest) {
  return dest
    .replace(/:[A-Za-z0-9_]+\*/g, 'sample/deep/path')
    .replace(/:[A-Za-z0-9_]+/g, 'sample');
}

/* ------------------------------------------------------------------ */
/* 4. Run the three checks                                            */
/* ------------------------------------------------------------------ */

const failures = [];

for (const r of redirects) {
  const isPermanent = r.permanent === true || r.statusCode === 301 || r.statusCode === 308;
  if (!isPermanent) {
    failures.push(
      `NOT PERMANENT: ${r.source} → ${r.destination} (statusCode=${r.statusCode ?? 'undefined'}, permanent=${r.permanent ?? 'undefined'})`
    );
  }

  // External destinations (rare) skip liveness/chain checks.
  const external = /^https?:\/\//.test(r.destination);
  const dest = concreteDestination(r.destination);

  if (!external) {
    if (!resolvesToLiveRoute(dest)) {
      failures.push(`DEAD END (404): ${r.source} → ${r.destination} (no live route matches "${dest}")`);
    }

    // Chain check: would the destination itself be redirected again?
    for (const sm of sourceMatchers) {
      if (sm.source === r.source) continue; // a rule matching its own source is fine
      if (sm.re.test(dest)) {
        failures.push(
          `CHAIN: ${r.source} → ${r.destination}, but "${dest}" is itself caught by source "${sm.source}"`
        );
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* 5. Report                                                          */
/* ------------------------------------------------------------------ */

console.log(`Live App Router routes discovered: ${liveRoutes.length}`);
console.log(`Redirect rules checked:            ${redirects.length}`);
console.log('');

if (failures.length) {
  console.error(`✗ ${failures.length} redirect problem(s):\n`);
  for (const f of failures) console.error('  • ' + f);
  console.error('');
  process.exit(1);
}

console.log('✓ All redirects are permanent, single-hop, and land on a live route.');
