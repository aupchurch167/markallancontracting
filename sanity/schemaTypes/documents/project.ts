import { defineType, defineField } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'clientType', type: 'string' }),
    defineField({ name: 'service', type: 'reference', to: [{ type: 'service' }] }),
    defineField({ name: 'city', type: 'reference', to: [{ type: 'city' }] }),
    defineField({ name: 'scopeSummary', type: 'text', rows: 2 }),
    defineField({ name: 'timeline', type: 'string' }),
    defineField({ name: 'challenge', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'solution', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'images',
      title: 'Images (CompanyCam sourced)',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
        },
      ],
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'status',
      type: 'string',
      description: 'Only "delivered" is ever shown. Active prospects never appear.',
      options: { list: ['delivered'] },
      initialValue: 'delivered',
      validation: (r) =>
        r.required().custom((v) =>
          v === 'delivered' ? true : 'Only delivered projects may be published.',
        ),
    }),
  ],
  preview: {
    select: { title: 'title', clientType: 'clientType', media: 'images.0' },
    prepare: ({ title, clientType, media }) => ({ title, subtitle: clientType, media }),
  },
});
