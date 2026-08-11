'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Button, Card, Field, StatusBadge, Spinner, Icon, inputClass, useToast } from './ui';

/**
 * Links page management, folded into the main admin console (light theme, same
 * primitives as Posts/Projects). Four tabs — Links, Updates, Profile, Leads —
 * mirror the handoff's admin design, but as a seamless part of this console
 * rather than a separate dark app. Saves are immediate (no staged publish).
 */

interface LinkButton {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  icon: string;
  visible: boolean;
  sortOrder: number;
  clickCount: number;
}
interface LinkUpdate {
  id: string;
  body: string;
  imageUrl: string | null;
  status: 'draft' | 'published';
  postedAt: string;
}
interface LinkLead {
  id: string;
  name: string;
  phone: string;
  projectType: string;
  notes: string;
  status: string;
  createdAt: string;
}
interface Social {
  label: string;
  href: string;
  icon: string;
}
interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
interface Sections {
  updates: boolean;
  testimonials: boolean;
  map: boolean;
  contact: boolean;
  signup: boolean;
  stickyCall: boolean;
}
interface Profile {
  name: string;
  tagline: string;
  blurb: string;
  since: string;
  avatarUrl: string;
  socials: Social[];
  testimonials: Testimonial[];
  sections: Sections;
  area: { note: string; bbox: string };
}

const ICON_OPTIONS = [
  { value: 'phone', label: 'Phone' },
  { value: 'calendar-check', label: 'Calendar' },
  { value: 'file-text', label: 'Document' },
  { value: 'envelope', label: 'Email' },
  { value: 'buildings', label: 'Buildings' },
  { value: 'globe', label: 'Website' },
  { value: 'link', label: 'Link' },
];
const LEAD_STATUSES = ['New', 'Called', 'Walkthrough set', 'Quoted', 'Closed'];
const SECTION_LABELS: [keyof Sections, string][] = [
  ['updates', 'Updates feed'],
  ['testimonials', 'Testimonials'],
  ['map', 'Service-area map'],
  ['contact', 'Contact form'],
  ['signup', 'Email signup'],
  ['stickyCall', 'Sticky call bar'],
];

type Tab = 'links' | 'updates' | 'profile' | 'leads';

function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.set('file', file);
  const res = await fetch('/api/admin/cover/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed.');
  return data.url as string;
}

export function LinksManager() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('links');
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [buttons, setButtons] = useState<LinkButton[]>([]);
  const [updates, setUpdates] = useState<LinkUpdate[]>([]);
  const [leads, setLeads] = useState<LinkLead[]>([]);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/links');
      const data = await res.json();
      if (data.configured === false) {
        setConfigured(false);
      } else if (res.ok) {
        setConfigured(true);
        setProfile(data.profile);
        setButtons(data.buttons || []);
        setUpdates(data.updates || []);
        setLeads(data.leads || []);
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
      <div className="flex justify-center py-24 text-stone-400">
        <Spinner />
      </div>
    );
  }
  if (!configured) {
    return (
      <Card className="p-6 text-sm text-stone-500">
        The CMS database isn&apos;t configured, so the Links page can&apos;t be managed here yet.
      </Card>
    );
  }

  const TABS: [Tab, string][] = [
    ['links', 'Links'],
    ['updates', 'Updates'],
    ['profile', 'Profile'],
    ['leads', `Leads${leads.length ? ` (${leads.length})` : ''}`],
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-navy">Links page</h1>
        <a href="/links" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-700">
          View live page <Icon name="external" className="h-4 w-4" />
        </a>
      </div>
      <p className="mb-5 text-sm text-stone-500">macont.com/links — your link-in-bio page. Changes save immediately and go live.</p>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-stone-200">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'border-accent text-navy' : 'border-transparent text-stone-500 hover:text-navy'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'links' && <LinksTab buttons={buttons} setButtons={setButtons} reload={reload} toast={toast} />}
      {tab === 'updates' && <UpdatesTab updates={updates} reload={reload} toast={toast} />}
      {tab === 'profile' && profile && <ProfileTab profile={profile} setProfile={setProfile} toast={toast} />}
      {tab === 'leads' && <LeadsTab leads={leads} reload={reload} toast={toast} />}
    </div>
  );
}

