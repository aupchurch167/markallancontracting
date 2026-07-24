import { defineType, defineField } from 'sanity';

/** Reusable SEO object across page-level document types. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string' }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 2,
    }),
    defineField({ name: 'ogImage', title: 'OG Image', type: 'image' }),
    defineField({
      name: 'canonicalOverride',
      title: 'Canonical Override',
      type: 'url',
      description: 'Leave blank to self-canonicalize. City pages never canonical to the hub.',
    }),
    defineField({ name: 'noindex', title: 'noindex', type: 'boolean', initialValue: false }),
  ],
});
