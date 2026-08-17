import type { Block } from '@/lib/fallback-insights';

/** Renders the small block union used by fallback blog posts. */
export function FallbackArticle({ body }: { body: Block[] }) {
  return (
    <div>
      {body.map((block, i) => {
        if ('h2' in block) {
          return (
            <h2 key={i} className="mt-10 text-2xl font-bold text-ink">
              {block.h2}
            </h2>
          );
        }
        if ('p' in block) {
          return (
            <p key={i} className="mb-4 leading-relaxed text-body">
              {block.p}
            </p>
          );
        }
        if ('ul' in block) {
          return (
            <ul key={i} className="mb-4 list-disc space-y-1.5 pl-5 text-body">
              {block.ul.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={i} className="mb-4 list-decimal space-y-1.5 pl-5 text-body">
            {block.ol.map((li, j) => (
              <li key={j}>{li}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
