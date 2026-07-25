import { defineType, defineField } from 'sanity';

/** A single labeled stat, e.g. "12 weeks" / "Timeline" on a project. */
export const statHighlight = defineType({
  name: 'statHighlight',
  title: 'Highlight',
  type: 'object',
  fields: [
    defineField({ name: 'value', title: 'Value', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
  ],
  preview: {
    select: { value: 'value', label: 'label' },
    prepare: ({ value, label }) => ({ title: value, subtitle: label }),
  },
});
