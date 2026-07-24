import { CAPABILITY_LABELS } from '@/lib/trade-partners';

/**
 * Renders the PM-screening spec block. Every value is unsupplied for now, so
 * each row shows a labeled placeholder — never a fabricated figure. When real
 * values arrive in the tradePartnerService document, pass them in.
 */
export function CapabilityTable({
  values,
}: {
  values?: Record<string, string | boolean | null | undefined>;
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200 sm:grid-cols-2">
      {CAPABILITY_LABELS.map(({ key, label }) => {
        const raw = values?.[key];
        const display =
          raw === undefined || raw === null || raw === ''
            ? null
            : typeof raw === 'boolean'
              ? raw
                ? 'Yes'
                : 'No'
              : raw;
        return (
          <div key={key} className="bg-paper p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {label}
            </dt>
            <dd className="mt-1 font-medium text-navy">
              {display ?? (
                <span className="italic text-stone-400">Pending — value not supplied</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
