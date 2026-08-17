'use client';

import { useEffect, useRef, useState } from 'react';

interface Slot {
  url: string;
  alt: string;
  file: File | null;
  preview: string | null;
}

interface GalleryItem extends Slot {
  key: string;
}

interface Media {
  hero: { url: string; alt: string };
  about: { url: string; alt: string };
  gallery: { url: string; alt: string }[];
}

let idCounter = 0;
function nextKey() {
  idCounter += 1;
  return `g${idCounter}-${Date.now()}`;
}

const inputClass =
  'mt-1 w-full rounded-[2px] border border-hairline px-3 py-2 text-sm text-ink focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon';

function slotFrom(s: { url: string; alt: string }): Slot {
  return { url: s.url, alt: s.alt, file: null, preview: null };
}

function displayUrl(s: Slot): string {
  return s.preview || s.url;
}

export function HomepagePhotos() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [hero, setHero] = useState<Slot>({ url: '', alt: '', file: null, preview: null });
  const [about, setAbout] = useState<Slot>({ url: '', alt: '', file: null, preview: null });
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const galleryInput = useRef<HTMLInputElement>(null);

  function applyMedia(m: Media) {
    setHero(slotFrom(m.hero));
    setAbout(slotFrom(m.about));
    setGallery(m.gallery.map((g) => ({ ...slotFrom(g), key: nextKey() })));
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/homepage');
        const data = await res.json();
        if (active && res.ok) applyMedia(data.media);
        else if (active) setError(data.error || 'Could not load current photos.');
      } catch {
        if (active) setError('Could not load current photos.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function pickFile(setter: (s: Slot) => void, current: Slot, file: File | null) {
    if (current.preview) URL.revokeObjectURL(current.preview);
    setter({ ...current, file, preview: file ? URL.createObjectURL(file) : null });
    setSaved(false);
  }

  function addGalleryFiles(list: FileList | null) {
    if (!list) return;
    const items = Array.from(list).map((file) => ({
      key: nextKey(),
      url: '',
      alt: '',
      file,
      preview: URL.createObjectURL(file),
    }));
    setGallery((prev) => [...prev, ...items]);
    setSaved(false);
    if (galleryInput.current) galleryInput.current.value = '';
  }

  function updateGallery(key: string, patch: Partial<GalleryItem>) {
    setGallery((prev) => prev.map((g) => (g.key === key ? { ...g, ...patch } : g)));
    setSaved(false);
  }

  function removeGallery(key: string) {
    setGallery((prev) => {
      const item = prev.find((g) => g.key === key);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((g) => g.key !== key);
    });
    setSaved(false);
  }

  function moveGallery(key: string, dir: -1 | 1) {
    setGallery((prev) => {
      const i = prev.findIndex((g) => g.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const config = {
        hero: { url: hero.url, alt: hero.alt },
        about: { url: about.url, alt: about.alt },
        gallery: gallery.map((g) => ({ key: g.key, url: g.url, alt: g.alt })),
      };
      const fd = new FormData();
      fd.set('config', JSON.stringify(config));
      if (hero.file) fd.append('heroFile', hero.file);
      if (about.file) fd.append('aboutFile', about.file);
      gallery.forEach((g) => {
        if (g.file) fd.append(`gallery:${g.key}`, g.file);
      });

      const res = await fetch('/api/admin/homepage', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      applyMedia(data.media);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-faint">Loading current photos…</p>;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-[2px] border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
      {saved ? (
        <div className="rounded-[2px] border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Saved — the home page is updated. Refresh macont.com to see it live.
        </div>
      ) : null}

      {/* Hero + About */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { label: 'Hero photo', slot: hero, setter: setHero, field: 'heroFile' },
          { label: 'About / history photo', slot: about, setter: setAbout, field: 'aboutFile' },
        ].map(({ label, slot, setter }) => (
          <div key={label} className="rounded-[2px] bg-white p-4">
            <div className="text-sm font-semibold text-ink">{label}</div>
            <div className="relative mt-2 aspect-[4/3] overflow-hidden rounded-[2px] bg-paper-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {displayUrl(slot) ? (
                <img src={displayUrl(slot)} alt={slot.alt} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-medium text-muted">Replace photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="mt-1 block w-full text-sm text-body file:mr-3 file:rounded-[2px] file:border-0 file:bg-paper-alt file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-paper-alt"
                onChange={(e) => pickFile(setter, slot, e.target.files?.[0] || null)}
              />
            </label>
            <label className="mt-3 block">
              <span className="text-xs font-medium text-muted">Alt text</span>
              <input
                className={inputClass}
                value={slot.alt}
                onChange={(e) => {
                  setter({ ...slot, alt: e.target.value });
                  setSaved(false);
                }}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Gallery */}
      <div className="rounded-[2px] bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-ink">“On the job” gallery</div>
          <button
            type="button"
            onClick={() => galleryInput.current?.click()}
            className="text-sm font-semibold text-maroon hover:text-maroon-dark"
          >
            + Add photos
          </button>
          <input
            ref={galleryInput}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => addGalleryFiles(e.target.files)}
          />
        </div>

        {gallery.length === 0 ? (
          <p className="mt-3 text-sm text-faint">No gallery photos. Add some above.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <div key={g.key} className="rounded-[2px] border border-hairline p-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded bg-paper-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {displayUrl(g) ? (
                    <img src={displayUrl(g)} alt={g.alt} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <input
                  className={inputClass}
                  placeholder="Alt text"
                  value={g.alt}
                  onChange={(e) => updateGallery(g.key, { alt: e.target.value })}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveGallery(g.key, -1)}
                      disabled={i === 0}
                      className="rounded border border-hairline px-2 py-1 text-body disabled:opacity-40"
                      aria-label="Move left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveGallery(g.key, 1)}
                      disabled={i === gallery.length - 1}
                      className="rounded border border-hairline px-2 py-1 text-body disabled:opacity-40"
                      aria-label="Move right"
                    >
                      →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGallery(g.key)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="btn-call justify-center disabled:opacity-60">
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
        <span className="text-xs text-faint">Changes go live on the home page immediately.</span>
      </div>
    </div>
  );
}
