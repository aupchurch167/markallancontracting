'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type ContentType = 'post' | 'project';

type GenBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'numbers'; items: string[] };

interface Content {
  title: string;
  slug: string;
  excerpt?: string;
  cluster?: string;
  tags?: string[];
  body?: GenBlock[];
  clientType?: string;
  scopeSummary?: string;
  challenge?: GenBlock[];
  solution?: GenBlock[];
  timeline?: string;
  squareFootage?: string;
  metaTitle: string;
  metaDescription: string;
}

const CLUSTERS = [
  { label: 'Cost & Budget', value: 'cost-budget' },
  { label: 'Process & Timeline', value: 'process-timeline' },
  { label: 'Broker & PM Resources', value: 'broker-pm' },
  { label: 'Ground-up Authority', value: 'ground-up' },
];

const BLOCK_LABELS: Record<GenBlock['type'], string> = {
  heading: 'Heading',
  subheading: 'Subheading',
  paragraph: 'Paragraph',
  quote: 'Quote',
  bullets: 'Bullet list',
  numbers: 'Numbered list',
};

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

/** Editable list of body/challenge/solution blocks. */
function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: GenBlock[];
  onChange: (next: GenBlock[]) => void;
}) {
  function update(i: number, patch: Partial<GenBlock>) {
    const next = blocks.slice();
    next[i] = { ...next[i], ...patch } as GenBlock;
    onChange(next);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const isList = b.type === 'bullets' || b.type === 'numbers';
        return (
          <div key={i} className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {BLOCK_LABELS[b.type]}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            {isList ? (
              <textarea
                rows={Math.max(2, (b as { items: string[] }).items.length)}
                className={inputClass}
                value={(b as { items: string[] }).items.join('\n')}
                onChange={(e) =>
                  update(i, { items: e.target.value.split('\n').filter((x) => x.trim() !== '') } as Partial<GenBlock>)
                }
              />
            ) : (
              <textarea
                rows={b.type === 'heading' || b.type === 'subheading' ? 1 : 3}
                className={inputClass}
                value={(b as { text: string }).text}
                onChange={(e) => update(i, { text: e.target.value } as Partial<GenBlock>)}
              />
            )}
          </div>
        );
      })}
      {blocks.length === 0 ? <p className="text-sm text-stone-400">No blocks.</p> : null}
    </div>
  );
}

export function AdminConsole() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [contentType, setContentType] = useState<ContentType>('post');
  const [brief, setBrief] = useState('');
  const [context, setContext] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ studioUrl: string } | null>(null);

  function patch(p: Partial<Content>) {
    setContent((c) => (c ? { ...c, ...p } : c));
  }

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

  async function publish() {
    if (!content) return;
    setError('');
    setPublishing(true);
    try {
      const fd = new FormData();
      fd.set('contentType', contentType);
      fd.set('content', JSON.stringify(content));
      files.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/admin/publish', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setResult({ studioUrl: data.studioUrl });
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
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-6 py-8 lg:grid-cols-2">
        {/* Left: brief + attachments */}
        <section className="space-y-5">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex gap-2">
              {(['post', 'project'] as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setContentType(t);
                    setContent(null);
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

              <Field label="Extra context (optional)">
                <textarea
                  rows={3}
                  className={inputClass}
                  placeholder="Facts, quotes, constraints, anything Claude should ground the write-up in."
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

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <p className="font-semibold">Saved as a draft in Sanity.</p>
              <p className="mt-1">
                Review, add finishing touches, and publish it in the Studio:
              </p>
              <a
                href={result.studioUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-semibold text-navy underline"
              >
                Open draft in Studio →
              </a>
            </div>
          ) : null}
        </section>

        {/* Right: editable generated content */}
        <section>
          {content ? (
            <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-navy">Review &amp; edit</h2>
                <span className="text-xs text-stone-400">Edits save with the draft</span>
              </div>

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
                  <div>
                    <span className="text-sm font-medium text-navy">Body</span>
                    <div className="mt-2">
                      <BlockEditor
                        blocks={content.body || []}
                        onChange={(body) => patch({ body })}
                      />
                    </div>
                  </div>
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
                  <div>
                    <span className="text-sm font-medium text-navy">Challenge</span>
                    <div className="mt-2">
                      <BlockEditor
                        blocks={content.challenge || []}
                        onChange={(challenge) => patch({ challenge })}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-navy">Solution</span>
                    <div className="mt-2">
                      <BlockEditor
                        blocks={content.solution || []}
                        onChange={(solution) => patch({ solution })}
                      />
                    </div>
                  </div>
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

              <button
                onClick={publish}
                disabled={publishing}
                className="btn-call w-full justify-center disabled:opacity-60"
              >
                {publishing ? 'Saving…' : 'Save as draft to Sanity'}
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white/50 p-8 text-center text-sm text-stone-400">
              Generated content appears here for review and editing before it&apos;s saved
              as a draft.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
