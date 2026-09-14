import { getPublicReviews, getReviewsSettings } from '@/lib/reviews';
import { reviewsSchema } from '@/lib/schema';
import { JsonLd } from './JsonLd';

/**
 * Curated Google-reviews block, rendered from the CMS. Shows the owner's
 * hand-picked real reviews (with "via Google" attribution and per-review stars),
 * the true GMB aggregate when it's been entered, and a link out to the full
 * Google reviews so the complete picture is one tap away. Emits matching
 * Review / AggregateRating JSON-LD only for what's actually on the page.
 *
 * Renders nothing when the block is switched off or there are no visible reviews,
 * so the site never shows an empty testimonials shell.
 */

function Stars({ rating, className = '' }: { rating: number; className?: string }) {
  const r = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${r} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.51L10 14.9l-4.95 2.6.94-5.51-4-3.9 5.53-.8L10 1.5z"
            className={i < r ? 'fill-maroon' : 'fill-hairline'}
          />
        </svg>
      ))}
    </span>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export async function GoogleReviews({ className = '' }: { className?: string }) {
  const [reviews, settings] = await Promise.all([getPublicReviews(), getReviewsSettings()]);

  if (!settings.visible || reviews.length === 0) return null;

  const hasAggregate =
    typeof settings.aggregateRating === 'number' && typeof settings.reviewCount === 'number';

  const schema = reviewsSchema({
    reviews: reviews.map((r) => ({ author: r.author, rating: r.rating, body: r.body, date: r.reviewDate })),
    aggregateRating: settings.aggregateRating,
    reviewCount: settings.reviewCount,
  });

  return (
    <section className={`border-t border-hairline ${className}`}>
      <JsonLd data={schema} />
      <div className="container-page py-20">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="kicker mb-3.5 text-maroon">Reviews</div>
            <h2 className="font-display text-[40px] leading-[1.02] sm:text-[52px]">{settings.heading}</h2>
            {settings.intro && <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-muted">{settings.intro}</p>}
          </div>
          {hasAggregate && (
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[34px] leading-none text-ink">
                  {settings.aggregateRating!.toFixed(1)}
                </span>
                <Stars rating={settings.aggregateRating!} />
              </div>
              <div className="text-[13px] font-medium uppercase tracking-label text-faint">
                {settings.reviewCount} Google reviews
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.id} className="flex flex-col border border-hairline bg-[#FFFFFF] p-6">
              <Stars rating={r.rating} className="mb-4" />
              <blockquote className="flex-1 text-[16px] leading-[1.65] text-body">
                <p>&ldquo;{r.body}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-5 border-t border-hairline pt-4">
                <div className="text-[15px] font-semibold text-ink">{r.author}</div>
                {r.role && <div className="text-[13px] text-muted">{r.role}</div>}
                <div className="mt-1.5 flex items-center gap-1.5 text-[12px] uppercase tracking-label text-faint">
                  <span>via {r.source}</span>
                  {formatDate(r.reviewDate) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(r.reviewDate)}</span>
                    </>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {settings.reviewsUrl && (
          <div className="mt-10">
            <a
              href={settings.reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[16px] font-semibold text-maroon hover:text-maroon-light"
            >
              Read all our Google reviews
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
