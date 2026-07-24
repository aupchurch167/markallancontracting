import Script from 'next/script';

/**
 * CallRail Dynamic Number Insertion.
 *
 * Primary conversion goal is phone calls, so this must load on every route
 * before first paint — strategy="beforeInteractive" places it in the initial
 * document head. Every displayed number is a tracked number; DNI swaps the
 * fallback token at runtime.
 *
 * Renders nothing until {{CALLRAIL_ID}} is supplied (open item, blocks launch).
 */
export function CallRail({ callRailId }: { callRailId: string }) {
  if (!callRailId) return null;
  return (
    <Script
      id="callrail-dni"
      strategy="beforeInteractive"
      src={`//cdn.callrail.com/companies/${callRailId}/12345678/swap.js`}
    />
  );
}
