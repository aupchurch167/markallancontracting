'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

/**
 * Small, dependency-free design system for the /admin CMS. Everything here is
 * inline SVG + Tailwind so the console looks like one coherent product without
 * pulling in a UI kit or icon library.
 */

// ---------------------------------------------------------------------------
// Shared client types
// ---------------------------------------------------------------------------
export type ContentType = 'post' | 'project';

/** A row in the Manage list / dashboard (mirrors lib/content ContentListItem). */
export interface AdminItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  heroImageUrl?: string;
}

export interface EditorTarget {
  mode: 'create' | 'edit';
  type: ContentType;
  id?: string;
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------
export const inputClass =
  'mt-1 w-full rounded-[2px] border border-hairline bg-paper px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-faint focus:border-maroon focus:outline-none';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">{label}</span>
      {hint ? <span className="ml-2 text-xs font-normal normal-case text-faint">{hint}</span> : null}
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'navy' | 'ghost' | 'danger' | 'subtle';
type ButtonSize = 'sm' | 'md';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-[2px] font-semibold transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-1 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-maroon text-paper hover:bg-maroon-dark',
  navy: 'bg-ink text-paper hover:bg-maroon',
  ghost: 'border border-hairline bg-[#FFFFFF] text-ink hover:border-maroon hover:text-maroon',
  danger: 'border border-red-300 bg-[#FFFFFF] text-red-700 hover:bg-red-50',
  subtle: 'text-muted hover:bg-paper-alt hover:text-ink',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconName;
  children?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon ? <Icon name={icon} className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
export function StatusBadge({ status }: { status: string }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex items-center rounded-[2px] border px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.06em] ${
        published ? 'border-maroon bg-maroon/10 text-maroon' : 'border-hairline text-muted'
      }`}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card / EmptyState / Spinner
// ---------------------------------------------------------------------------
export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-[2px] border border-hairline bg-[#FFFFFF] ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  icon = 'inbox',
  title,
  children,
}: {
  icon?: IconName;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2px] border border-dashed border-hairline bg-[#FFFFFF] px-6 py-16 text-center">
      <div className="text-faint">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold uppercase text-ink">{title}</h3>
      {children ? <p className="mt-1 max-w-sm text-sm text-muted">{children}</p> : null}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Confirm modal
// ---------------------------------------------------------------------------
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  busy = false,
}: {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <Card className="w-full max-w-sm p-5 shadow-[0_16px_40px_rgba(29,21,23,0.06)]">
        <h3 className="font-display text-lg font-bold uppercase text-ink">{title}</h3>
        {body ? <div className="mt-2 text-sm text-body">{body}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="subtle" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
type ToastKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}
interface ToastApi {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

let toastSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      toastSeq += 1;
      const id = toastSeq;
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), kind === 'error' ? 6000 : 3500);
    },
    [remove],
  );

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const TOAST_STYLES: Record<ToastKind, { icon: IconName; iconColor: string }> = {
  success: { icon: 'check', iconColor: 'text-maroon' },
  error: { icon: 'alert', iconColor: 'text-red-700' },
  info: { icon: 'info', iconColor: 'text-maroon' },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const s = TOAST_STYLES[toast.kind];
  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-[2px] border border-hairline border-l-2 border-l-maroon bg-[#FFFFFF] px-4 py-3 shadow-[0_16px_40px_rgba(29,21,23,0.06)]">
      <Icon name={s.icon} className={`mt-0.5 h-5 w-5 shrink-0 ${s.iconColor}`} />
      <p className="flex-1 text-sm text-ink">{toast.message}</p>
      <button onClick={onClose} className="text-faint hover:text-ink" aria-label="Dismiss">
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icons — inline SVG, 24x24, currentColor, 1.75 stroke
// ---------------------------------------------------------------------------
export type IconName =
  | 'dashboard'
  | 'posts'
  | 'projects'
  | 'home'
  | 'search'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'eye'
  | 'external'
  | 'image'
  | 'signout'
  | 'check'
  | 'alert'
  | 'info'
  | 'close'
  | 'chevron'
  | 'inbox'
  | 'sparkles'
  | 'upload'
  | 'download'
  | 'copy'
  | 'arrowLeft';

const PATHS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  posts: (
    <>
      <path d="M4 5h16M4 10h16M4 15h10M4 20h7" />
    </>
  ),
  projects: (
    <>
      <path d="M3 9l9-6 9 6v10a1 1 0 01-1 1h-4v-7H8v7H4a1 1 0 01-1-1V9z" />
    </>
  ),
  home: (
    <>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 001 1h12a1 1 0 001-1V9.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6l-1 14a1 1 0 01-1 1H7a1 1 0 01-1-1L5 6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M10 14L20 4" />
      <path d="M20 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5L5 20" />
    </>
  ),
  signout: (
    <>
      <path d="M9 21H5a1 1 0 01-1-1V4a1 1 0 011-1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  check: <path d="M20 6L9 17l-5-5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  inbox: (
    <>
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M4 12l2-7h12l2 7v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
      <path d="M19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7L19 14z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15V3" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 15v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 15v4a1 1 0 001 1h12a1 1 0 001-1v-4" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 012-2h8" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </>
  ),
};

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
/** "3 minutes ago", "2 days ago", or a date for anything older than a week. */
export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
