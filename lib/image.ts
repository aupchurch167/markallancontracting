/**
 * Image URL helper. Kept as a thin no-op shim after the move off Sanity: there
 * are no more Sanity-hosted images (posts/projects use R2 URLs; static content
 * ships from code with plain paths), so this always returns null and callers
 * fall through to their `|| heroImageUrl` / `|| fallback` branches.
 */
interface UrlBuilder {
  width: (n: number) => UrlBuilder;
  height: (n: number) => UrlBuilder;
  auto: (s: string) => UrlBuilder;
  fit: (s: string) => UrlBuilder;
  url: () => string | null;
}

export function urlForImage(_source?: unknown): UrlBuilder | null {
  return null;
}
