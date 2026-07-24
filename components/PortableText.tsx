import {
  PortableText as PT,
  type PortableTextComponents,
} from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/react';
import Link from 'next/link';

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="mt-10 text-2xl font-bold text-navy">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-8 text-xl font-bold text-navy">{children}</h3>,
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-stone-600">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-accent pl-4 italic text-stone-600">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-5 text-stone-600">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-5 text-stone-600">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-navy">{children}</strong>,
    link: ({ children, value }) => (
      <Link href={value?.href ?? '#'} className="text-accent underline hover:text-accent-700">
        {children}
      </Link>
    ),
  },
};

export function PortableText({ value }: { value?: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return <PT value={value} components={components} />;
}
