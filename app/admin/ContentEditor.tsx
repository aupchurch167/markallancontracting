'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownBody } from '@/components/MarkdownBody';
import {
  Button,
  Card,
  Field,
  Icon,
  Spinner,
  StatusBadge,
  inputClass,
  useToast,
  type EditorTarget,
} from './ui';
import { PhotoChoiceModal, type PhotoResult } from './PhotoChoiceModal';

type PhotoTarget =
  | { kind: 'cover' }
  | { kind: 'gallery-add' }
  | { kind: 'gallery-replace'; index: number };

interface EditorContent {
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
  cardQuote?: string;
  imageUrls?: { url: string; alt?: string }[];
  metaTitle: string;
  metaDescription: string;
  coverImageUrl?: string;
  gbpPost?: string;
  status?: string;
}

const CLUSTERS = [
  { label: 'Cost & Budget', value: 'cost-budget' },
  { label: 'Process & Timeline', value: 'process-timeline' },
  { label: 'Broker & PM Resources', value: 'broker-pm' },
  { label: 'Ground-up Authority', value: 'ground-up' },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function ContentEditor({
  target,
  onDone,
  onBack,
}: {
  target: EditorTarget;
  onDone: () => void;
  onBack: () => void;
  onReload: () => void;
}) {
  const toast = useToast();
  const contentType = target.type;
  const editingId = target.mode === 'edit' ? target.id : undefined;

  const [content, setContent] = useState<EditorContent | null>(null);
  const [loading, setLoading] = useState(target.mode === 'edit');
  const [files, setFiles] = useState<File[]>([]);
  const slugManual = useRef(false);

  // Create-only brief + SEO inputs.
  const [brief, setBrief] = useState('');
  const [context, setContext] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [reader, setReader] = useState('');
  const [searchIntent, setSearchIntent] = useState('');
  const [length, setLength] = useState('');

  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineNotes, setRefineNotes] = useState('');
  const [coverPrompt, setCoverPrompt] = useState('');
  const [coverBusy, setCoverBusy] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoResult, setPhotoResult] = useState<PhotoResult | null>(null);
  const [photoTarget, setPhotoTarget] = useState<PhotoTarget>({ kind: 'cover' });
  const [saving, setSaving] = useState<'draft' | 'published' | null>(null);

  // Load existing content in edit mode.
  useEffect(() => {
    if (target.mode !== 'edit' || !target.id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/content/${target.type}/${target.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load.');
        if (active) {
          setContent(data.content);
          slugManual.current = true;
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [target, toast]);

  function patch(p: Partial<EditorContent>) {
    setContent((c) => (c ? { ...c, ...p } : c));
  }

  function onTitle(title: string) {
    setContent((c) => {
      if (!c) return c;
      const next = { ...c, title };
      if (!slugManual.current) next.slug = slugify(title);
      return next;
    });
  }

  const imageFiles = useMemo(() => files.filter((f) => f.type.startsWith('image/')), [files]);
  const imagePreviews = useMemo(() => imageFiles.map((f) => URL.createObjectURL(f)), [imageFiles]);
  useEffect(() => () => imagePreviews.forEach((u) => URL.revokeObjectURL(u)), [imagePreviews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  }

  async function generate() {
    if (brief.trim().length < 10) {
      toast.error('Write a brief of at least a sentence first.');
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
      slugManual.current = true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function refine() {
    if (!content) return;
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
      toast.success('Draft rewritten.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refine failed.');
    } finally {
      setRefining(false);
    }
  }

  async function generateCover() {
    if (!content) return;
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
      await persistCover(data.url, 'Cover generated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cover generation failed.');
    } finally {
      setCoverBusy(false);
    }
  }

  // When editing an existing item, save the cover to the database immediately so
  // it can't be lost by forgetting to click Save. On a new (unsaved) item, it's
  // held until Publish. Non-fatal: the preview stays either way.
  async function persistCover(url: string, verb: string) {
    if (!editingId) {
      toast.success(`${verb} — Publish to make it live.`);
      return;
    }
    try {
      const res = await fetch(`/api/admin/content/${contentType}/${editingId}/cover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImageUrl: url }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Save failed.');
      toast.success(`${verb} and saved — it's live now.`);
    } catch {
      toast.info(`${verb}. Click Save to apply it.`);
    }
  }

  // Run a photo (new upload or an already-uploaded image by URL) through the
  // align/crop + Gemini enhance + quality-check pipeline, then open the
  // before/after modal. photoTarget decides where the chosen version lands.
  async function processPhoto(opts: {
    file?: File;
    sourceUrl?: string;
    aspect: string;
    prefix: string;
    target: PhotoTarget;
  }) {
    setPhotoTarget(opts.target);
    setPhotoResult(null);
    setPhotoBusy(true);
    setPhotoModalOpen(true);
    try {
      const fd = new FormData();
      if (opts.file) fd.set('file', opts.file);
      if (opts.sourceUrl) fd.set('sourceUrl', opts.sourceUrl);
      fd.set('aspect', opts.aspect);
      fd.set('prefix', opts.prefix);
      const res = await fetch('/api/admin/photo/process', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed.');
      setPhotoResult(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Processing failed.');
      setPhotoModalOpen(false);
    } finally {
      setPhotoBusy(false);
    }
  }

  function uploadCover(file: File | null) {
    if (!content || !file) return;
    processPhoto({ file, aspect: '16:9', prefix: 'covers', target: { kind: 'cover' } });
  }
  function editCover() {
    if (!content?.coverImageUrl) return;
    processPhoto({ sourceUrl: content.coverImageUrl, aspect: '16:9', prefix: 'covers', target: { kind: 'cover' } });
  }
  function addGalleryPhoto(file: File | null) {
    if (!content || !file) return;
    processPhoto({ file, aspect: '4:3', prefix: 'projects', target: { kind: 'gallery-add' } });
  }
  function editGalleryPhoto(index: number, url: string) {
    processPhoto({ sourceUrl: url, aspect: '4:3', prefix: 'projects', target: { kind: 'gallery-replace', index } });
  }
  function removeGalleryPhoto(index: number) {
    patch({ imageUrls: (content?.imageUrls || []).filter((_, i) => i !== index) });
  }

  async function onChoosePhoto(url: string) {
    setPhotoModalOpen(false);
    const t = photoTarget;
    if (t.kind === 'cover') {
      patch({ coverImageUrl: url });
      await persistCover(url, 'Cover updated');
      return;
    }
    if (t.kind === 'gallery-add') {
      patch({ imageUrls: [...(content?.imageUrls || []), { url, alt: content?.title }] });
      toast.success('Added to gallery — Save to publish.');
      return;
    }
    // gallery-replace
    const next = [...(content?.imageUrls || [])];
    next[t.index] = { url, alt: next[t.index]?.alt || content?.title };
    patch({ imageUrls: next });
    toast.success('Photo updated — Save to publish.');
  }

  async function submit(status: 'draft' | 'published') {
    if (!content) return;
    if (!content.title?.trim() || !content.slug?.trim()) {
      toast.error('A title and slug are required.');
      return;
    }
    setSaving(status);
    try {
      const fd = new FormData();
      fd.set('content', JSON.stringify(content));
      fd.set('status', status);
      files.forEach((f) => fd.append('files', f));
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/content/${contentType}/${editingId}`, { method: 'PUT', body: fd });
      } else {
        fd.set('contentType', contentType);
        res = await fetch('/api/admin/publish', { method: 'POST', body: fd });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      toast.success(
        status === 'published'
          ? editingId
            ? 'Saved — live on the site.'
            : 'Published — live on the site.'
          : 'Saved as draft.',
      );
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(null);
    }
  }

  const verifyCount = (content?.bodyMarkdown?.match(/\[VERIFY:/g) || []).length;
  const wordCount = (content?.bodyMarkdown?.trim().match(/\S+/g) || []).length;
  const isPublished = content?.status === 'published';

  // ---- Loading / create-brief screens ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-faint">
        <Spinner />
      </div>
    );
  }

  if (!content) {
    // Create step 1 — brief.
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <BackLink onBack={onBack} label={`Back to ${contentType === 'post' ? 'posts' : 'projects'}`} />
        <div>
          <h1 className="font-display text-2xl font-bold uppercase text-ink">
            New {contentType === 'post' ? 'blog post' : 'project'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Give Claude a brief and any real facts. You&apos;ll review and edit everything before it
            goes live.
          </p>
        </div>

        <Card className="space-y-4 p-5">
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
            <div className="space-y-4 rounded-[2px] border border-hairline bg-paper p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                SEO &amp; targeting{' '}
                <span className="font-normal normal-case">(optional — blank lets Claude choose)</span>
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
                  <select className={inputClass} value={searchIntent} onChange={(e) => setSearchIntent(e.target.value)}>
                    <option value="">Auto</option>
                    <option value="informational">Informational</option>
                    <option value="commercial investigation">Commercial investigation</option>
                    <option value="transactional">Transactional</option>
                  </select>
                </Field>
                <Field label="Length">
                  <select className={inputClass} value={length} onChange={(e) => setLength(e.target.value)}>
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

          <FileInput
            label="Attachments (images + PDFs)"
            hint="Images become the hero / gallery; PDFs and images are read as reference. Max 8 files, 12MB each."
            files={files}
            onAdd={addFiles}
            onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          />

          <Button variant="primary" icon="sparkles" loading={generating} onClick={generate} className="w-full">
            {generating ? 'Generating…' : 'Generate with Claude'}
          </Button>
        </Card>
      </div>
    );
  }

  // ---- Editor ----
  return (
    <div className="mx-auto max-w-5xl">
      <PhotoChoiceModal
        open={photoModalOpen}
        busy={photoBusy}
        result={photoResult}
        onChoose={onChoosePhoto}
        onCancel={() => setPhotoModalOpen(false)}
      />
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 -mx-5 mb-6 flex items-center gap-3 border-b border-hairline bg-paper/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
          <Icon name="arrowLeft" className="h-4 w-4" />
          Back
        </button>
        <div className="ml-1 hidden items-center gap-2 sm:flex">
          {editingId ? <StatusBadge status={content.status || 'draft'} /> : (
            <span className="text-xs font-medium text-faint">New {contentType}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isPublished ? (
            <>
              <Button variant="ghost" loading={saving === 'draft'} onClick={() => submit('draft')}>
                Unpublish
              </Button>
              <Button variant="primary" icon="check" loading={saving === 'published'} onClick={() => submit('published')}>
                Save changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" loading={saving === 'draft'} onClick={() => submit('draft')}>
                Save draft
              </Button>
              <Button variant="primary" icon="check" loading={saving === 'published'} onClick={() => submit('published')}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Main column */}
        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <Field label="Title">
              <input className={inputClass} value={content.title} onChange={(e) => onTitle(e.target.value)} />
            </Field>
            <Field label="Slug" hint="the URL path">
              <input
                className={inputClass}
                value={content.slug}
                onChange={(e) => {
                  slugManual.current = true;
                  patch({ slug: e.target.value });
                }}
              />
            </Field>
          </Card>

          {/* Body photos */}
          <Card className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">
                Body photos — reference as{' '}
                <code className="rounded bg-paper-alt px-1 text-xs">![caption](photo:0)</code>
              </span>
              <label className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-maroon hover:text-maroon-dark">
                <Icon name="plus" className="h-4 w-4" /> Add photos
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
            </div>
            {imagePreviews.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="w-20">
                    <div className="relative aspect-[4/3] overflow-hidden rounded bg-paper-alt">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="mt-0.5 text-center text-[10px] text-muted">photo:{i}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-faint">
                Attach photos, then drop <code className="rounded bg-paper-alt px-1">![](photo:0)</code>{' '}
                where you want each one in the body below.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <MarkdownField
              value={content.bodyMarkdown || ''}
              onChange={(bodyMarkdown) => patch({ bodyMarkdown })}
              imagePreviews={imagePreviews}
              wordCount={wordCount}
            />
          </Card>

          {/* Gallery (projects) — each photo runs through the align/crop +
              enhance pipeline; existing photos can be re-edited or removed. */}
          {contentType === 'project' && (
            <Card className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Gallery</span>
                <label className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-maroon hover:text-maroon-dark">
                  <Icon name="plus" className="h-4 w-4" /> Add photo
                  <input
                    type="file"
                    accept="image/*"
                    disabled={photoBusy}
                    className="hidden"
                    onChange={(e) => {
                      addGalleryPhoto(e.target.files?.[0] || null);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {content.imageUrls && content.imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {content.imageUrls.map((img, i) => (
                    <div key={`${img.url}-${i}`} className="overflow-hidden rounded-[2px] border border-hairline">
                      <div className="relative aspect-[4/3] bg-paper-alt">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between px-2 py-1.5 text-xs">
                        <button
                          onClick={() => editGalleryPhoto(i, img.url)}
                          disabled={photoBusy}
                          className="font-medium text-ink hover:text-maroon disabled:opacity-50"
                        >
                          Edit / crop
                        </button>
                        <button onClick={() => removeGalleryPhoto(i)} className="text-red-600 hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-faint">
                  No gallery photos yet. Add photos — each is auto-cropped and can be AI-enhanced
                  before it&apos;s saved.
                </p>
              )}
            </Card>
          )}

          {/* Refine with Claude */}
          <Card className="space-y-2 bg-paper p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Icon name="sparkles" className="h-4 w-4 text-maroon" /> Refine with Claude
            </div>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="How should it change? e.g. “Make it punchier, add a section on permitting, cut the intro.”"
              value={refineNotes}
              onChange={(e) => setRefineNotes(e.target.value)}
            />
            <Button variant="ghost" size="sm" loading={refining} onClick={refine}>
              {refining ? 'Rewriting…' : 'Rewrite draft'}
            </Button>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-5">
          {verifyCount > 0 ? (
            <div className="rounded-[2px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <span className="font-semibold">
                {verifyCount} [VERIFY:] item{verifyCount === 1 ? '' : 's'} in the body.
              </span>{' '}
              Fill in or remove them before publishing — search the body for{' '}
              <code className="rounded bg-amber-100 px-1">[VERIFY:</code>.
            </div>
          ) : null}

          {/* Cover / header image */}
          <Card className="space-y-3 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              {contentType === 'post' ? 'Header image' : 'Cover photo'}
            </div>
            {content.coverImageUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-paper-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={content.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                <button
                  onClick={editCover}
                  disabled={coverBusy || photoBusy}
                  className="absolute left-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-ink hover:bg-white disabled:opacity-50"
                >
                  Edit / crop
                </button>
                <button
                  onClick={() => {
                    patch({ coverImageUrl: '' });
                    void persistCover('', 'Cover removed');
                  }}
                  className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center rounded-[2px] bg-paper-alt text-faint">
                <Icon name="image" className="h-8 w-8" />
              </div>
            )}
            <label className="block">
              <span className="text-xs font-medium text-muted">
                Upload a photo{content.coverImageUrl ? ' (replaces current)' : ''}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={coverBusy || photoBusy}
                className="mt-1 block w-full text-xs text-body file:mr-3 file:rounded-[2px] file:border-0 file:bg-paper-alt file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink hover:file:bg-paper-alt"
                onChange={(e) => uploadCover(e.target.files?.[0] || null)}
              />
            </label>
            <div className="border-t border-hairline pt-3">
              <span className="text-xs font-medium text-muted">Or generate one with AI</span>
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Describe the cover (optional — defaults to the title)."
                value={coverPrompt}
                onChange={(e) => setCoverPrompt(e.target.value)}
              />
              <Button variant="ghost" size="sm" icon="sparkles" loading={coverBusy} onClick={generateCover} className="mt-2">
                {coverBusy ? 'Working…' : 'Generate'}
              </Button>
            </div>
          </Card>

          {/* Type-specific meta */}
          <Card className="space-y-4 p-4">
            {contentType === 'post' ? (
              <>
                <Field label="Excerpt">
                  <textarea rows={3} className={inputClass} value={content.excerpt || ''} onChange={(e) => patch({ excerpt: e.target.value })} />
                </Field>
                <Field label="Cluster">
                  <select className={inputClass} value={content.cluster || ''} onChange={(e) => patch({ cluster: e.target.value })}>
                    <option value="">—</option>
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
                    onChange={(e) => patch({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Client type">
                  <input className={inputClass} value={content.clientType || ''} onChange={(e) => patch({ clientType: e.target.value })} />
                </Field>
                <Field label="Scope summary">
                  <textarea rows={3} className={inputClass} value={content.scopeSummary || ''} onChange={(e) => patch({ scopeSummary: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Timeline">
                    <input className={inputClass} value={content.timeline || ''} onChange={(e) => patch({ timeline: e.target.value })} />
                  </Field>
                  <Field label="Square footage">
                    <input className={inputClass} value={content.squareFootage || ''} onChange={(e) => patch({ squareFootage: e.target.value })} />
                  </Field>
                </div>
                <Field label="Card quote" hint="one line shown on the project card">
                  <textarea
                    rows={2}
                    className={inputClass}
                    placeholder="A short client quote, e.g. “They hit the fixed open date and the space was clean and ready.”"
                    value={content.cardQuote || ''}
                    onChange={(e) => patch({ cardQuote: e.target.value })}
                  />
                </Field>
              </>
            )}
          </Card>

          {/* SEO */}
          <Card className="space-y-4 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">SEO</div>
            <Field label="Meta title">
              <input className={inputClass} value={content.metaTitle} onChange={(e) => patch({ metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta description">
              <textarea rows={3} className={inputClass} value={content.metaDescription} onChange={(e) => patch({ metaDescription: e.target.value })} />
            </Field>
          </Card>

          {/* Google Business Profile post (posts only) */}
          {contentType === 'post' && (
            <GbpPostCard
              value={content.gbpPost || ''}
              onChange={(v) => patch({ gbpPost: v })}
              source={{ title: content.title, excerpt: content.excerpt, bodyMarkdown: content.bodyMarkdown }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
/**
 * A plain, persisted text box for the Google Business Profile "What's new" post
 * to copy/paste into GBP. GBP posts allow up to 1,500 characters (only ~250 are
 * visible before "Read more"), so the counter warns as you approach the limit.
 */
const GBP_LIMIT = 1500;
const GBP_VISIBLE = 250;

function GbpPostCard({
  value,
  onChange,
  source,
}: {
  value: string;
  onChange: (v: string) => void;
  source: { title: string; excerpt?: string; bodyMarkdown?: string };
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const len = value.length;
  const over = len > GBP_LIMIT;

  async function copy() {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied — paste it into your Google Business Profile post.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy. Select the text and copy manually.');
    }
  }

  async function draft() {
    if (!source.title?.trim()) {
      toast.error('Add a title first so Claude has something to work from.');
      return;
    }
    if (value.trim() && !window.confirm('Replace the current Google Business Profile text with a fresh draft?')) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/gbp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not draft the post.');
      onChange(data.post || '');
      toast.success('Draft ready — review it, then Copy to paste into Google Business Profile.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not draft the post.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">Google Business Profile post</div>
        <Button variant="ghost" size="sm" icon={copied ? 'check' : 'copy'} onClick={copy} disabled={!value.trim()}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="text-xs text-muted">
        A ready-to-paste update for your Google Business Profile. Let Claude draft it from this post, tweak the wording, then
        copy. Only about the first {GBP_VISIBLE} characters show before “Read more,” so lead with the key point.
      </p>
      <Button variant="ghost" size="sm" icon="sparkles" loading={busy} onClick={draft} className="w-full justify-center">
        {busy ? 'Drafting…' : value.trim() ? 'Redraft with Claude' : 'Draft with Claude'}
      </Button>
      <textarea
        rows={6}
        className={inputClass}
        placeholder="Write it yourself, or let Claude draft it from this post…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center justify-between text-xs">
        <span className={len > GBP_VISIBLE ? 'text-faint' : 'text-green-600'}>
          {len <= GBP_VISIBLE ? `${GBP_VISIBLE - len} left before “Read more”` : 'Past the visible preview length'}
        </span>
        <span className={over ? 'font-semibold text-red-600' : 'text-faint'}>
          {len.toLocaleString()} / {GBP_LIMIT.toLocaleString()}
        </span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
function MarkdownField({
  value,
  onChange,
  imagePreviews,
  wordCount,
}: {
  value: string;
  onChange: (v: string) => void;
  imagePreviews: string[];
  wordCount: number;
}) {
  const [preview, setPreview] = useState(false);
  const previewMarkdown = value.replace(/\(photo:(\d+)\)/g, (_m, i) => `(${imagePreviews[Number(i)] || ''})`);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Body (Markdown)</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-faint">{wordCount} words</span>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`rounded px-2 py-1 font-medium ${!preview ? 'bg-ink text-white' : 'text-muted'}`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`rounded px-2 py-1 font-medium ${preview ? 'bg-ink text-white' : 'text-muted'}`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>
      {preview ? (
        <div className="min-h-[420px] rounded-[2px] border border-hairline bg-white p-5">
          <MarkdownBody>{previewMarkdown}</MarkdownBody>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          className="min-h-[420px] w-full rounded-[2px] border border-hairline px-3 py-2 font-mono text-sm leading-relaxed text-ink focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon"
        />
      )}
    </div>
  );
}

function BackLink({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
      <Icon name="arrowLeft" className="h-4 w-4" />
      {label}
    </button>
  );
}

function FileInput({
  label,
  hint,
  files,
  onAdd,
  onRemove,
  accept,
}: {
  label: string;
  hint: string;
  files: File[];
  onAdd: (list: FileList | null) => void;
  onRemove: (i: number) => void;
  accept: string;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="file"
        multiple
        accept={accept}
        className="mt-1 block w-full text-sm text-body file:mr-3 file:rounded-[2px] file:border-0 file:bg-paper-alt file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-paper-alt"
        onChange={(e) => onAdd(e.target.files)}
      />
      <p className="mt-1 text-xs text-faint">{hint}</p>
      {files.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded bg-paper px-2 py-1 text-xs text-body">
              <span className="truncate">{f.name}</span>
              <button onClick={() => onRemove(i)} className="ml-2 text-red-600 hover:underline">
                remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
