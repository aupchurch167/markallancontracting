'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomepagePhotos } from './HomepagePhotos';
import { ContentManager } from './ContentManager';
import { MarkdownBody } from '@/components/MarkdownBody';

type ContentType = 'post' | 'project';


interface Content {
  title: string;
  slug: string;
  excerpt?: string;
  cluster?: string;
  tags?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  bodyMarkdown?: string;
  clientType?: string;
  scopeSummary?: string;
  timeline?: string;
  squareFootage?: string;
  metaTitle: string;
  metaDescription: string;
  coverImageUrl?: string;
}

const CLUSTERS = [
  { label: 'Cost & Budget', value: 'cost-budget' },
  { label: 'Process & Timeline', value: 'process-timeline' },
  { label: 'Broker & PM Resources', value: 'broker-pm' },
  { label: 'Ground-up Authority', value: 'ground-up' },
];

const inputClass =
  'mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-navy">{label}</span>
      {children}
    </label>
  );
}

/**
 * Single-pane Markdown body editor with a Write/Preview toggle. In preview,
 * ![](photo:N) placeholders are swapped for local thumbnails so placed photos
 * show before publishing (they resolve to R2 URLs on save).
 */
function MarkdownField({
  value,
  onChange,
  imagePreviews,
}: {
  value: string;
  onChange: (v: string) => void;
  imagePreviews: string[];
}) {
  const [preview, setPreview] = useState(false);
  const previewMarkdown = value.replace(
    /\(photo:(\d+)\)/g,
    (_m, i) => `(${imagePreviews[Number(i)] || ''})`,
  );
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-navy">Body (Markdown)</span>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`rounded px-2 py-1 font-medium ${!preview ? 'bg-navy text-white' : 'text-stone-500'}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`rounded px-2 py-1 font-medium ${preview ? 'bg-navy text-white' : 'text-stone-500'}`}
          >
            Preview
          </button>
        </div>
      </div>
      {preview ? (
        <div className="min-h-[400px] rounded-md border border-stone-200 bg-white p-5">
          <MarkdownBody>{previewMarkdown}</MarkdownBody>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          className="min-h-[400px] w-full rounded-md border border-stone-200 px-3 py-2 font-mono text-sm leading-relaxed text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      )}
    </div>
  );
}

export function AdminConsole() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<'content' | 'homepage' | 'manage'>('content');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>('post');
  const [brief, setBrief] = useState('');
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  // SEO / targeting inputs (posts). Blank = the model chooses editorially.
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [reader, setReader] = useState('');
  const [searchIntent, setSearchIntent] = useState('');
  const [length, setLength] = useState('');

  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineNotes, setRefineNotes] = useState('');
  const [coverPrompt, setCoverPrompt] = useState('');
  const [coverBusy, setCoverBusy] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ url: string } | null>(null);

  function patch(p: Partial<Content>) {
    setContent((c) => (c ? { ...c, ...p } : c));
  }

  // Object-URL previews for attached photos, indexed to match imageIndex
  // (image files only, in order). Used to show placed photos in the editor.
  const imageFiles = useMemo(() => files.filter((f) => f.type.startsWith('image/')), [files]);
  const imagePreviews = useMemo(
    () => imageFiles.map((f) => URL.createObjectURL(f)),
    [imageFiles],
  );
  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  }

  async function generate() {
    setError('');
    setResult(null);
    if (brief.trim().length < 10) {
      setError('Write a brief of at least a sentence first.');
      return;
    }
    setGenerating(true);
    try {
      const fd = new FormData();
      fd.set('contentType', contentType);
      fd.set('brief', brief);
      fd.set('context', context);
      if (contentType === 'post') {
        fd.set('primaryKeyword', primaryKeyword);
        fd.set('secondaryKeywords', secondaryKeywords);
        fd.set('reader', reader);
        fd.set('searchIntent', searchIntent);
        fd.set('length', length);
      }
      files.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/admin/generate', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      setContent(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function refine() {
    if (!content) return;
    setError('');
    setRefining(true);
    try {
      const res = await fetch('/api/admin/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, content, notes: refineNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refine failed.');
      setContent(data.content);
      setRefineNotes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refine failed.');
    } finally {
      setRefining(false);
    }
  }

  async function generateCover() {
    if (!content) return;
    setError('');
    const subject =
      coverPrompt.trim() ||
      [content.title, content.excerpt].filter(Boolean).join(' — ') ||
      content.title;
    setCoverBusy(true);
    try {
      const res = await fetch('/api/admin/cover/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cover generation failed.');
      patch({ coverImageUrl: data.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cover generation failed.');
    } finally {
      setCoverBusy(false);
    }
  }

  async function uploadCover(file: File | null) {
    if (!content || !file) return;
    setError('');
    setCoverBusy(true);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await fetch('/api/admin/cover/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      patch({ coverImageUrl: data.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setCoverBusy(false);
    }
  }

  async function loadForEdit(type: ContentType, id: string) {
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/admin/content/${type}/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load.');
      setContentType(type);
      setContent(data.content);
      setEditingId(id);
      setFiles([]);
      setView('content');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
    }
  }

  async function publish() {
    if (!content) return;
    setError('');
    setPublishing(true);
    try {
      // Editing an existing item → update (preserves images/attachments).
      if (editingId) {
        const res = await fetch(`/api/admin/content/${contentType}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Save failed.');
        setResult({ url: data.url });
        return;
      }
      const fd = new FormData();
      fd.set('contentType', contentType);
      fd.set('content', JSON.stringify(content));
      files.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/admin/publish', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setResult({ url: data.url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setPublishing(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-navy">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">Content console</h1>
            <p className="text-xs text-stone-300">Draft posts and projects with Claude → Sanity</p>
          </div>
          <button onClick={logout} className="text-sm text-stone-300 hover:text-white">
            Sign out
          </button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-6">
          {([
            { id: 'content', label: 'Create content' },
            { id: 'manage', label: 'Manage' },
            { id: 'homepage', label: 'Home page photos' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === 'content' && view !== 'content') {
                  setContent(null);
                  setEditingId(null);
                  setResult(null);
                }
                setView(t.id);
              }}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                view === t.id
                  ? 'border-white text-white'
                  : 'border-transparent text-stone-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {view === 'homepage' && (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <HomepagePhotos />
        </div>
      )}

      {view === 'manage' && (
        <div className="mx-auto max-w-5xl px-6 py-8">
          <ContentManager onEdit={loadForEdit} />
        </div>
      )}

      {view === 'content' && (
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Step 1 — brief + attachments */}
        {!content && (
        <section className="space-y-5">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex gap-2">
              {(['post', 'project'] as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setContentType(t);
                    setContent(null);
                    setEditingId(null);
                    setResult(null);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                    contentType === t ? 'bg-navy text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {t === 'post' ? 'Blog post' : 'Project'}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Brief — what should this be about?">
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder={
                    contentType === 'post'
                      ? 'e.g. Explain how tenant improvement allowances work for first-time commercial tenants.'
                      : 'e.g. 2,400 sq ft Pilates studio buildout in Kennesaw — open ceiling, new HVAC, finished in 9 weeks.'
                  }
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
              </Field>

              {contentType === 'post' && (
                <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    SEO &amp; targeting <span className="font-normal normal-case">(optional — blank lets Claude choose)</span>
                  </div>
                  <Field label="Primary keyword">
                    <input
                      className={inputClass}
                      placeholder="e.g. commercial build-out process"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                    />
                  </Field>
                  <Field label="Secondary keywords (comma separated)">
                    <input
                      className={inputClass}
                      placeholder="tenant improvement cost, office renovation timeline…"
                      value={secondaryKeywords}
                      onChange={(e) => setSecondaryKeywords(e.target.value)}
                    />
                  </Field>
                  <Field label="Reader — who is this for?">
                    <input
                      className={inputClass}
                      placeholder="e.g. a franchise owner opening a second location, worried about the schedule"
                      value={reader}
                      onChange={(e) => setReader(e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Search intent">
                      <select
                        className={inputClass}
                        value={searchIntent}
                        onChange={(e) => setSearchIntent(e.target.value)}
                      >
                        <option value="">Auto</option>
                        <option value="informational">Informational</option>
                        <option value="commercial investigation">Commercial investigation</option>
                        <option value="transactional">Transactional</option>
                      </select>
                    </Field>
                    <Field label="Length">
                      <select
                        className={inputClass}
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                      >
                        <option value="">Auto</option>
                        <option value="guide">Guide (1,200–1,600)</option>
                        <option value="single">Single question (700–1,000)</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              <Field label="Facts supplied (optional)">
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Real numbers, project names, jurisdictions, timelines — the only specifics Claude may state as fact. Anything missing becomes a [VERIFY:] note instead of a guess."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </Field>

              <div>
                <span className="text-sm font-medium text-navy">
                  Attachments (images + PDFs)
                </span>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                  className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy hover:file:bg-stone-200"
                  onChange={(e) => addFiles(e.target.files)}
                />
                <p className="mt-1 text-xs text-stone-400">
                  Images become the post hero / project gallery. PDFs and images are read
                  as reference for the write-up. Max 8 files, 12MB each.
                </p>
                {files.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded bg-stone-50 px-2 py-1 text-xs text-stone-600"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="ml-2 text-red-600 hover:underline"
                        >
                          remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <button
                onClick={generate}
                disabled={generating}
                className="btn-call w-full justify-center disabled:opacity-60"
              >
                {generating ? 'Generating…' : 'Generate with Claude'}
              </button>
            </div>
          </div>
        </section>
        )}

        {/* Step 2 — review & edit (full width, replaces the form) */}
        {content && (
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => {
              const wasEditing = editingId;
              setResult(null);
              setContent(null);
              setEditingId(null);
              if (wasEditing) setView('manage');
            }}
            className="text-sm font-medium text-stone-500 hover:text-navy"
          >
            {editingId ? '← Back to Manage' : '← Back to the form'}
          </button>

          {result ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Published.</p>
              <p className="mt-1">It&apos;s live on the site:</p>
              <a
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-semibold text-navy underline"
              >
                View it live →
              </a>
            </div>
          ) : null}

          <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-navy">Review &amp; edit</h2>
              <span className="text-xs text-stone-400">Edits save with the draft</span>
            </div>

              {/* Refine with Claude — rewrite the current draft from a note */}
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Refine with Claude
                </div>
                <textarea
                  rows={2}
                  className={inputClass}
                  placeholder="How should it change? e.g. “Make it punchier, add a section on permitting, cut the intro.”"
                  value={refineNotes}
                  onChange={(e) => setRefineNotes(e.target.value)}
                />
                <button
                  onClick={refine}
                  disabled={refining}
                  className="btn-ghost mt-2 text-sm disabled:opacity-60"
                >
                  {refining ? 'Rewriting…' : 'Rewrite draft'}
                </button>
              </div>

              {/* Header image (posts) — upload a real photo, or generate one */}
              {contentType === 'post' && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Header image
                  </div>
                  {content.coverImageUrl ? (
                    <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-md bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={content.coverImageUrl}
                        alt="Header"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => patch({ coverImageUrl: undefined })}
                        className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}

                  {/* Upload a real photo */}
                  <label className="mt-2 block">
                    <span className="text-xs font-medium text-stone-500">
                      Upload a photo{content.coverImageUrl ? ' (replaces the current header)' : ''}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      disabled={coverBusy}
                      className="mt-1 block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy hover:file:bg-stone-200"
                      onChange={(e) => uploadCover(e.target.files?.[0] || null)}
                    />
                  </label>

                  {/* Or generate one with AI */}
                  <div className="mt-3 border-t border-stone-200 pt-3">
                    <span className="text-xs font-medium text-stone-500">Or generate one with AI</span>
                    <textarea
                      rows={2}
                      className={inputClass}
                      placeholder="Describe the header (optional — defaults to the title). e.g. “A finished open-plan office buildout, warm daylight.”"
                      value={coverPrompt}
                      onChange={(e) => setCoverPrompt(e.target.value)}
                    />
                    <button
                      onClick={generateCover}
                      disabled={coverBusy}
                      className="btn-ghost mt-2 text-sm disabled:opacity-60"
                    >
                      {coverBusy ? 'Working…' : 'Generate with AI'}
                    </button>
                  </div>
                </div>
              )}

              <Field label="Title">
                <input
                  className={inputClass}
                  value={content.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </Field>
              <Field label="Slug">
                <input
                  className={inputClass}
                  value={content.slug}
                  onChange={(e) => patch({ slug: e.target.value })}
                />
              </Field>

              {contentType === 'post' ? (
                <>
                  <Field label="Excerpt">
                    <textarea
                      rows={2}
                      className={inputClass}
                      value={content.excerpt || ''}
                      onChange={(e) => patch({ excerpt: e.target.value })}
                    />
                  </Field>
                  <Field label="Cluster">
                    <select
                      className={inputClass}
                      value={content.cluster || ''}
                      onChange={(e) => patch({ cluster: e.target.value })}
                    >
                      {CLUSTERS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Tags (comma separated)">
                    <input
                      className={inputClass}
                      value={(content.tags || []).join(', ')}
                      onChange={(e) =>
                        patch({
                          tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                        })
                      }
                    />
                  </Field>
                  {imagePreviews.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-navy">
                        Attached photos — reference in the body as{' '}
                        <code className="rounded bg-stone-100 px-1 text-xs">![caption](photo:0)</code>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="w-24">
                            <div className="relative aspect-[4/3] overflow-hidden rounded bg-stone-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="mt-0.5 text-center text-[10px] text-stone-500">
                              photo:{i}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <MarkdownField
                    value={content.bodyMarkdown || ''}
                    onChange={(bodyMarkdown) => patch({ bodyMarkdown })}
                    imagePreviews={imagePreviews}
                  />
                </>
              ) : (
                <>
                  <Field label="Client type">
                    <input
                      className={inputClass}
                      value={content.clientType || ''}
                      onChange={(e) => patch({ clientType: e.target.value })}
                    />
                  </Field>
                  <Field label="Scope summary">
                    <textarea
                      rows={2}
                      className={inputClass}
                      value={content.scopeSummary || ''}
                      onChange={(e) => patch({ scopeSummary: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Timeline">
                      <input
                        className={inputClass}
                        value={content.timeline || ''}
                        onChange={(e) => patch({ timeline: e.target.value })}
                      />
                    </Field>
                    <Field label="Square footage">
                      <input
                        className={inputClass}
                        value={content.squareFootage || ''}
                        onChange={(e) => patch({ squareFootage: e.target.value })}
                      />
                    </Field>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-navy">
                        Attached photos — reference in the body as{' '}
                        <code className="rounded bg-stone-100 px-1 text-xs">![caption](photo:0)</code>
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="w-24">
                            <div className="relative aspect-[4/3] overflow-hidden rounded bg-stone-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="mt-0.5 text-center text-[10px] text-stone-500">
                              photo:{i}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <MarkdownField
                    value={content.bodyMarkdown || ''}
                    onChange={(bodyMarkdown) => patch({ bodyMarkdown })}
                    imagePreviews={imagePreviews}
                  />
                </>
              )}

              <Field label="Meta title">
                <input
                  className={inputClass}
                  value={content.metaTitle}
                  onChange={(e) => patch({ metaTitle: e.target.value })}
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={content.metaDescription}
                  onChange={(e) => patch({ metaDescription: e.target.value })}
                />
              </Field>

              {(() => {
                const n = (content.bodyMarkdown?.match(/\[VERIFY:/g) || []).length;
                return n > 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="font-semibold">{n} [VERIFY:] item{n === 1 ? '' : 's'} still in the body.</span>{' '}
                    Fill in or remove them before this goes live — search the body for
                    <code className="mx-1 rounded bg-amber-100 px-1">[VERIFY:</code>. The draft
                    saves either way.
                  </div>
                ) : null;
              })()}

              <button
                onClick={publish}
                disabled={publishing}
                className="btn-call w-full justify-center disabled:opacity-60"
              >
                {publishing ? 'Saving…' : editingId ? 'Save changes' : 'Publish'}
              </button>
            </div>
        </section>
        )}
      </div>
      )}
    </main>
  );
}
