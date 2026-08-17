import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import Link from 'next/link';

/**
 * Renders a Markdown string with the site's styling. Used by both the public
 * post page and the /admin editor preview so they match exactly. Internal links
 * (starting with "/") use next/link; external links open in a new tab.
 *
 * Raw HTML is allowed but SANITIZED (rehype-raw → rehype-sanitize): a safe
 * allowlist — tables, headings, lists, links, images, formatting — renders,
 * while <script>, event handlers, inline styles, and <iframe> are stripped.
 * Tables (Markdown pipe tables OR pasted <table> HTML) are styled by the
 * component map below, so they always look on-brand regardless of source.
 */
// Allow table cell colspan/rowspan on top of the default safe schema; keep
// everything else (no style/script/iframe) locked down.
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    td: [...(defaultSchema.attributes?.td || []), 'colSpan', 'rowSpan'],
    th: [...(defaultSchema.attributes?.th || []), 'colSpan', 'rowSpan'],
  },
};
const components: Components = {
  h1: ({ children }) => <h2 className="mb-4 mt-10 font-display text-[32px] font-bold uppercase text-ink sm:text-[36px]">{children}</h2>,
  h2: ({ children }) => <h2 className="mb-4 mt-10 font-display text-[32px] font-bold uppercase text-ink sm:text-[36px]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-3 mt-8 font-display text-[24px] font-semibold uppercase text-ink">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-6 font-display text-[20px] font-semibold uppercase text-ink">{children}</h4>,
  p: ({ children }) => <p className="mb-5 text-[18px] leading-[1.75] text-body">{children}</p>,
  a: ({ href, children }) => {
    const url = href || '#';
    if (url.startsWith('/')) {
      return (
        <Link href={url} className="text-maroon underline decoration-1 underline-offset-2 hover:text-maroon-light">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-maroon underline decoration-1 underline-offset-2 hover:text-maroon-light"
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-2 pl-5 text-[18px] leading-[1.7] text-body">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-5 text-[18px] leading-[1.7] text-body">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-8 border-l-2 border-maroon pl-6 font-display text-[26px] font-semibold uppercase leading-[1.15] text-ink [&>p]:mb-0 [&>p]:text-ink [&>p]:text-[26px] [&>p]:leading-[1.15]">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-8 border-hairline" />,
  code: ({ children }) => (
    <code className="rounded-[2px] bg-paper-alt px-1.5 py-0.5 text-[15px] text-ink">{children}</code>
  ),
  // Tables — from Markdown pipe tables or pasted <table> HTML. Wrapped so wide
  // tables scroll on mobile instead of breaking the layout.
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-paper-alt text-ink">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-hairline px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-hairline px-3 py-2 align-top text-body">{children}</td>
  ),
  // Rendered with block-display <span>s (not <figure>/<div>) so an image is
  // valid HTML wherever Markdown puts it — including inside a <p> or a link.
  // Block elements inside a <p> get relocated by the browser parser and cause a
  // hydration mismatch (React #418); spans never do.
  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string') return null;
    return (
      <span className="my-8 block">
        <span className="block overflow-hidden border border-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt || ''} className="h-auto w-full object-cover" />
        </span>
        {alt ? (
          <span className="mt-2 block text-[13px] italic text-faint">{alt}</span>
        ) : null}
      </span>
    );
  },
};

export function MarkdownBody({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
