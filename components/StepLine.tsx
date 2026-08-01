/**
 * The one graphic motif: a thin ascending stepped line in brass — horizontal
 * segments joined by short vertical risers, climbing left to right, ending in a
 * small open circle. Each riser is a phase, each tick a milestone, the circle a
 * completed project ("Built to the line").
 *
 * Flat 2px brass. Risers at 60% opacity, ticks below each riser at full opacity.
 * Segment lengths vary — nothing symmetrical. Use sparingly: once in the hero,
 * optionally once as a section divider. Never more than twice per page.
 */
export function StepLine({
  className = '',
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 264 96"
      className={`text-brass ${className}`}
      fill="none"
      stroke="currentColor"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Horizontal segments — full opacity, varying lengths, climbing */}
      <g strokeWidth="2" strokeLinecap="square">
        <line x1="0" y1="78" x2="50" y2="78" />
        <line x1="50" y1="60" x2="116" y2="60" />
        <line x1="116" y1="44" x2="158" y2="44" />
        <line x1="158" y1="26" x2="214" y2="26" />
      </g>

      {/* Vertical risers — 60% opacity */}
      <g strokeWidth="2" opacity="0.6">
        <line x1="50" y1="78" x2="50" y2="60" />
        <line x1="116" y1="60" x2="116" y2="44" />
        <line x1="158" y1="44" x2="158" y2="26" />
      </g>

      {/* Milestone ticks below each riser — full opacity */}
      <g strokeWidth="2" strokeLinecap="square">
        <line x1="50" y1="86" x2="50" y2="92" />
        <line x1="116" y1="86" x2="116" y2="92" />
        <line x1="158" y1="86" x2="158" y2="92" />
      </g>

      {/* Completed project — small open circle, unfilled */}
      <circle cx="228" cy="26" r="8" strokeWidth="2" fill="none" />
    </svg>
  );
}
