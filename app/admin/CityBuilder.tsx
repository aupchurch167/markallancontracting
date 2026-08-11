'use client';

import { useCallback, useEffect, useState } from 'react';
import { SERVICES } from '@/lib/site-data';
import { Button, Card, Field, StatusBadge, Spinner, inputClass, useToast } from './ui';

/**
 * ServiceCity page builder (spec 09). Facts in → Claude drafts copy → lint →
 * DRAFT saved. Publishing is a separate human action in the list below. The
 * form mirrors the facts file; the pipeline lives server-side in
 * /api/admin/service-city/*.
 */

interface ListItem {
  id: string;
  serviceSlug: string;
  citySlug: string;
  cityName: string;
  cityState: string;
  status: string;
  updatedAt: string;
}

interface GenSuccess {
  ok: true;
  id: string;
  draft: Record<string, string>;
  slug: string;
  serviceName: string;
  path: string;
  checklist: string[];
}

type Result =
  | { kind: 'validate'; missing: string[] }
  | { kind: 'duplicate'; message: string }
  | { kind: 'lint'; violations: { field: string; issue: string }[]; draft: Record<string, string> }
  | { kind: 'success'; data: GenSuccess }
  | null;

const empty = {
  service: (SERVICES[0]?.slug as string) || '',
  city: '',
  state: 'GA',
  county: '',
  clientNameable: true,
  clientName: '',
  descriptor: '',
  year: String(new Date().getFullYear()),
  sqft: '',
  scope: '',
  photoAlt: '',
  refSlug: '',
  jurisdictionNotes: '',
  forceDraft: false,
};

