import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ATTRIBUTION_FIELDS,
  LEAD_SOURCES,
  cleanAttributionValue,
  evaluateLeadRequest,
  labelFor,
  sanitizeAttribution,
} from './lead-attribution.ts';

describe('evaluateLeadRequest', () => {
  it('locks the public option list to the canonical keys and visitor labels', () => {
    assert.deepEqual(
      LEAD_SOURCES.map((s) => s.key),
      ['referral', 'inbound_call', 'web_form', 'outbound', 'repeat_client', 'walk_in_other'],
    );
    assert.deepEqual(
      LEAD_SOURCES.map((s) => s.label),
      [
        'Referral from someone I know',
        'I called you',
        'Found you online / website',
        'You reached out to me',
        "I'm a past client",
        'Other',
      ],
    );
  });

  it('accepts every canonical lead source key', () => {
    for (const source of LEAD_SOURCES) {
      const decision = evaluateLeadRequest({ leadSource: source.key, utm_source: 'google' });
      assert.equal(decision.action, 'accept');
      if (decision.action !== 'accept') return;
      assert.equal(decision.leadSource, source.key);
      assert.equal(decision.label, source.label);
      assert.equal(decision.attribution.utm_source, 'google');
    }
  });

  it('rejects a missing, blank, or unknown lead source', () => {
    for (const body of [{}, { leadSource: '' }, { leadSource: '  ' }, { leadSource: 'Referral' }, { leadSource: 'apollo' }, { leadSource: 1 }]) {
      const decision = evaluateLeadRequest(body);
      assert.equal(decision.action, 'reject');
    }
  });

  it('trims a valid key and ignores surrounding space', () => {
    const decision = evaluateLeadRequest({ leadSource: '  referral  ' });
    assert.equal(decision.action, 'accept');
    if (decision.action !== 'accept') return;
    assert.equal(decision.leadSource, 'referral');
  });

  it('drops honeypot submissions without validating the rest', () => {
    const decision = evaluateLeadRequest({ company: 'Acme Bots', leadSource: 'not-a-key' });
    assert.deepEqual(decision, { action: 'drop' });
  });

  it('does not treat a blank honeypot as spam', () => {
    const decision = evaluateLeadRequest({ company: '   ', leadSource: 'walk_in_other' });
    assert.equal(decision.action, 'accept');
  });

  it('rejects a non-object body', () => {
    assert.equal(evaluateLeadRequest(null).action, 'reject');
    assert.equal(evaluateLeadRequest(['referral']).action, 'reject');
    assert.equal(evaluateLeadRequest('referral').action, 'reject');
  });
});

describe('sanitizeAttribution', () => {
  it('returns every field, empty when absent', () => {
    const attribution = sanitizeAttribution({});
    assert.deepEqual(Object.keys(attribution), ATTRIBUTION_FIELDS.map((f) => f.key));
    assert.equal(attribution.utm_campaign, '');
    assert.equal(attribution.landing_page, '');
  });

  it('reads a nested attribution object and ignores unknown keys', () => {
    const decision = evaluateLeadRequest({
      leadSource: 'web_form',
      utm_source: 'should-not-win',
      attribution: {
        utm_source: 'newsletter',
        utm_medium: 'email',
        password: 'nope',
        landingPage: 'https://www.macont.com/contact',
        submittedFrom: 'https://www.macont.com/',
      },
    });
    assert.equal(decision.action, 'accept');
    if (decision.action !== 'accept') return;
    assert.equal(decision.attribution.utm_source, 'newsletter');
    assert.equal(decision.attribution.utm_medium, 'email');
    assert.equal(decision.attribution.landing_page, 'https://www.macont.com/contact');
    assert.equal(decision.attribution.submitted_from, 'https://www.macont.com/');
    assert.equal((decision.attribution as Record<string, string>).password, undefined);
  });

  it('reads flat fields and camel-case URL aliases when no nested object is present', () => {
    const attribution = sanitizeAttribution({
      gclid: 'abc',
      fbclid: 'def',
      landingPage: 'https://www.macont.com/?gclid=abc',
      submittedFrom: 'https://www.macont.com/contact',
    });
    assert.equal(attribution.gclid, 'abc');
    assert.equal(attribution.fbclid, 'def');
    assert.equal(attribution.landing_page, 'https://www.macont.com/?gclid=abc');
    assert.equal(attribution.submitted_from, 'https://www.macont.com/contact');
  });

  it('strips control characters and enforces the field length cap', () => {
    const long = 'x'.repeat(600);
    assert.equal(cleanAttributionValue(`  hello\nworld\u0000\u200B  `, 512), 'helloworld');
    assert.equal(cleanAttributionValue(long, 512).length, 512);
    assert.equal(cleanAttributionValue(12, 512), '');

    const urlMax = ATTRIBUTION_FIELDS.find((f) => f.key === 'landing_page')!.max;
    const attribution = sanitizeAttribution({ landing_page: 'https://example.com/' + 'a'.repeat(5000) });
    assert.equal(attribution.landing_page.length, urlMax);
    assert.equal(attribution.utm_source.length, 0);
  });
});

describe('labelFor', () => {
  it('maps keys to visitor labels and returns empty for anything else', () => {
    assert.equal(labelFor('outbound'), 'You reached out to me');
    assert.equal(labelFor('repeat_client'), "I'm a past client");
    assert.equal(labelFor('nope'), '');
  });
});
