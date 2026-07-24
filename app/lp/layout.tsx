/**
 * Locked campaign layout. No global nav, no footer nav — this route group sits
 * outside (site) on purpose. Single message, single CTA (phone). CallRail DNI
 * still loads from the root layout so the number is tracked.
 */
export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex-1">{children}</div>;
}
