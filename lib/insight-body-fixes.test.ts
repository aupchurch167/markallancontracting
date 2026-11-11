import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { applyInsightBodyFix, applyPublishedInsightFixes, type Sql } from './insight-body-fixes.ts';
import { publicFaqAnswer } from './public-copy.ts';

const EM = '\u2014';

const TARPING = [
  'A real emergency response runs in a rough order.',
  '',
  '| Stage | What happens | Typical window |',
  '| --- | --- | --- |',
  '| Call received | Address, access, scope of opening, who has authority to sign | Minutes |',
  '| Crew dispatched | Materials loaded — poly, furring, fasteners, ladders, fall gear | [VERIFY: MAC standard dispatch window for emergency calls] |',
  '| On site | Walk the exterior, assess whether the deck can be walked on safely | Same day |',
  '| Safety call | If framing is unstable, tarp gets anchored from outside the damage zone only | Same day |',
  '| Tarp installed | Sheeting lapped past damage, strips screwed down, edges sealed | [VERIFY: typical tarp install duration for a single roof section] |',
  '| Documentation | Photos before, during, after; written note of what was covered | Same visit |',
  '',
  'We were called to a condo association in Decatur.',
].join('\n');

const FIRE = [
  `The insurance **scope of work** ${EM} usually written in Xactimate ${EM} becomes the budget. Read it line by line before you agree to it.`,
  '',
  '| Rebuild | Framing, MEP, drywall, trim, flooring, paint, inspections | General contractor | After the insurance scope is agreed |',
  '| 1. Scope agreed | Insurer scope reconciled with contractor\'s estimate | Mitigation and demo |',
  '| 2. Permit | Drawings or engineer letter submitted, permit issued | Scope agreed |',
  '',
  'Photograph everything before it moves.',
  '',
  'It depends on how much structure was lost and how fast the insurance scope is agreed. The scope negotiation is usually the longest single delay, not the construction. Permit review adds time on top of that.',
].join('\n');

const DEMO = [
  '## Demo phase sequence and rough duration',
  '',
  '| Step | What happens |',
  '|---|---|---|',
  '| Protection and shutoffs | Mask storefront, cover what stays, kill power/water |  |',
  '| Ceilings and lighting | Tile, grid, fixtures out; systems exposed |',
  '| Walls | Selective removal, framing cut back |',
  '| Flooring | Carpet, VCT, tile, adhesive removal |',
  '| Haul-off and sweep | Dumpster loads, final clean for layout |',
  '',
  '## Where this goes wrong',
].join('\n');

function twice(slug: string, body: string) {
  const once = applyInsightBodyFix(slug, body);
  const again = applyInsightBodyFix(slug, once.next);
  assert.equal(once.changed, true, `${slug} should change the first time`);
  assert.equal(again.changed, false, `${slug} must no-op on the corrected text`);
  assert.equal(again.next, once.next);
  assert.deepEqual(again.edits, []);
  return once;
}

