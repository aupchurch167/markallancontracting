import { defineType, defineField } from 'sanity';

export const planStep = defineType({
  name: 'planStep',
  title: 'Plan Step',
  type: 'object',
  fields: [
    defineField({ name: 'stepNumber', title: 'Step Number', type: 'number' }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'stepNumber' },
    prepare: ({ title, subtitle }) => ({
      title: title || 'Step',
      subtitle: subtitle ? `Step ${subtitle}` : undefined,
    }),
  },
});
