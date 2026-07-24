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
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2 }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'author', type: 'string' }),
    defineField({ name: 'publishedAt', type: 'datetime' }),
    defineField({
      name: 'cluster',
      type: 'string',
      options: { list: CLUSTERS },
    }),
    defineField({
      name: 'relatedServices',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
    defineField({ name: 'metaTitle', type: 'string' }),
    defineField({ name: 'metaDescription', type: 'text', rows: 2 }),
    defineField({ name: 'ogImage', type: 'image' }),
  ],
  preview: { select: { title: 'title', subtitle: 'cluster' } },
});
