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
  h1: ({ children }) => <h2 className="mt-10 text-2xl font-bold text-navy">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-10 text-2xl font-bold text-navy">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-xl font-bold text-navy">{children}</h3>,
  h4: ({ children }) => <h4 className="mt-6 text-lg font-bold text-navy">{children}</h4>,
  p: ({ children }) => <p className="mb-4 leading-relaxed text-stone-600">{children}</p>,
  a: ({ href, children }) => {
    const url = href || '#';
    if (url.startsWith('/')) {
      return (
        <Link href={url} className="text-accent underline hover:text-accent-700">
          {children}
        </Link>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline hover:text-accent-700"
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-5 text-stone-600">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-5 text-stone-600">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-accent pl-4 italic text-stone-600">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-8 border-stone-200" />,
  code: ({ children }) => (
    <code className="rounded bg-stone-100 px-1.5 py-0.5 text-sm text-navy">{children}</code>
  ),
  // Tables — from Markdown pipe tables or pasted <table> HTML. Wrapped so wide
  // tables scroll on mobile instead of breaking the layout.
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-stone-100 text-navy">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-stone-200 px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-stone-200 px-3 py-2 align-top text-stone-600">{children}</td>
  ),
  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string') return null;
    return (
      <figure className="my-8">
        <div className="overflow-hidden rounded-lg border border-stone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt || ''} className="h-auto w-full object-cover" />
        </div>
        {alt ? (
          <figcaption className="mt-2 text-center text-sm text-stone-400">{alt}</figcaption>
        ) : null}
      </figure>
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
