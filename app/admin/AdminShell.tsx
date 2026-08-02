'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ToastProvider,
  Icon,
  Spinner,
  type AdminItem,
  type ContentType,
  type EditorTarget,
  type IconName,
} from './ui';
import { Dashboard } from './Dashboard';
import { ContentList } from './ContentList';
import { ContentEditor } from './ContentEditor';
import { HomepagePhotos } from './HomepagePhotos';
import { SectionCovers } from './SectionCovers';

type View = 'dashboard' | 'list' | 'editor' | 'homepage' | 'sections';

const NAV: { id: View; label: string; icon: IconName; type?: ContentType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'list', label: 'Posts', icon: 'posts', type: 'post' },
  { id: 'list', label: 'Projects', icon: 'projects', type: 'project' },
  { id: 'sections', label: 'Section covers', icon: 'image' },
  { id: 'homepage', label: 'Home page', icon: 'home' },
];

export function AdminShell() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}

function Shell() {
  const router = useRouter();

  const [view, setView] = useState<View>('dashboard');
  const [listType, setListType] = useState<ContentType>('post');
  const [editorTarget, setEditorTarget] = useState<EditorTarget | null>(null);

  // The content list is loaded once here and shared by the dashboard + list so
  // an action in one view refreshes the other.
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
        setConfigured(data.configured !== false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openList = useCallback((type: ContentType) => {
    setListType(type);
    setEditorTarget(null);
    setView('list');
  }, []);

  const openEditor = useCallback((target: EditorTarget) => {
    setEditorTarget(target);
    setView('editor');
  }, []);

  const goDashboard = useCallback(() => {
    setEditorTarget(null);
    setView('dashboard');
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  function isActive(item: (typeof NAV)[number]) {
    if (item.id === 'list') return view === 'list' && listType === item.type;
    if (item.id === 'dashboard') return view === 'dashboard' || view === 'editor';
    return view === item.id;
  }

  function onNav(item: (typeof NAV)[number]) {
    if (item.id === 'list' && item.type) openList(item.type);
    else if (item.id === 'dashboard') goDashboard();
    else {
      setEditorTarget(null);
      setView(item.id);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-ink">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
          <div className="flex items-center gap-2 px-5 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">
              MA
            </div>
            <div>
              <div className="text-sm font-bold leading-tight text-navy">Mark Allan</div>
              <div className="text-[11px] leading-tight text-stone-400">Content console</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {NAV.map((item) => (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => onNav(item)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'bg-navy text-white'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-navy'
                }`}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-stone-200 p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-navy"
            >
              <Icon name="signout" className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top nav */}
          <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy text-xs font-bold text-white">
                MA
              </div>
              <span className="text-sm font-bold text-navy">Content console</span>
            </div>
            <button onClick={logout} className="text-stone-500 hover:text-navy">
              <Icon name="signout" className="h-5 w-5" />
            </button>
          </header>
          <div className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-2 py-2 lg:hidden">
            {NAV.map((item) => (
              <button
                key={`m-${item.id}-${item.label}`}
                onClick={() => onNav(item)}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive(item) ? 'bg-navy text-white' : 'text-stone-600'
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-stone-400">
                <Spinner />
              </div>
            ) : view === 'dashboard' ? (
              <Dashboard
                items={items}
                configured={configured}
                onOpenEditor={openEditor}
                onOpenList={openList}
                onReload={reload}
              />
            ) : view === 'list' ? (
              <ContentList
                type={listType}
                items={items.filter((i) => i.type === listType)}
                configured={configured}
                onOpenEditor={openEditor}
                onReload={reload}
              />
            ) : view === 'editor' && editorTarget ? (
              <ContentEditor
                target={editorTarget}
                onDone={() => {
                  reload();
                  openList(editorTarget.type);
                }}
                onBack={() => openList(editorTarget.type)}
                onReload={reload}
              />
            ) : view === 'sections' ? (
              <SectionCovers />
            ) : view === 'homepage' ? (
              <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-2xl font-bold text-navy">Home page photos</h1>
                <HomepagePhotos />
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
