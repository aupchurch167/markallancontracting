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
    defineField({
      name: 'heroImageUrl',
      title: 'Hero image URL (R2)',
      type: 'url',
      group: 'content',
      description:
        'External hero image (Cloudflare R2), set by the /admin console. Used when no Sanity hero image is uploaded above.',
    }),
    defineField({
      name: 'attachments',
      title: 'Attachments (R2)',
      type: 'array',
      group: 'content',
      description: 'Source files uploaded with this post (images, PDFs) stored in R2.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'url', type: 'url', title: 'URL' },
            { name: 'contentType', type: 'string', title: 'Content type' },
          ],
          preview: { select: { title: 'label', subtitle: 'contentType' } },
        },
      ],
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'bodyMarkdown',
      title: 'Body (Markdown)',
      type: 'text',
      rows: 24,
      group: 'content',
      description:
        'Markdown body, authored from the /admin console. When set, it renders instead of the rich-text Body below.',
    }),
    defineField({
      name: 'body',
      title: 'Body (rich text)',
      type: 'blockContent',
      group: 'content',
      description: 'Used only when Body (Markdown) is empty.',
    }),
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
