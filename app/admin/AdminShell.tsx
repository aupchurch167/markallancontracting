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
import { AboutPhotos } from './AboutPhotos';
import { SectionCovers } from './SectionCovers';
import { ClientLogos } from './ClientLogos';
import { CityBuilder } from './CityBuilder';
import { LinksManager } from './LinksManager';

type View = 'dashboard' | 'list' | 'editor' | 'homepage' | 'sections' | 'logos' | 'cities' | 'links';

const NAV: { id: View; label: string; icon: IconName; type?: ContentType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'list', label: 'Posts', icon: 'posts', type: 'post' },
  { id: 'list', label: 'Projects', icon: 'projects', type: 'project' },
  { id: 'cities', label: 'City pages', icon: 'home' },
  { id: 'links', label: 'Links page', icon: 'external' },
  { id: 'sections', label: 'Section covers', icon: 'image' },
  { id: 'logos', label: 'Client logos', icon: 'projects' },
  { id: 'homepage', label: 'Page photos', icon: 'home' },
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
    <div className="min-h-screen bg-paper text-body">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-cream/10 bg-ink lg:flex">
          <div className="px-5 py-5">
            <div className="flex items-baseline gap-2 font-display text-[19px] uppercase tracking-wordmark">
              <span className="font-bold text-cream">Mark Allan</span>
              <span className="font-medium text-faint">Contracting</span>
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-label text-faint">Content console</div>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-2">
            {NAV.map((item) => (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => onNav(item)}
                className={`flex w-full items-center gap-3 border-l-2 px-3 py-2 text-[15px] font-medium transition-colors ${
                  isActive(item)
                    ? 'border-maroon bg-white/5 text-cream'
                    : 'border-transparent text-cream-muted hover:bg-white/5 hover:text-cream'
                }`}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-cream/10 p-3">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-3 py-2 text-[15px] font-medium text-cream-muted hover:text-cream"
            >
              <Icon name="signout" className="h-[18px] w-[18px]" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top nav */}
          <header className="flex items-center justify-between border-b border-cream/10 bg-ink px-4 py-3 lg:hidden">
            <span className="font-display text-[16px] uppercase tracking-wordmark">
              <span className="font-bold text-cream">Mark Allan</span> <span className="font-medium text-faint">Contracting</span>
            </span>
            <button onClick={logout} className="text-cream-muted hover:text-cream">
              <Icon name="signout" className="h-5 w-5" />
            </button>
          </header>
          <div className="flex gap-1 overflow-x-auto border-b border-hairline bg-[#FFFFFF] px-2 py-2 lg:hidden">
            {NAV.map((item) => (
              <button
                key={`m-${item.id}-${item.label}`}
                onClick={() => onNav(item)}
                className={`flex shrink-0 items-center gap-2 rounded-[2px] px-3 py-1.5 text-sm font-medium ${
                  isActive(item) ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-faint">
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
            ) : view === 'cities' ? (
              <CityBuilder />
            ) : view === 'links' ? (
              <LinksManager />
            ) : view === 'sections' ? (
              <SectionCovers />
            ) : view === 'logos' ? (
              <ClientLogos />
            ) : view === 'homepage' ? (
              <div className="mx-auto max-w-4xl space-y-12">
                <div>
                  <h1 className="mb-1 font-display text-2xl font-bold uppercase text-ink">Home page photos</h1>
                  <p className="mb-6 text-sm text-muted">Hero, about, and the “on the job” gallery.</p>
                  <HomepagePhotos />
                </div>
                <div className="border-t border-hairline pt-10">
                  <h2 className="mb-1 font-display text-2xl font-bold uppercase text-ink">About page photos</h2>
                  <p className="mb-6 text-sm text-muted">The three photo slots on the /about story page.</p>
                  <AboutPhotos />
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