type Toast = ReturnType<typeof useToast>;

// ---------------------------------------------------------------------------
function LinksTab({
  buttons,
  setButtons,
  reload,
  toast,
}: {
  buttons: LinkButton[];
  setButtons: (b: LinkButton[]) => void;
  reload: () => Promise<void>;
  toast: Toast;
}) {
  const blank = { id: '', label: '', sublabel: '', href: '', icon: 'link', visible: true };
  const [editing, setEditing] = useState<typeof blank | null>(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next: LinkButton[]) {
    setButtons(next);
    try {
      await fetch('/api/admin/links/buttons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: next.map((b) => b.id) }),
      });
    } catch {
      toast.error('Could not save order.');
    }
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= buttons.length) return;
    const next = [...buttons];
    [next[i], next[j]] = [next[j], next[i]];
    persistOrder(next);
  }

  async function toggleVisible(b: LinkButton) {
    try {
      await fetch('/api/admin/links/buttons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...b, visible: !b.visible }),
      });
      reload();
    } catch {
      toast.error('Could not update.');
    }
  }

  async function save() {
    if (!editing?.label.trim() || !editing.href.trim()) {
      toast.error('Label and URL are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/links/buttons', {
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

  async function remove(b: LinkButton) {
    if (!window.confirm(`Delete "${b.label}"?`)) return;
    try {
      await fetch('/api/admin/links/buttons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id }),
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
        <h2 className="text-lg font-bold text-navy">Buttons</h2>
        <span className="text-xs text-stone-400">Reorder with the arrows · toggle the eye to hide</span>
      </div>

      <Card className="divide-y divide-stone-100 p-0">
        {buttons.map((b, i) => (
          <div key={b.id} className={`flex items-center gap-3 px-4 py-3 ${b.visible ? '' : 'opacity-55'}`}>
            <div className="flex flex-col">
              <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="text-stone-400 hover:text-navy disabled:opacity-30">
                <Icon name="chevron" className="h-4 w-4 -rotate-90" />
              </button>
              <button aria-label="Move down" disabled={i === buttons.length - 1} onClick={() => move(i, 1)} className="text-stone-400 hover:text-navy disabled:opacity-30">
                <Icon name="chevron" className="h-4 w-4 rotate-90" />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-navy">{b.label}</div>
              <div className="truncate text-xs text-stone-400">{b.href}</div>
            </div>
            <span className="hidden items-center gap-1 text-xs text-stone-400 sm:flex" title="Clicks">
              <Icon name="external" className="h-3.5 w-3.5" />
              {b.clickCount}
            </span>
            <button aria-label={b.visible ? 'Hide' : 'Show'} onClick={() => toggleVisible(b)} className="text-stone-500 hover:text-navy">
              <Icon name="eye" className="h-4 w-4" />
            </button>
            <button aria-label="Edit" onClick={() => setEditing({ ...b })} className="text-stone-500 hover:text-navy">
              <Icon name="edit" className="h-4 w-4" />
            </button>
            <button aria-label="Delete" onClick={() => remove(b)} className="text-red-500 hover:text-red-600">
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
        {buttons.length === 0 && <div className="px-4 py-6 text-sm text-stone-400">No buttons yet.</div>}
      </Card>

      {editing ? (
        <Card className="space-y-4 p-4">
          <div className="text-sm font-semibold text-navy">{editing.id ? 'Edit button' : 'New button'}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label">
              <input className={inputClass} value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
            </Field>
            <Field label="Icon">
              <select className={inputClass} value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Sublabel" hint="the small line under the label">
            <input className={inputClass} value={editing.sublabel} onChange={(e) => setEditing({ ...editing, sublabel: e.target.value })} />
          </Field>
          <Field label="URL" hint="tel:…, mailto:…, or https://…">
            <input className={inputClass} value={editing.href} onChange={(e) => setEditing({ ...editing, href: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
            Visible on the page
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
          Add a button
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
function UpdatesTab({ updates, reload, toast }: { updates: LinkUpdate[]; reload: () => Promise<void>; toast: Toast }) {
  const [id, setId] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setId('');
    setBody('');
    setImageUrl(null);
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      setImageUrl(await uploadPhoto(file));
      toast.success('Photo added.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function save(status: 'draft' | 'published') {
    if (!body.trim()) {
      toast.error('Write something first.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/links/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id || undefined, body, imageUrl, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(status === 'published' ? 'Posted.' : 'Saved as draft.');
      reset();
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  function edit(u: LinkUpdate) {
    setId(u.id);
    setBody(u.body);
    setImageUrl(u.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(u: LinkUpdate) {
    if (!window.confirm('Delete this update?')) return;
    try {
      await fetch('/api/admin/links/updates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id }),
      });
      toast.success('Deleted.');
      if (u.id === id) reset();
      reload();
    } catch {
      toast.error('Delete failed.');
    }
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-3 border-dashed p-4">
        <div className="text-sm font-semibold text-navy">{id ? 'Edit update' : 'New update'}</div>
        <textarea
          rows={3}
          className={inputClass}
          placeholder="What happened on the jobsite today?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {imageUrl && (
          <div className="relative w-40 overflow-hidden rounded-md border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="h-24 w-full object-cover" />
            <button onClick={() => setImageUrl(null)} className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              Remove
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer text-sm font-medium text-accent hover:text-accent-700">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="image" className="h-4 w-4" />
              {uploading ? 'Uploading…' : imageUrl ? 'Replace photo' : 'Add photo'}
            </span>
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onPhoto(e.target.files?.[0] || null)} />
          </label>
          <span className="flex-1" />
          {id && (
            <Button variant="subtle" onClick={reset}>
              Cancel
            </Button>
          )}
          <Button variant="ghost" loading={busy} onClick={() => save('draft')}>
            Save draft
          </Button>
          <Button variant="primary" loading={busy} onClick={() => save('published')}>
            {id ? 'Save & post' : 'Post'}
          </Button>
        </div>
      </Card>

      <Card className="divide-y divide-stone-100 p-0">
        {updates.map((u) => (
          <div key={u.id} className="flex items-start gap-3 px-4 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100">
              {u.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-300">
                  <Icon name="image" className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-stone-400">
                {fmt(u.postedAt)} <StatusBadge status={u.status} />
              </div>
              <div className="mt-0.5 line-clamp-2 text-sm text-ink">{u.body}</div>
            </div>
            <button aria-label="Edit" onClick={() => edit(u)} className="text-stone-500 hover:text-navy">
              <Icon name="edit" className="h-4 w-4" />
            </button>
            <button aria-label="Delete" onClick={() => remove(u)} className="text-red-500 hover:text-red-600">
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </div>
        ))}
        {updates.length === 0 && <div className="px-4 py-6 text-sm text-stone-400">No updates yet.</div>}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
function ProfileTab({ profile, setProfile, toast }: { profile: Profile; setProfile: (p: Profile) => void; toast: Toast }) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setDraft((p) => ({ ...p, [k]: v }));
  }

  async function onLogo(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      set('avatarUrl', url);
      toast.success('Logo uploaded — save to publish.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/links/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setProfile(data.profile);
      toast.success('Profile saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  const testimonials = draft.testimonials || [];

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="space-y-4 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-50">
            {draft.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-stone-400">MAC</span>
            )}
          </div>
          <label className="cursor-pointer text-sm font-medium text-accent hover:text-accent-700">
            {uploading ? 'Uploading…' : draft.avatarUrl ? 'Replace logo' : 'Upload logo'}
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onLogo(e.target.files?.[0] || null)} />
          </label>
        </div>
        <Field label="Business name">
          <input className={inputClass} value={draft.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Tagline">
          <input className={inputClass} value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </Field>
        <Field label="Intro paragraph">
          <textarea rows={3} className={inputClass} value={draft.blurb} onChange={(e) => set('blurb', e.target.value)} />
        </Field>
        <Field label="Badge" hint='e.g. "Est. 1998"'>
          <input className={inputClass} value={draft.since} onChange={(e) => set('since', e.target.value)} />
        </Field>
      </Card>

      <Card className="space-y-3 p-4">
        <div className="text-sm font-semibold text-navy">Sections shown on the page</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {SECTION_LABELS.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={draft.sections[key]}
                onChange={(e) => set('sections', { ...draft.sections, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
        {draft.sections.testimonials && testimonials.length === 0 && (
          <p className="text-xs text-amber-600">Add at least one real testimonial below, or the section stays empty.</p>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="text-sm font-semibold text-navy">Social links</div>
        {draft.socials.map((s, i) => (
          <div key={s.icon} className="grid grid-cols-[90px_1fr] items-center gap-3">
            <span className="text-sm capitalize text-stone-500">{s.label}</span>
            <input
              className={inputClass}
              placeholder="https://…  (leave blank to hide)"
              value={s.href}
              onChange={(e) => {
                const next = [...draft.socials];
                next[i] = { ...s, href: e.target.value };
                set('socials', next);
              }}
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-navy">Testimonials</div>
          <Button variant="ghost" size="sm" icon="plus" onClick={() => set('testimonials', [...testimonials, { quote: '', name: '', role: '' }])}>
            Add
          </Button>
        </div>
        {testimonials.length === 0 && <p className="text-xs text-stone-400">None yet. Only ship real quotes.</p>}
        {testimonials.map((t, i) => (
          <div key={i} className="space-y-2 rounded-md border border-stone-200 p-3">
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Quote"
              value={t.quote}
              onChange={(e) => {
                const next = [...testimonials];
                next[i] = { ...t, quote: e.target.value };
                set('testimonials', next);
              }}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Name"
                value={t.name}
                onChange={(e) => {
                  const next = [...testimonials];
                  next[i] = { ...t, name: e.target.value };
                  set('testimonials', next);
                }}
              />
              <input
                className={inputClass}
                placeholder="Role (e.g. Owner, Glenwood Kitchen)"
                value={t.role}
                onChange={(e) => {
                  const next = [...testimonials];
                  next[i] = { ...t, role: e.target.value };
                  set('testimonials', next);
                }}
              />
            </div>
            <button onClick={() => set('testimonials', testimonials.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:underline">
              Remove
            </button>
          </div>
        ))}
      </Card>

      <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-stone-200 bg-stone-50/90 px-1 py-3 backdrop-blur">
        <Button variant="primary" loading={saving} onClick={save}>
          Save profile
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
function LeadsTab({ leads, reload, toast }: { leads: LinkLead[]; reload: () => Promise<void>; toast: Toast }) {
  const [open, setOpen] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    try {
      await fetch('/api/admin/links/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      reload();
    } catch {
      toast.error('Could not update status.');
    }
  }
  async function remove(id: string) {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await fetch('/api/admin/links/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
        <h2 className="text-lg font-bold text-navy">Leads</h2>
        <a href="/api/admin/links/leads?format=csv" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-navy">
          <Icon name="download" className="h-4 w-4" /> Export CSV
        </a>
      </div>

      {leads.length === 0 ? (
        <Card className="p-6 text-sm text-stone-400">No leads yet. Submissions from the /links contact form land here.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-400">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">Project</th>
                <th className="px-4 py-2 font-medium">Came in</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {leads.map((l) => (
                <Fragment key={l.id}>
                  <tr className="align-top">
                    <td className="px-4 py-2.5 font-medium text-navy">
                      <button onClick={() => setOpen(open === l.id ? null : l.id)} className="hover:text-accent">
                        {l.name || '—'}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <a href={`tel:${l.phone}`} className="text-stone-600 hover:text-accent">
                        {l.phone}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-stone-600">{l.projectType || '—'}</td>
                    <td className="px-4 py-2.5 text-stone-400">{fmt(l.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={l.status}
                        onChange={(e) => setStatus(l.id, e.target.value)}
                        className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button aria-label="Delete" onClick={() => remove(l.id)} className="text-red-500 hover:text-red-600">
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {open === l.id && l.notes && (
                    <tr>
                      <td colSpan={6} className="bg-stone-50 px-4 py-3 text-sm text-stone-600">
                        <span className="font-medium text-stone-500">Notes:</span> {l.notes}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-xs text-stone-400">
        Leads are stored here and never lost. Email/SMS forwarding to hello@macont.com needs an email provider wired up (not yet
        configured) — until then, check this tab or export the CSV.
      </p>
    </div>
  );
}
