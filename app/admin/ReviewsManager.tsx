'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Field, Spinner, Icon, inputClass, useToast } from './ui';

/**
 * Google reviews management, folded into the main admin console (same primitives
 * as Posts/Projects/Links). Two tabs — Reviews (the curated quotes shown on the
 * site) and Settings (heading, the Google reviews link, and the real GMB
 * aggregate). Saves are immediate and revalidate the pages that show the block.
 *
 * Guardrails baked into the copy: paste REAL reviews only, and the aggregate
 * rating must be the true Google average (all reviews), because that number is
 * shown on the page and marked up for search engines.
 */

interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  body: string;
  reviewDate: string;
  source: string;
  visible: boolean;
  sortOrder: number;
}
interface Settings {
  heading: string;
  intro: string;
  reviewsUrl: string;
  aggregateRating: number | null;
  reviewCount: number | null;
  visible: boolean;
}

type Tab = 'reviews' | 'settings';

function fmt(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" className={`h-3.5 w-3.5 ${i < rating ? 'text-maroon' : 'text-hairline'}`} />
      ))}
    </span>
  );
}

export function ReviewsManager() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('reviews');
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.configured === false) {
        setConfigured(false);
      } else if (res.ok) {
        setConfigured(true);
        setReviews(data.reviews || []);
        setSettings(data.settings);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-faint">
        <Spinner />
      </div>
    );
  }
  if (!configured) {
    return (
      <Card className="p-6 text-sm text-muted">
        The CMS database isn&apos;t configured, so reviews can&apos;t be managed here yet.
      </Card>
    );
  }

  const TABS: [Tab, string][] = [
    ['reviews', `Reviews${reviews.length ? ` (${reviews.length})` : ''}`],
    ['settings', 'Settings'],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase text-ink">Google reviews</h1>
        <a href="/#recent-work" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-maroon hover:text-maroon-dark">
          View live site <Icon name="external" className="h-4 w-4" />
        </a>
      </div>
      <p className="mb-5 max-w-2xl text-sm text-muted">
        Real Google reviews you paste here appear on the homepage, contact, and about pages — with a “via Google” tag and a
        link out to your full reviews. Show your best; just keep every quote real.
      </p>

      <div className="mb-6 flex gap-1 border-b border-hairline">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'border-maroon text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'reviews' && <ReviewsTab reviews={reviews} setReviews={setReviews} reload={reload} toast={toast} />}
      {tab === 'settings' && settings && <SettingsTab settings={settings} setSettings={setSettings} toast={toast} />}
    </div>
  );
}

type Toast = ReturnType<typeof useToast>;

