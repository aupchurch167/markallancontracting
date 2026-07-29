import { getHomepageValue } from './content';

/** One image slot on the home page. */
export interface MediaSlot {
  url: string;
  alt: string;
}

export interface HomepageMedia {
  hero: MediaSlot;
  about: MediaSlot;
  gallery: MediaSlot[];
}

/**
 * The photos the home page ships with. These render until the `homepage`
 * singleton is edited from /admin, and are the source of truth the admin
 * console shows as the current state before the first save.
 */
export const HOMEPAGE_FALLBACK: HomepageMedia = {
  hero: {
    url: '/projects/kennesaw-pilates-studio/4.jpg',
    alt: 'Completed Pilates studio buildout in Kennesaw, Georgia',
  },
  about: {
    url: '/projects/paint-12-buildings/1.jpg',
    alt: 'Exterior repaint across a 12-building commercial property',
  },
  gallery: [
    {
      url: '/projects/kennesaw-pilates-studio/2.jpg',
      alt: 'Pilates studio buildout — open workout floor, Kennesaw, GA',
    },
    {
      url: '/projects/kennesaw-pilates-studio/3.jpg',
      alt: 'Interior finish work on a Pilates studio buildout',
    },
    {
      url: '/projects/tanning-salon-buildout/2.jpg',
      alt: 'Tanning salon buildout — interior finishes',
    },
    {
      url: '/projects/tanning-salon-buildout/3.jpg',
      alt: 'Tanning salon buildout — tenant space',
    },
    {
      url: '/projects/tanning-salon-buildout/4.jpg',
      alt: 'Tanning salon buildout — completed interior',
    },
  ],
};

function slot(v: { url?: string; alt?: string } | undefined, fallback: MediaSlot): MediaSlot {
  return v?.url ? { url: v.url, alt: v.alt || fallback.alt } : fallback;
}

/**
 * Home page media: the value edited from /admin (stored in the CMS) wins, with
 * the shipped fallback filling any empty slot. Safe before the CMS is populated.
 */
export async function getHomepageMedia(): Promise<HomepageMedia> {
  const v = await getHomepageValue();
  if (!v) return HOMEPAGE_FALLBACK;
  const gallery = (v.gallery || []).filter((g) => g?.url);
  return {
    hero: slot(v.hero, HOMEPAGE_FALLBACK.hero),
    about: slot(v.about, HOMEPAGE_FALLBACK.about),
    gallery: gallery.length ? gallery : HOMEPAGE_FALLBACK.gallery,
  };
}
