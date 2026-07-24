import { defineType, defineField } from 'sanity';

/** Renders at /lp/[slug]. Always noindex,nofollow. Never in sitemap. */
export const landingPage = defineType({
  name: 'landingPage',
  title: 'Campaign Landing Page',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      validation: (r) => r.required(),
      description: 'Renders at /lp/[slug]',
    }),
    defineField({
      name: 'campaignSource',
      type: 'string',
      options: { list: ['apollo', 'lsa', 'paid'] },
    }),
    defineField({ name: 'headline', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'subhead', type: 'text', rows: 2 }),
    defineField({
      name: 'problemCopy',
      title: 'Problem Copy (two sentences)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({ name: 'planSteps', type: 'array', of: [{ type: 'planStep' }] }),
    defineField({ name: 'proofLogos', type: 'array', of: [{ type: 'image' }] }),
    defineField({
      name: 'ctaText',
      type: 'string',
      description: 'Defaults to the call CTA.',
    }),
  ],
  preview: { select: { title: 'headline', subtitle: 'campaignSource' } },
});
