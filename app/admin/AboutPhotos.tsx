'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Field, Spinner, Icon, inputClass, useToast } from './ui';

/**
 * Manage the three photo slots on the /about story page. Uploads reuse the
 * shared cover/upload endpoint (→ R2 URL); the set is saved as a singleton.
 * Matches the light admin console styling.
 */

interface Photo {
  url: string;
  alt: string;
}
type SlotKey = 'team' | 'early' | 'recent';
type Photos = Record<SlotKey, Photo>;

const SLOTS: { key: SlotKey; label: string; hint: string }[] = [
  { key: 'team', label: 'Mark, Adam & Justin', hint: 'The family on a current jobsite — top of the story.' },
  { key: 'early', label: 'Early project', hint: 'An early completed project or company photo.' },
  { key: 'recent', label: 'Recent work', hint: 'A recent job — e.g. Olive Garden or the Austell clinic.' },
];

const EMPTY: Photos = {
  team: { url: '', alt: '' },
  early: { url: '', alt: '' },
  recent: { url: '', alt: '' },
};

export function AboutPhotos() {
  const toast = useToast();
  const [photos, setPhotos] = useState<Photos>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<SlotKey | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/about-photos');
        const data = await res.json();
        if (data.configured === false) setConfigured(false);
        else if (res.ok && data.photos) setPhotos({ ...EMPTY, ...data.photos });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setSlot(key: SlotKey, patch: Partial<Photo>) {
    setPhotos((p) => ({ ...p, [key]: { ...p[key], ...patch } }));
  }

  async function onFile(key: SlotKey, file: File | null) {
    if (!file) return;
    setUploading(key);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/admin/cover/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setSlot(key, { url: data.url });
      toast.success('Photo uploaded — Save to publish.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/about-photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photos),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed.');
      toast.success('Saved — the About page is updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-faint">
        <Spinner />
      </div>
    );
  }
  if (!configured) {
    return <Card className="p-5 text-sm text-muted">The database isn&apos;t configured, so About photos can&apos;t be managed yet.</Card>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-3">
        {SLOTS.map(({ key, label, hint }) => {
          const slot = photos[key];
          return (
            <Card key={key} className="space-y-3 p-4">
              <div>
                <div className="text-sm font-semibold text-ink">{label}</div>
                <div className="mt-0.5 text-xs text-faint">{hint}</div>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2px] bg-paper-alt">
                {slot.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.url} alt={slot.alt} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-faint">
                    <Icon name="image" className="h-6 w-6" />
                  </div>
                )}
              </div>
              <label className="block cursor-pointer text-sm font-medium text-maroon hover:text-maroon-dark">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="upload" className="h-4 w-4" />
                  {uploading === key ? 'Uploading…' : slot.url ? 'Replace' : 'Upload'}
                </span>
                <input type="file" accept="image/*" className="hidden" disabled={uploading === key} onChange={(e) => onFile(key, e.target.files?.[0] || null)} />
              </label>
              <Field label="Alt text">
                <input className={inputClass} value={slot.alt} onChange={(e) => setSlot(key, { alt: e.target.value })} />
              </Field>
              {slot.url && (
                <button onClick={() => setSlot(key, { url: '' })} className="text-xs text-red-500 hover:underline">
                  Remove (show placeholder)
                </button>
              )}
            </Card>
          );
        })}
      </div>
      <Button variant="primary" loading={saving} onClick={save}>
        Save About photos
      </Button>
    </div>
  );
}
