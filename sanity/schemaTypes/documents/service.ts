import { defineType, defineField } from 'sanity';

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'h1', type: 'string', description: 'Service + primary geo.' }),
    defineField({ name: 'metaTitle', type: 'string' }),
    defineField({ name: 'metaDescription', type: 'text', rows: 2 }),
    defineField({
      name: 'problemStatement',
      title: 'Problem Statement',
      type: 'array',
      of: [{ type: 'block' }],
      description: "Specific to this service. A restaurant operator's problem is not an office tenant's.",
    }),
    defineField({
      name: 'scopeItems',
      title: "What's Included (trade by trade)",
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'typicalRange', type: 'string', description: 'e.g. "$75K–$300K"' }),
    defineField({ name: 'typicalTimeline', type: 'string' }),
    defineField({ name: 'planSteps', type: 'array', of: [{ type: 'planStep' }] }),
    defineField({
      name: 'relatedProjects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({
      name: 'cities',
      title: 'Cities (drives matrix generation)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'city' }] }],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
