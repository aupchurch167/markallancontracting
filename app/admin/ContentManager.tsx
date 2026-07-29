'use client';

import { useCallback, useEffect, useState } from 'react';

interface Item {
  id: string;
  type: 'post' | 'project';
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

function liveUrl(item: Item) {
  return item.type === 'post' ? `/insights/${item.slug}` : `/projects/${item.slug}`;
}

export function ContentManager({
  onEdit,
}: {
  onEdit: (type: 'post' | 'project', id: string) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [configured, setConfigured] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load.');
      setItems(data.items || []);
      setConfigured(data.configured !== false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(item: Item) {
    setBusyId(item.id);
    setError('');
    try {
      const next = item.status === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/admin/content/${item.type}/${item.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusyId('');
    }
  }

  async function remove(item: Item) {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    setBusyId(item.id);
    setError('');
    try {
      const res = await fetch(`/api/admin/content/${item.type}/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusyId('');
    }
  }

  async function importExisting() {
    setImporting(true);
    setError('');
    setImportMsg('');
    try {
      const res = await fetch('/api/admin/import', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed.');
      const r = data.result as {
        posts: { imported: string[]; skipped: string[] };
        projects: { imported: string[]; skipped: string[] };
      };
      const added = r.posts.imported.length + r.projects.imported.length;
      const skipped = r.posts.skipped.length + r.projects.skipped.length;
      setImportMsg(
        added === 0
          ? `Nothing new to import — all ${skipped} existing items are already in the CMS.`
          : `Imported ${added} item${added === 1 ? '' : 's'} (${r.posts.imported.length} post${
              r.posts.imported.length === 1 ? '' : 's'
            }, ${r.projects.imported.length} project${
              r.projects.imported.length === 1 ? '' : 's'
            })${skipped ? `; skipped ${skipped} already in the CMS` : ''}.`,
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  if (loading) return <p className="text-sm text-stone-400">Loading…</p>;

  if (!configured) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        The CMS database isn&apos;t connected yet. Attach a Railway Postgres service (it sets
        <code className="mx-1 rounded bg-amber-100 px-1">DATABASE_URL</code>) and this fills in.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}

      {/* One-time import of the original site's projects and blog posts */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
        <div className="text-sm text-stone-600">
          <span className="font-medium text-navy">Import existing site content.</span>{' '}
          Pull the original projects and blog posts into the CMS so you can edit them here. Items
          already in the CMS are skipped.
        </div>
        <button
          onClick={importExisting}
          disabled={importing}
          className="btn-ghost whitespace-nowrap text-sm disabled:opacity-60"
        >
          {importing ? 'Importing…' : 'Import existing content'}
        </button>
      </div>
      {importMsg ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {importMsg}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-stone-500">
          Nothing yet. Create a post or project from the “Create content” tab.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-2 font-semibold">Title</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => (
                <tr key={item.id} className={busyId === item.id ? 'opacity-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{item.title}</div>
                    <div className="text-xs text-stone-400">/{item.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-stone-600">{item.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-medium">
                      <button
                        onClick={() => onEdit(item.type, item.id)}
                        className="text-navy hover:text-accent"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(item)}
                        disabled={busyId === item.id}
                        className="text-navy hover:text-accent"
                      >
                        {item.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      {item.status === 'published' ? (
                        <a
                          href={liveUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-navy hover:text-accent"
                        >
                          View
                        </a>
                      ) : null}
                      <button
                        onClick={() => remove(item)}
                        disabled={busyId === item.id}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
