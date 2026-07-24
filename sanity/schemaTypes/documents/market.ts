import { defineType, defineField } from 'sanity';

export const market = defineType({
  name: 'market',
  title: 'Market',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'h1', type: 'string' }),
    defineField({ name: 'metaTitle', type: 'string' }),
    defineField({ name: 'metaDescription', type: 'text', rows: 2 }),
    defineField({
      name: 'audienceProblem',
      title: 'Audience Problem',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'relevantServices',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
    defineField({
      name: 'relatedProjects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
