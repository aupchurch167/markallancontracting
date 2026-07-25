import { defineType, defineField } from 'sanity';

const CLUSTERS = [
  { title: 'Cost & Budget', value: 'cost-budget' },
  { title: 'Process & Timeline', value: 'process-timeline' },
  { title: 'Broker & PM Resources', value: 'broker-pm' },
  { title: 'Ground-up Authority', value: 'ground-up' },
];

export const post = defineType({
  name: 'post',
  title: 'Insight Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta & SEO' },
  ],
  fields: [
    defineField({ name: 'title', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Hero image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'body', type: 'blockContent', group: 'content' }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'teamMember' }],
      group: 'content',
    }),
    defineField({ name: 'publishedAt', type: 'datetime', group: 'content', initialValue: () => new Date().toISOString() }),
    defineField({
      name: 'cluster',
      title: 'Cluster',
      type: 'string',
      group: 'content',
      options: { list: CLUSTERS, layout: 'radio' },
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      options: { layout: 'tags' },
    }),
    defineField({ name: 'featured', type: 'boolean', group: 'content', initialValue: false }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      group: 'content',
    }),
    defineField({
      name: 'relatedPosts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'post' }] }],
      group: 'content',
    }),
    defineField({ name: 'metaTitle', type: 'string', group: 'meta' }),
    defineField({ name: 'metaDescription', type: 'text', rows: 2, group: 'meta' }),
    defineField({ name: 'ogImage', type: 'image', group: 'meta' }),
  ],
  orderings: [
    { title: 'Published (newest)', name: 'pubDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'cluster', media: 'mainImage', author: 'author.name' },
    prepare: ({ title, subtitle, media, author }) => ({
      title,
      subtitle: [author, subtitle].filter(Boolean).join(' · '),
      media,
    }),
  },
});