describe('applyInsightBodyFix', () => {
  it('removes only the two tarping VERIFY rows and then no-ops', () => {
    const once = twice('emergency-roof-tarping', TARPING);
    assert.equal(once.next.includes('[VERIFY'), false);
    assert.match(once.next, /Call received/);
    assert.match(once.next, /On site/);
    assert.match(once.next, /Safety call/);
    assert.match(once.next, /Documentation/);
    assert.doesNotMatch(once.next, /Crew dispatched/);
    assert.doesNotMatch(once.next, /Tarp installed/);
    assert.match(once.next, /condo association in Decatur/);
    assert.deepEqual(once.edits, [
      'removed [VERIFY: MAC standard dispatch window for emergency calls]',
      'removed [VERIFY: typical tarp install duration for a single roof section]',
    ]);
  });

  it('applies the fire wording edits and then no-ops', () => {
    const once = twice('residential-fire-damage', FIRE);
    assert.doesNotMatch(once.next, /scope negotiation/);
    assert.doesNotMatch(once.next, /insurance scope is agreed/);
    assert.doesNotMatch(once.next, /Scope agreed/);
    assert.doesNotMatch(once.next, /Insurer scope reconciled/);
    assert.match(once.next, /insurance company's estimating tool/);
    assert.match(once.next, /After the insurance company approves the scope/);
    assert.match(once.next, /Insurance company approves the scope/);
    assert.match(once.next, /1\. Scope approved/);
    assert.match(once.next, /\| Scope approved \|/);
    assert.match(once.next, /Photograph everything before it moves/);
    assert.match(once.next, /Permit review adds time on top of that/);
    assert.match(
      once.next,
      /Waiting on the insurance company to approve the scope is usually the longest single delay/,
    );
  });

  it('replaces the broken demo table with a 2-column table and then no-ops', () => {
    const once = twice('demo-phase', DEMO);
    assert.doesNotMatch(once.next, /\|---\|---\|---\|/);
    assert.match(once.next, /\| --- \| --- \|/);
    assert.match(once.next, /\| Protection and shutoffs \| Mask storefront, cover what stays, kill power\/water \|/);
    assert.doesNotMatch(once.next, /kill power\/water \| {2}\|/);
    assert.match(once.next, /## Where this goes wrong/);
    assert.deepEqual(once.edits, ['demo sequence table']);
  });

  it('leaves a body alone when the old text is already gone', () => {
    const fixed = applyInsightBodyFix('demo-phase', DEMO);
    const again = applyInsightBodyFix('demo-phase', fixed.next);
    assert.equal(again.changed, false);
    const unrelated = applyInsightBodyFix('demo-phase', 'No table here.');
    assert.equal(unrelated.changed, false);
    assert.equal(unrelated.next, 'No table here.');
  });

  it('does not edit any other slug', () => {
    const other = applyInsightBodyFix('cheap-painter-sprinkler-heads', TARPING);
    assert.equal(other.changed, false);
    assert.equal(other.next, TARPING);
  });

  it('applies a single remaining fire edit without touching the rest', () => {
    const partial = 'Already approved.\n\nThe scope negotiation is usually the longest single delay, not the construction.';
    const sentence =
      'It depends on how much structure was lost and how fast the insurance scope is agreed. The scope negotiation is usually the longest single delay, not the construction.';
    const once = applyInsightBodyFix('residential-fire-damage', `Intro.\n\n${sentence}`);
    assert.equal(once.edits.length, 1);
    assert.match(once.next, /^Intro\.\n\nIt depends/);
    assert.equal(applyInsightBodyFix('residential-fire-damage', partial).changed, false);
  });

  it('keeps the corrected wording in the repo markdown files', () => {
    const root = join(import.meta.dirname, '..', 'content', 'insights');
    const tarping = readFileSync(join(root, 'emergency-roof-tarping.md'), 'utf8');
    const fire = readFileSync(join(root, 'residential-fire-damage.md'), 'utf8');
    const demo = readFileSync(join(root, 'demo-phase.md'), 'utf8');
    assert.equal(tarping.includes('[VERIFY'), false);
    assert.equal(fire.includes('scope negotiation'), false);
    assert.equal(fire.includes('Scope agreed'), false);
    assert.match(fire, /insurance company's estimating tool/);
    assert.equal(demo.includes('|---|---|---|'), false);
    assert.match(demo, /\| --- \| --- \|/);
    const fixed = applyInsightBodyFix('demo-phase', DEMO);
    assert.equal(demo.includes(fixed.next.split('\n\n')[1]), true);
  });
});

describe('applyPublishedInsightFixes', () => {
  it('is a no-op when DATABASE_URL is unset', async () => {
    const previous = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const report = await applyPublishedInsightFixes();
      assert.deepEqual(report, { skipped: true, reason: 'no-database-url' });
    } finally {
      if (previous === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previous;
    }
  });

  it('updates published body_markdown once and does not write on the second run', async () => {
    const stored = new Map<string, { status: string; body: string }>([
      ['emergency-roof-tarping', { status: 'published', body: TARPING }],
      ['residential-fire-damage', { status: 'published', body: FIRE }],
      ['demo-phase', { status: 'published', body: DEMO }],
      ['demo-phase-draft', { status: 'draft', body: DEMO }],
    ]);
    const statements: string[] = [];

    const query: Sql = async (text, params = []) => {
      statements.push(text);
      assert.equal(/delete\s+from/i.test(text), false);
      if (text.trimStart().startsWith('SELECT')) {
        const slugs = params[0] as string[];
        assert.deepEqual(slugs, ['emergency-roof-tarping', 'residential-fire-damage', 'demo-phase']);
        assert.match(text, /status = 'published'/);
        assert.match(text, /body_markdown/);
        return slugs
          .filter((slug) => stored.get(slug)?.status === 'published')
          .map((slug) => ({ slug, body_markdown: stored.get(slug)!.body }));
      }
      assert.match(text, /^UPDATE posts\s+SET body_markdown = \$1\b/);
      assert.doesNotMatch(text, /SET[^;]*title/i);
      assert.match(text, /status = 'published'/);
      const [next, slug, previous] = params as [string, string, string];
      const row = stored.get(slug);
      assert.ok(row);
      assert.equal(row.status, 'published');
      assert.equal(row.body, previous);
      row.body = next;
      return [{ slug }];
    };

    const logs: string[] = [];
    const first = await applyPublishedInsightFixes({ query, log: (m) => logs.push(m) });
    assert.equal(first.skipped, false);
    if (first.skipped) return;
    assert.deepEqual(
      first.rows.map((row) => row.action),
      ['updated', 'updated', 'updated'],
    );
    assert.equal(stored.get('emergency-roof-tarping')!.body.includes('[VERIFY'), false);
    assert.equal(stored.get('residential-fire-damage')!.body.includes('scope negotiation'), false);
    assert.equal(stored.get('demo-phase')!.body.includes('|---|---|---|'), false);
    assert.equal(stored.get('demo-phase-draft')!.body, DEMO);
    assert.equal(statements.filter((sql) => sql.trimStart().startsWith('UPDATE')).length, 3);

    const beforeSecond = statements.length;
    const second = await applyPublishedInsightFixes({ query, log: (m) => logs.push(m) });
    assert.equal(second.skipped, false);
    if (second.skipped) return;
    assert.deepEqual(
      second.rows.map((row) => row.action),
      ['unchanged', 'unchanged', 'unchanged'],
    );
    assert.equal(statements.slice(beforeSecond).some((sql) => sql.trimStart().startsWith('UPDATE')), false);
    assert.ok(logs.some((line) => line.includes('emergency-roof-tarping: updated body_markdown')));
    assert.ok(logs.some((line) => line.includes('demo-phase: unchanged')));
  });
});

describe('publicFaqAnswer', () => {
  it('hides a placeholder sentence and the whole item when that is all there is', () => {
    assert.equal(
      publicFaqAnswer(
        'We price it after we walk it. {{PLACEHOLDER: water cost ranges from Justin}} You’ll get a line-item estimate.',
      ),
      'We price it after we walk it. You’ll get a line-item estimate.',
    );
    assert.equal(
      publicFaqAnswer(
        '{{PLACEHOLDER: Adam to confirm the $50K-$500K sweet spot applies to insurance work}} Call us with the details.',
      ),
      'Call us with the details.',
    );
    assert.equal(publicFaqAnswer('{{PLACEHOLDER: fire cost ranges from Justin}}'), null);
    assert.equal(publicFaqAnswer('A real answer with no token.'), 'A real answer with no token.');
  });
});
