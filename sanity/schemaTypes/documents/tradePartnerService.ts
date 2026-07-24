import { defineType, defineField } from 'sanity';

/**
 * GATED. Built, not published. Every capability field is nullable and the page
 * renders a labeled placeholder when null — never a fabricated value. Ships with
 * published:false until real figures arrive and the schedule-reliability
 * question is resolved.
 */
export const tradePartnerService = defineType({
  name: 'tradePartnerService',
  title: 'Trade Partner Service (gated)',
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
    // Capability fields — all nullable, all screened-for by PMs above the fold.
    defineField({ name: 'crewSizes', type: 'string' }),
    defineField({ name: 'mobilizationTime', type: 'string' }),
    defineField({ name: 'selfPerformed', type: 'boolean' }),
    defineField({ name: 'insuranceLimits', type: 'string' }),
    defineField({ name: 'wcModRate', title: 'W/C Mod Rate', type: 'string' }),
    defineField({ name: 'bondingCapacity', type: 'string' }),
    defineField({ name: 'statesLicensed', type: 'string' }),
    defineField({ name: 'safetyRecord', type: 'string' }),
    defineField({ name: 'prevailingWageExperience', type: 'boolean' }),
    defineField({ name: 'unionExperience', type: 'boolean' }),
    defineField({
      name: 'published',
      type: 'boolean',
      initialValue: false,
      description: 'Gated. Keep false until real values + reliability question resolved.',
    }),
  ],
  preview: { select: { title: 'title', published: 'published' },
    prepare: ({ title, published }) => ({
      title,
      subtitle: published ? 'published' : 'gated (unpublished)',
    }),
  },
});
