import type { Config } from 'tailwindcss';

/**
 * "Jobsite Editorial" design tokens.
 *
 * Warm paper ground, near-black ink, maroon brand accent, editorial grays.
 * Display type is Barlow Condensed (uppercase), body is Barlow. Sharp corners
 * (2px only on buttons/inputs), hairline rules.
 *
 * Legacy names (oxblood/bone/brass/navy/accent/stone) are kept and re-pointed so
 * pages not yet migrated to the new primitives still render on the new ground.
 */
const MAROON = { DEFAULT: '#5A2634', dark: '#431C26', light: '#7A3446' };

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jobsite Editorial palette
        paper: { DEFAULT: '#F7F4F1', alt: '#EFEAE6' },
        ink: { DEFAULT: '#1D1517', deep: '#15100F' },
        body: '#3D3234',
        muted: '#6B5D60',
        faint: '#8A7C7F',
        maroon: MAROON,
        rose: '#C9A8B0',
        cream: { DEFAULT: '#F2ECE8', muted: '#BCA9AD' },
        darkcard: '#241B1E',
        hairline: 'rgba(29,21,23,0.12)',

        // Brand accent still available under its old name (== maroon)
        oxblood: { DEFAULT: '#5A2634', 900: '#431C26', 700: '#5A2634', 600: '#7A3446' },
        brass: { DEFAULT: '#A98B62', 600: '#A98B62', 700: '#8C7150' },

        // Legacy remaps → new ground so un-migrated pages still read
        bone: { DEFAULT: '#F7F4F1', light: '#EFEAE6' },
        white: '#F7F4F1',
        navy: { DEFAULT: '#5A2634', 900: '#431C26', 700: '#5A2634', 600: '#7A3446' },
        accent: { DEFAULT: '#A98B62', 600: '#A98B62', 700: '#8C7150' },
        stone: {
          50: '#EFEAE6',
          100: '#E4DED8',
          200: 'rgba(29,21,23,0.15)',
          400: '#8A7C7F',
          600: '#6B5D60',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Barlow', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', "'Barlow Condensed'", 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        wordmark: '0.05em',
        heading: '0.01em',
        label: '0.14em',
        body: '0',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