// ---------------------------------------------------------------------------
function ReviewsTab({
  reviews,
  setReviews,
  reload,
  toast,
}: {
  reviews: Review[];
  setReviews: (r: Review[]) => void;
  reload: () => Promise<void>;
  toast: Toast;
}) {
  const blank = { id: '', author: '', role: '', rating: 5, body: '', reviewDate: '', source: 'Google', visible: true };
  const [editing, setEditing] = useState<typeof blank | null>(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next: Review[]) {
    setReviews(next);
    try {
      await fetch('/api/admin/reviews/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: next.map((r) => r.id) }),
      });
    } catch {
      toast.error('Could not save order.');
    }
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= reviews.length) return;
    const next = [...reviews];
    [next[i], next[j]] = [next[j], next[i]];
    persistOrder(next);
  }

  async function toggleVisible(r: Review) {
    try {
      await fetch('/api/admin/reviews/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...r, visible: !r.visible }),
      });
      reload();
    } catch {
      toast.error('Could not update.');
    }
  }

  async function save() {
    if (!editing?.author.trim() || !editing.body.trim()) {
      toast.error('Reviewer name and review text are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/reviews/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Saved.');
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(r: Review) {
    if (!window.confirm(`Delete the review from "${r.author}"?`)) return;
    try {
      await fetch('/api/admin/reviews/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id }),
      });
      toast.success('Deleted.');
      reload();
    } catch {
      toast.error('Delete failed.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Featured reviews</h2>
        <span className="text-xs text-faint">Reorder with the arrows · toggle the eye to hide</span>
      </div>

      <Card className="divide-y divide-hairline p-0">
        {reviews.map((r, i) => (
          <div key={r.id} className={`flex items-start gap-3 px-4 py-3 ${r.visible ? '' : 'opacity-55'}`}>
            <div className="flex flex-col pt-0.5">
              <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="text-faint hover:text-ink disabled:opacity-30">
                <Icon name="chevron" className="h-4 w-4 -rotate-90" />
              </button>
              <button aria-label="Move down" disabled={i === reviews.length - 1} onClick={() => move(i, 1)} className="text-faint hover:text-ink disabled:opacity-30">
                <Icon name="chevron" className="h-4 w-4 rotate-90" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <StarRow rating={r.rating} />
                <span className="text-sm font-semibold text-ink">{r.author}</span>
                {r.role && <span className="text-xs text-muted">· {r.role}</span>}
                {fmt(r.reviewDate) && <span className="text-xs text-faint">· {fmt(r.reviewDate)}</span>}
              </div>
              <div className="mt-1 line-clamp-2 text-sm text-body">{r.body}</div>
            </div>
            <button aria-label={r.visible ? 'Hide' : 'Show'} onClick={() => toggleVisible(r)} className="text-muted hover:text-ink">
              <Icon name="eye" className="h-4 w-4" />
            </button>
            <button aria-label="Edit" onClick={() => setEditing({ ...r })} className="text-muted hover:text-ink">
              <Icon name="edit" className="h-4 w-4" />
            </button>
            <button aria-label="Delete" onClick={() => remove(r)} className="text-red-500 hover:text-red-600">
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="px-4 py-6 text-sm text-faint">No reviews yet. Add your best real Google reviews below.</div>
        )}
      </Card>

      {editing ? (
        <Card className="space-y-4 p-4">
          <div className="text-sm font-semibold text-ink">{editing.id ? 'Edit review' : 'New review'}</div>
          <Field label="Review text" hint="Paste the review exactly as written on Google.">
            <textarea rows={4} className={inputClass} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reviewer name">
              <input className={inputClass} value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} />
            </Field>
            <Field label="Role / company" hint="optional, e.g. Owner, Glenwood Kitchen">
              <input className={inputClass} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Stars">
              <select
                className={inputClass}
                value={editing.rating}
                onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date" hint="optional">
              <input type="date" className={inputClass} value={editing.reviewDate} onChange={(e) => setEditing({ ...editing, reviewDate: e.target.value })} />
            </Field>
            <Field label="Source">
              <input className={inputClass} value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-body">
            <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
            Show on the site
          </label>
          <div className="flex gap-2">
            <Button variant="primary" loading={saving} onClick={save}>
              Save
            </Button>
            <Button variant="subtle" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="ghost" icon="plus" onClick={() => setEditing({ ...blank })}>
          Add a review
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function SettingsTab({
  settings,
  setSettings,
  toast,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  toast: Toast;
}) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setDraft((s) => ({ ...s, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/reviews/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data.settings);
      setDraft(data.settings);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="space-y-4 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-body">
          <input type="checkbox" checked={draft.visible} onChange={(e) => set('visible', e.target.checked)} />
          Show the reviews section on the site
        </label>
        <Field label="Heading">
          <input className={inputClass} value={draft.heading} onChange={(e) => set('heading', e.target.value)} />
        </Field>
        <Field label="Intro line" hint="optional — a sentence under the heading">
          <input className={inputClass} value={draft.intro} onChange={(e) => set('intro', e.target.value)} />
        </Field>
        <Field label="Google reviews link" hint="URL people land on to read/write all your Google reviews">
          <input className={inputClass} placeholder="https://g.page/r/…/review" value={draft.reviewsUrl} onChange={(e) => set('reviewsUrl', e.target.value)} />
        </Field>
      </Card>

      <Card className="space-y-4 p-4">
        <div className="text-sm font-semibold text-ink">Overall Google rating</div>
        <p className="text-xs text-muted">
          Optional. If you fill both in, the site shows this rating and it&apos;s marked up for search engines. Use your{' '}
          <strong>true Google average across all reviews</strong> — not just the ones featured above. Leave blank to show the
          quotes without an overall score.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Average rating" hint="0–5, e.g. 4.9">
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={inputClass}
              value={draft.aggregateRating ?? ''}
              onChange={(e) => set('aggregateRating', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Total number of reviews" hint="e.g. 27">
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              value={draft.reviewCount ?? ''}
              onChange={(e) => set('reviewCount', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Field>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-hairline bg-paper/90 px-1 py-3 backdrop-blur">
        <Button variant="primary" loading={saving} onClick={save}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
