import type { ReactNode } from 'react';

/**
 * Unfilled copy. The children stay in the source file so they can be replaced
 * with a real fact later. Nothing is rendered: the public site must not show
 * an unfinished note.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  void children;
  return null;
}

/** Striped slot for a job photo the owner still has to supply. */
export function PhotoSlot({ label, className = 'aspect-[4/3]' }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-end border border-hairline bg-[repeating-linear-gradient(135deg,#EFEAE6_0_10px,#E4DED8_10px_20px)] p-3.5 ${className}`}
    >
      <span className="font-mono text-xs text-muted">{label}</span>
    </div>
  );
}
