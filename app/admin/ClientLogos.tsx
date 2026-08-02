'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Icon, Spinner, inputClass, useToast } from './ui';

interface Logo {
  url: string;
  name: string;
}

export function ClientLogos() {
  const toast = useToast();
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/client-logos');
        const data = await res.json();
        if (res.ok) {
          setLogos(data.logos || []);
          setConfigured(data.configured !== false);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set('file', file);
        const res = await fetch('/api/admin/cover/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed.');
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
        setLogos((prev) => [...prev, { url: data.url, name }]);
      }
      toast.success('Uploaded — click Save to publish.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function update(i: number, patch: Partial<Logo>) {
    setLogos((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function remove(i: number) {
    setLogos((prev) => prev.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setLogos((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/client-logos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      toast.success('Saved — logos are live.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Client logos</h1>
          <p className="mt-1 text-sm text-stone-500">
            Logos of clients you&apos;ve worked with. They show as a strip on the home page. Use
            transparent PNGs where you can. Nothing shows until at least one is added.
          </p>
        </div>
        <div className="flex gap-2">
          <label className="btn-ghost cursor-pointer text-sm">
            {uploading ? 'Uploading…' : '+ Add logos'}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          <Button variant="primary" icon="check" loading={saving} onClick={save}>
            Save
          </Button>
        </div>
      </div>

      {!configured ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The CMS database isn&apos;t connected yet. Attach a Railway Postgres service and this fills in.
        </Card>
      ) : null}

      {logos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-stone-500">
          No logos yet. Use <span className="font-medium text-navy">Add logos</span> above, then Save.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo, i) => (
            <Card key={`${logo.url}-${i}`} className="p-3">
              <div className="flex h-24 items-center justify-center rounded bg-stone-50 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
              </div>
              <input
                className={inputClass}
                placeholder="Client name (for alt text)"
                value={logo.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded border border-stone-200 px-2 py-1 text-stone-600 disabled:opacity-40"
                    aria-label="Move earlier"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === logos.length - 1}
                    className="rounded border border-stone-200 px-2 py-1 text-stone-600 disabled:opacity-40"
                    aria-label="Move later"
                  >
                    →
                  </button>
                </div>
                <button onClick={() => remove(i)} className="text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button variant="primary" icon="check" loading={saving} onClick={save}>
          Save
        </Button>
        <span className="text-xs text-stone-400">
          <Icon name="info" className="mr-1 inline h-3.5 w-3.5" />
          Changes go live immediately after saving.
        </span>
      </div>
    </div>
  );
}
