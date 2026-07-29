'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Icon,
  StatusBadge,
  useToast,
  relativeTime,
  type AdminItem,
  type ContentType,
  type EditorTarget,
  type IconName,
} from './ui';

export function Dashboard({
  items,
  configured,
  onOpenEditor,
  onOpenList,
  onReload,
}: {
  items: AdminItem[];
  configured: boolean;
  onOpenEditor: (t: EditorTarget) => void;
  onOpenList: (type: ContentType) => void;
  onReload: () => void;
}) {
  const toast = useToast();
  const [importing, setImporting] = useState(false);

  const posts = items.filter((i) => i.type === 'post');
  const projects = items.filter((i) => i.type === 'project');
  const recent = items.slice(0, 6);

  async function importExisting() {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/import', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed.');
      const r = data.result as {
        posts: { imported: string[] };
        projects: { imported: string[] };
      };
      const added = r.posts.imported.length + r.projects.imported.length;
      toast.success(
        added === 0
          ? 'Nothing new to import — everything is already in the CMS.'
          : `Imported ${added} item${added === 1 ? '' : 's'} from the original site.`,
      );
      onReload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            Everything published on macont.com, in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon="posts" onClick={() => onOpenEditor({ mode: 'create', type: 'post' })}>
            New post
          </Button>
          <Button variant="primary" icon="plus" onClick={() => onOpenEditor({ mode: 'create', type: 'project' })}>
            New project
          </Button>
        </div>
      </div>

      {!configured ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The CMS database isn&apos;t connected yet. Attach a Railway Postgres service (it sets
          <code className="mx-1 rounded bg-amber-100 px-1">DATABASE_URL</code>) and this fills in.
        </Card>
      ) : null}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          icon="posts"
          label="Blog posts"
          published={posts.filter((p) => p.status === 'published').length}
          drafts={posts.filter((p) => p.status !== 'published').length}
          onClick={() => onOpenList('post')}
        />
        <StatCard
          icon="projects"
          label="Projects"
          published={projects.filter((p) => p.status === 'published').length}
          drafts={projects.filter((p) => p.status !== 'published').length}
          onClick={() => onOpenList('project')}
        />
      </div>

      {/* Recent edits */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Recently edited
        </h2>
        {recent.length === 0 ? (
          <Card className="p-6 text-sm text-stone-500">
            Nothing yet. Create your first post or project, or import the original site&apos;s content
            below.
          </Card>
        ) : (
          <Card className="divide-y divide-stone-100">
            {recent.map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenEditor({ mode: 'edit', type: item.type, id: item.id })}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-50"
              >
                <Thumb item={item} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-navy">{item.title}</div>
                  <div className="text-xs text-stone-400">
                    {item.type === 'post' ? 'Post' : 'Project'} · edited {relativeTime(item.updatedAt)}
                  </div>
                </div>
                <StatusBadge status={item.status} />
                <Icon name="chevron" className="h-4 w-4 text-stone-300" />
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Import existing content */}
      <Card className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4">
        <div className="text-sm text-stone-600">
          <span className="font-semibold text-navy">Import existing site content.</span> Pull the
          original projects and blog posts into the CMS so you can edit them here. Anything already in
          the CMS is skipped.
        </div>
        <Button variant="ghost" icon="download" loading={importing} onClick={importExisting}>
          Import
        </Button>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  published,
  drafts,
  onClick,
}: {
  icon: IconName;
  label: string;
  published: number;
  drafts: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="p-5 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-navy/5 p-2 text-navy">
            <Icon name={icon} className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-navy">{label}</span>
          <Icon name="chevron" className="ml-auto h-4 w-4 text-stone-300" />
        </div>
        <div className="mt-4 flex items-baseline gap-6">
          <div>
            <div className="text-3xl font-bold text-navy">{published}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Published</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-stone-400">{drafts}</div>
            <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Drafts</div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function Thumb({ item }: { item: AdminItem }) {
  if (item.heroImageUrl) {
    return (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.heroImageUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-300">
      <Icon name={item.type === 'post' ? 'posts' : 'projects'} className="h-5 w-5" />
    </div>
  );
}
