'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Icon,
  StatusBadge,
  inputClass,
  relativeTime,
  useToast,
  type AdminItem,
  type ContentType,
  type EditorTarget,
} from './ui';

type StatusFilter = 'all' | 'published' | 'draft';
type SortKey = 'updated' | 'title';

function liveUrl(item: AdminItem) {
  return item.type === 'post' ? `/insights/${item.slug}` : `/projects/${item.slug}`;
}

export function ContentList({
  type,
  items,
  configured,
  onOpenEditor,
  onReload,
}: {
  type: ContentType;
  items: AdminItem[];
  configured: boolean;
  onOpenEditor: (t: EditorTarget) => void;
  onReload: () => void;
}) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [busyId, setBusyId] = useState('');
  const [toDelete, setToDelete] = useState<AdminItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const label = type === 'post' ? 'Posts' : 'Projects';

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items;
    if (needle) {
      list = list.filter(
        (i) => i.title.toLowerCase().includes(needle) || i.slug.toLowerCase().includes(needle),
      );
    }
    if (status !== 'all') {
      list = list.filter((i) => (status === 'published' ? i.status === 'published' : i.status !== 'published'));
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else sorted.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return sorted;
  }, [items, q, status, sort]);

  async function toggleStatus(item: AdminItem) {
    setBusyId(item.id);
    try {
      const next = item.status === 'published' ? 'draft' : 'published';
      const res = await fetch(`/api/admin/content/${item.type}/${item.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed.');
      toast.success(next === 'published' ? 'Published — now live.' : 'Moved to drafts.');
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusyId('');
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/content/${toDelete.type}/${toDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed.');
      toast.success(`Deleted “${toDelete.title}”.`);
      setToDelete(null);
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{label}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {items.length} total · {items.filter((i) => i.status === 'published').length} published
          </p>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => onOpenEditor({ mode: 'create', type })}
        >
          New {type}
        </Button>
      </div>

      {!configured ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The CMS database isn&apos;t connected yet. Attach a Railway Postgres service (it sets
          <code className="mx-1 rounded bg-amber-100 px-1">DATABASE_URL</code>) and this fills in.
        </Card>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className={`${inputClass} mt-0 pl-9`}
          />
        </div>
        <div className="flex rounded-md border border-stone-200 bg-white p-0.5 text-sm">
          {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded px-3 py-1.5 font-medium capitalize ${
                status === s ? 'bg-navy text-white' : 'text-stone-500 hover:text-navy'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className={`${inputClass} mt-0 w-auto`}
        >
          <option value="updated">Sort: Recently edited</option>
          <option value="title">Sort: Title (A–Z)</option>
        </select>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState icon={type === 'post' ? 'posts' : 'projects'} title={`No ${label.toLowerCase()} yet`}>
          Create your first {type} with the button above, or import the original site&apos;s content
          from the dashboard.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="search" title="No matches">
          Nothing matches your search and filters.
        </EmptyState>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-stone-100">
            {visible.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-3 ${busyId === item.id ? 'opacity-50' : ''}`}
              >
                <Thumb item={item} />
                <button
                  onClick={() => onOpenEditor({ mode: 'edit', type: item.type, id: item.id })}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate font-medium text-navy hover:text-accent">{item.title}</div>
                  <div className="truncate text-xs text-stone-400">/{item.slug}</div>
                </button>
                <div className="hidden w-28 shrink-0 text-xs text-stone-400 sm:block">
                  {relativeTime(item.updatedAt)}
                </div>
                <div className="w-24 shrink-0">
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <IconBtn
                    title="Edit"
                    icon="edit"
                    onClick={() => onOpenEditor({ mode: 'edit', type: item.type, id: item.id })}
                  />
                  {item.status === 'published' ? (
                    <a
                      href={liveUrl(item)}
                      target="_blank"
                      rel="noreferrer"
                      title="View live"
                      className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-navy"
                    >
                      <Icon name="external" className="h-[18px] w-[18px]" />
                    </a>
                  ) : null}
                  <IconBtn
                    title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                    icon="eye"
                    disabled={busyId === item.id}
                    onClick={() => toggleStatus(item)}
                  />
                  <IconBtn
                    title="Delete"
                    icon="trash"
                    danger
                    disabled={busyId === item.id}
                    onClick={() => setToDelete(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete “${toDelete?.title}”?`}
        body="This permanently removes it from the CMS and the live site. This can't be undone."
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function IconBtn({
  title,
  icon,
  onClick,
  disabled,
  danger,
}: {
  title: string;
  icon: Parameters<typeof Icon>[0]['name'];
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-2 disabled:opacity-40 ${
        danger
          ? 'text-stone-500 hover:bg-red-50 hover:text-red-600'
          : 'text-stone-500 hover:bg-stone-100 hover:text-navy'
      }`}
    >
      <Icon name={icon} className="h-[18px] w-[18px]" />
    </button>
  );
}

function Thumb({ item }: { item: AdminItem }) {
  if (item.heroImageUrl) {
    return (
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.heroImageUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-300">
      <Icon name={item.type === 'post' ? 'posts' : 'projects'} className="h-5 w-5" />
    </div>
  );
}