export function CityBuilder() {
  const toast = useToast();
  const [f, setF] = useState({ ...empty });
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const [items, setItems] = useState<ListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/service-city');
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
    } finally {
      setLoadingList(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  async function generate() {
    setBusy(true);
    setResult(null);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.set(k, typeof v === 'boolean' ? String(v) : v));
      if (photo) fd.set('photo', photo);

      const res = await fetch('/api/admin/service-city/generate', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.status === 422 && data.stage === 'validate') {
        setResult({ kind: 'validate', missing: data.missing || [] });
      } else if (res.status === 409 && data.stage === 'duplicate') {
        setResult({ kind: 'duplicate', message: data.error || 'A published page already exists.' });
      } else if (res.status === 422 && data.stage === 'lint') {
        setResult({ kind: 'lint', violations: data.violations || [], draft: data.draft || {} });
        toast.error('Lint failed — nothing was saved. Fix the facts and re-run.');
      } else if (res.ok && data.ok) {
        setResult({ kind: 'success', data });
        toast.success('Draft created. Review it, then publish from the list.');
        reload();
      } else {
        throw new Error(data.error || 'Generation failed.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: 'draft' | 'published') {
    try {
      const res = await fetch(`/api/admin/service-city/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed.');
      toast.success(status === 'published' ? 'Published.' : 'Unpublished (back to draft).');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.');
    }
  }

  async function remove(id: string, label: string) {
    if (!window.confirm(`Delete the ${label} page? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/service-city/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed.');
      toast.success('Deleted.');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed.');
    }
  }

  const notesLen = f.jurisdictionNotes.trim().length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">City page builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">
          Facts in, copy out. Fill in a real project and its county permitting reality, and Claude drafts one
          service×city page in the MAC voice. It saves as a <strong>draft</strong> — you review and publish below.
          No project, no page.
        </p>
      </div>

      {/* Facts form */}
      <Card className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service">
            <select className={inputClass} value={f.service} onChange={(e) => set('service', e.target.value)}>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Related project slug" hint="optional — links to /projects/[slug]">
            <input className={inputClass} value={f.refSlug} onChange={(e) => set('refSlug', e.target.value)} placeholder="proud-moments-austell" />
          </Field>
          <Field label="City">
            <input className={inputClass} value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Austell" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <input className={inputClass} value={f.state} onChange={(e) => set('state', e.target.value)} placeholder="GA" />
            </Field>
            <Field label="County">
              <input className={inputClass} value={f.county} onChange={(e) => set('county', e.target.value)} placeholder="Cobb" />
            </Field>
          </div>
        </div>

        <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-navy">
            <input type="checkbox" checked={f.clientNameable} onChange={(e) => set('clientNameable', e.target.checked)} />
            Client can be named on the page
          </label>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Client name" hint={f.clientNameable ? 'used on the page' : 'stored, never shown'}>
              <input className={inputClass} value={f.clientName} onChange={(e) => set('clientName', e.target.value)} placeholder="Proud Moments ABA" />
            </Field>
            <Field label="Descriptor" hint="used when the client can't be named">
              <input className={inputClass} value={f.descriptor} onChange={(e) => set('descriptor', e.target.value)} placeholder="a behavioral health clinic" />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Year">
            <input className={inputClass} value={f.year} onChange={(e) => set('year', e.target.value)} placeholder="2026" />
          </Field>
          <Field label="Square footage" hint="optional — leave blank if unknown, never guess">
            <input className={inputClass} value={f.sqft} onChange={(e) => set('sqft', e.target.value)} placeholder="3400" />
          </Field>
        </div>

        <Field label="Scope" hint="one item per line, at least 2 — fragments are fine">
          <textarea
            rows={5}
            className={inputClass}
            value={f.scope}
            onChange={(e) => set('scope', e.target.value)}
            placeholder={'full interior demo of former office suite\nnew partition layout for 8 treatment rooms\nADA restroom compliance work\nflooring, paint, ACT ceiling throughout'}
          />
        </Field>

        <Field label="Jurisdiction / permitting notes" hint="in your own words — the generator cleans up, never embellishes">
          <textarea
            rows={4}
            className={inputClass}
            value={f.jurisdictionNotes}
            onChange={(e) => set('jurisdictionNotes', e.target.value)}
            placeholder="Permitted through Cobb County Community Development. Plan review ran about three weeks. Health-adjacent occupancy triggered an extra fire marshal walkthrough before CO."
          />
          <div className={`mt-1 text-xs ${notesLen >= 120 ? 'text-green-600' : 'text-stone-400'}`}>
            {notesLen} / 120 minimum
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project photo" hint="required — the real job">
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy hover:file:bg-stone-200"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
            {photo && <div className="mt-1 text-xs text-stone-500">{photo.name}</div>}
          </Field>
          <Field label="Photo alt text">
            <input className={inputClass} value={f.photoAlt} onChange={(e) => set('photoAlt', e.target.value)} placeholder="Completed treatment room corridor, Austell GA clinic buildout" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-4">
          <Button variant="primary" icon="sparkles" loading={busy} onClick={generate}>
            {busy ? 'Drafting…' : 'Generate draft'}
          </Button>
          <label className="flex items-center gap-2 text-xs text-stone-500">
            <input type="checkbox" checked={f.forceDraft} onChange={(e) => set('forceDraft', e.target.checked)} />
            Create revision draft even if a published page exists
          </label>
        </div>
      </Card>

      {/* Result */}
      {result?.kind === 'validate' && (
        <Card className="border-amber-200 bg-amber-50 p-5">
          <div className="text-sm font-semibold text-amber-800">Missing required facts</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {result.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Card>
      )}

      {result?.kind === 'duplicate' && (
        <Card className="border-amber-200 bg-amber-50 p-5">
          <div className="text-sm text-amber-800">{result.message}</div>
        </Card>
      )}

      {result?.kind === 'lint' && (
        <Card className="border-red-200 bg-red-50 p-5">
          <div className="text-sm font-semibold text-red-700">
            Lint failed — nothing was saved. Adjust the facts (or the claim) and re-run.
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {result.violations.map((v, i) => (
              <li key={i}>
                <span className="font-medium">{v.field}</span>: {v.issue}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result?.kind === 'success' && (
        <Card className="space-y-4 border-green-200 bg-green-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-green-800">
              Draft created: {result.data.serviceName} / {result.data.slug}
            </div>
            <a
              href={result.data.path}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-accent hover:text-accent-700"
            >
              Preview page →
            </a>
          </div>
          <div className="space-y-3 rounded-md bg-white p-4">
            {Object.entries(result.data.draft).map(([k, v]) => (
              <div key={k}>
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{k}</div>
                <div className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-green-800">Before you publish</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-green-800">
              {result.data.checklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Existing pages */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-navy">City pages</h2>
        {loadingList ? (
          <div className="flex justify-center py-10 text-stone-400">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-6 text-sm text-stone-500">No city pages yet. Generate one above.</Card>
        ) : (
          <Card className="divide-y divide-stone-100 p-0">
            {items.map((it) => (
              <div key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-navy">
                    {it.cityName}, {it.cityState}
                  </div>
                  <div className="truncate text-xs text-stone-400">
                    /project-types/{it.serviceSlug}/{it.citySlug}
                  </div>
                </div>
                <StatusBadge status={it.status} />
                <div className="flex items-center gap-1">
                  <a
                    href={`/project-types/${it.serviceSlug}/${it.citySlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100 hover:text-navy"
                  >
                    Preview
                  </a>
                  {it.status === 'published' ? (
                    <Button variant="subtle" size="sm" onClick={() => setStatus(it.id, 'draft')}>
                      Unpublish
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setStatus(it.id, 'published')}>
                      Publish
                    </Button>
                  )}
                  <Button variant="danger" size="sm" icon="trash" onClick={() => remove(it.id, `${it.cityName} ${it.serviceSlug}`)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
