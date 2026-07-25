import Script from 'next/script';

/**
 * CallRail Dynamic Number Insertion.
 *
 * Primary conversion goal is phone calls, so this must load on every route
 * before first paint — strategy="beforeInteractive" places it in the initial
 * document. Every displayed number is a tracked number; DNI swaps the fallback
 * at runtime.
 *
 * The swap.js URL is /companies/<companyId>/<resource>/swap.js — both segments
 * come from the CallRail account (verified from the live macont.com).
 */
export function CallRail({
  callRailId,
  resource,
}: {
  callRailId: string;
  resource: string;
}) {
  if (!callRailId || !resource) return null;
  return (
    <Script
      id="callrail-dni"
      strategy="beforeInteractive"
      src={`//cdn.callrail.com/companies/${callRailId}/${resource}/swap.js`}
    />
  );
}
