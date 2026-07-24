import type { ReactNode } from 'react';

/** Standard vertical rhythm wrapper. */
export function Section({
  children,
  className = '',
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={`${muted ? 'bg-stone-50' : ''} py-14 sm:py-20 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm font-semibold uppercase tracking-wider text-accent">
      {children}
    </div>
  );
}
