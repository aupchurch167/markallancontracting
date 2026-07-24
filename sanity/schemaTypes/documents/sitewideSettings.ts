import { defineType, defineField } from 'sanity';

/**
 * Singleton. Everything in lib/constants.ts reads from here so NAP has one
 * source of truth that must match the Google Business Profile exactly.
 */
export const sitewideSettings = defineType({
  name: 'sitewideSettings',
  title: 'Sitewide Settings',
  type: 'document',
  fields: [
    defineField({ name: 'phone', title: 'Phone (display)', type: 'string' }),
    defineField({ name: 'phoneRaw', title: 'Phone (tel: format)', type: 'string' }),
    defineField({ name: 'email', type: 'string' }),
    defineField({ name: 'addressStreet', type: 'string' }),
    defineField({ name: 'addressCity', type: 'string' }),
    defineField({ name: 'addressState', type: 'string' }),
    defineField({ name: 'addressZip', type: 'string' }),
    defineField({ name: 'hours', type: 'string' }),
    defineField({ name: 'gbpUrl', title: 'Google Business Profile URL', type: 'url' }),
    defineField({ name: 'callRailId', title: 'CallRail DNI ID', type: 'string' }),
    defineField({ name: 'ga4Id', title: 'GA4 Property ID', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Sitewide Settings' }) },
});
