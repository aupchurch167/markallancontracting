import { defineType, defineField } from 'sanity';

export const city = defineType({
  name: 'city',
  title: 'City',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'state', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: (doc: any) => `${doc.name}-${doc.state}`.toLowerCase() },
      description: 'e.g. alpharetta-ga',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'county', type: 'string' }),
    defineField({
      name: 'jurisdictionNote',
      title: 'Jurisdiction Note (required — permitting specifics)',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'intro', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'tier',
      type: 'number',
      description: '1 (hand-written), 2 (templated), or 3 (gated).',
      options: { list: [1, 2, 3] },
    }),
  ],
  preview: {
    select: { name: 'name', state: 'state', tier: 'tier' },
    prepare: ({ name, state, tier }) => ({
      title: `${name}, ${state?.toUpperCase()}`,
      subtitle: tier ? `Tier ${tier}` : undefined,
    }),
  },
});
