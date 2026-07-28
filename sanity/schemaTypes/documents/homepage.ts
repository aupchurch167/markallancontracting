import { defineType, defineField } from 'sanity';

/**
 * Home page media, edited from the /admin console (images stored in R2, this
 * singleton just holds their public URLs + alt text). Studio can view/edit it
 * too. Each slot is a plain {url, alt} object because the files live in R2, not
 * Sanity's asset store.
 */
const imageRef = {
  type: 'object',
  fields: [
    { name: 'url', type: 'url', title: 'Image URL' },
    { name: 'alt', type: 'string', title: 'Alt text' },
  ],
  preview: { select: { title: 'alt', subtitle: 'url' } },
};

export const homepage = defineType({
  name: 'homepage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroImage', title: 'Hero photo', ...imageRef }),
    defineField({ name: 'aboutImage', title: 'About / history photo', ...imageRef }),
    defineField({
      name: 'galleryImages',
      title: '“On the job” gallery',
      type: 'array',
      of: [imageRef],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
});
