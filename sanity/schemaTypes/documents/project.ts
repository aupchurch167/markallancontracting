import { defineType, defineField } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'details', title: 'Details' },
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
      name: 'images',
      title: 'Photos (CompanyCam sourced)',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
    }),
    defineField({ name: 'scopeSummary', type: 'text', rows: 2, group: 'content' }),
    defineField({ name: 'challenge', type: 'blockContent', group: 'content' }),
    defineField({ name: 'solution', type: 'blockContent', group: 'content' }),
    defineField({ name: 'testimonial', type: 'testimonial', group: 'content' }),

    defineField({ name: 'clientType', type: 'string', group: 'details' }),
    defineField({ name: 'service', title: 'Project type', type: 'reference', to: [{ type: 'service' }], group: 'details' }),
    defineField({ name: 'city', type: 'reference', to: [{ type: 'city' }], group: 'details' }),
    defineField({ name: 'timeline', type: 'string', group: 'details' }),
    defineField({ name: 'squareFootage', title: 'Square footage', type: 'string', group: 'details' }),
    defineField({ name: 'completedDate', title: 'Completed', type: 'date', group: 'details' }),
    defineField({
      name: 'highlights',
      title: 'Highlights (stat row)',
      type: 'array',
      of: [{ type: 'statHighlight' }],
      group: 'details',
    }),
    defineField({ name: 'featured', type: 'boolean', group: 'details', initialValue: false }),
    defineField({
      name: 'status',
      type: 'string',
      group: 'details',
      description: 'Only "delivered" is ever shown. Active prospects never appear.',
      options: { list: ['delivered'] },
      initialValue: 'delivered',
      validation: (r) =>
        r.required().custom((v) =>
          v === 'delivered' ? true : 'Only delivered projects may be published.',
        ),
    }),
  ],
  orderings: [
    { title: 'Completed (newest)', name: 'completedDesc', by: [{ field: 'completedDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', clientType: 'clientType', media: 'images.0' },
    prepare: ({ title, clientType, media }) => ({ title, subtitle: clientType, media }),
  },
});
