import { defineType, defineField } from 'sanity';

/**
 * The unique content for a matrix page. Route generation is GATED on this
 * document existing — that enforces the anti-thin-content rule at the data
 * layer instead of relying on discipline. Every required field below is one of
 * the three mandatory unique blocks (or the meta that must not be templated).
 */
export const serviceCity = defineType({
  name: 'serviceCity',
  title: 'Service × City',
  type: 'document',
  fields: [
    defineField({
      name: 'service',
      type: 'reference',
      to: [{ type: 'service' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'city',
      type: 'reference',
      to: [{ type: 'city' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'h1',
      title: 'H1 (required, unique)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title (required, unique)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description (required, unique)',
      type: 'text',
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'localProjectRef',
      title: 'Local Project Reference (required)',
      type: 'reference',
      to: [{ type: 'project' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'localProjectNote',
      title: 'Local Project Note (required — one paragraph of specifics)',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { service: 'service.title', city: 'city.name', state: 'city.state' },
    prepare: ({ service, city, state }) => ({
      title: `${service || '—'} × ${city || '—'}`,
      subtitle: state ? `${city}, ${state?.toUpperCase()}` : undefined,
    }),
  },
});
