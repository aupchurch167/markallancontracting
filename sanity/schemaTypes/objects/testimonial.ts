import { defineType, defineField } from 'sanity';

/** A client quote attached to a project. */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3 }),
    defineField({ name: 'attribution', title: 'Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role / company', type: 'string' }),
  ],
  preview: {
    select: { title: 'attribution', subtitle: 'quote' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Testimonial', subtitle }),
  },
});
