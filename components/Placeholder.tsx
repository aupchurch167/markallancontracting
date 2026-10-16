import type { ReactNode } from 'react';

/**
 * Visible amber mark for copy the owner hasn't supplied yet. Staging only —
 * every one of these blocks launch and must be replaced or removed.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-[2px] bg-brass/15 px-1.5 py-px font-mono text-[13px] text-brass-700">
      [PLACEHOLDER: {children}]
    </mark>
  );
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
