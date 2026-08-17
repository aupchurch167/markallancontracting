'use client';

import { useEffect, useState } from 'react';
import { SERVICES, SERVICE_LINES } from '@/lib/site-data';
import { Button, Card, Icon, Spinner, useToast } from './ui';

type CoverMap = Record<string, string>;
interface Covers {
  projectTypes: CoverMap;
  services: CoverMap;
}

const GROUPS = [
  { key: 'projectTypes' as const, label: 'Project types', items: SERVICES.map((s) => ({ slug: s.slug, name: s.name })) },
  { key: 'services' as const, label: 'Services', items: SERVICE_LINES.map((l) => ({ slug: l.slug, name: l.name })) },
];

export function SectionCovers() {
  const toast = useToast();
  const [covers, setCovers] = useState<Covers>({ projectTypes: {}, services: {} });
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/section-covers');
        const data = await res.json();
        if (res.ok) {
          setCovers(data.covers || { projectTypes: {}, services: {} });
          setConfigured(data.configured !== false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function uploadFor(group: 'projectTypes' | 'services', slug: string, file: File | null) {
    if (!file) return;
    const key = `${group}:${slug}`;
    setBusyKey(key);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/admin/cover/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setCovers((c) => ({ ...c, [group]: { ...c[group], [slug]: data.url } }));
      toast.success('Cover uploaded — click Save to publish.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusyKey('');
    }
  }

  function removeFor(group: 'projectTypes' | 'services', slug: string) {
    setCovers((c) => {
      const next = { ...c[group] };
      delete next[slug];
      return { ...c, [group]: next };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/section-covers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(covers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      toast.success('Saved — covers are live.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-faint">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase text-ink">Section covers</h1>
          <p className="mt-1 text-sm text-muted">
            Cover photos for each project type and service. They show in the home-page grid and on
            the /project-types and /services pages.
          </p>
        </div>
        <Button variant="primary" icon="check" loading={saving} onClick={save}>
          Save
        </Button>
      </div>

      {!configured ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The CMS database isn&apos;t connected yet. Attach a Railway Postgres service and this fills in.
        </Card>
      ) : null}

      {GROUPS.map((group) => (
        <div key={group.key}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-faint">
            {group.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const url = covers[group.key][item.slug];
              const key = `${group.key}:${item.slug}`;
              const busy = busyKey === key;
              return (
                <Card key={item.slug} className="overflow-hidden">
                  <div className="relative aspect-[16/9] bg-paper-alt">
                    {url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={item.name} className="h-full w-full object-cover" />
                        <button
                          onClick={() => removeFor(group.key, item.slug)}
                          className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 hover:bg-white"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-faint">
                        <Icon name="image" className="h-8 w-8" />
                      </div>
                    )}
                    {busy ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-muted">
                        <Spinner />
                      </div>
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium text-ink">{item.name}</div>
                    <label className="mt-2 block cursor-pointer text-xs font-semibold text-maroon hover:underline">
                      {url ? 'Replace photo' : 'Upload photo'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={busy}
                        className="hidden"
                        onChange={(e) => uploadFor(group.key, item.slug, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <Button variant="primary" icon="check" loading={saving} onClick={save}>
          Save
        </Button>
        <span className="text-xs text-faint">Covers go live immediately after saving.</span>
      </div>
    </div>
  );
}
