import type { Config } from 'tailwindcss';

/**
 * Print-system design tokens (presentation folder + proposal cover).
 *
 * Exactly three flat colors — oxblood, bone, brass — no gradients. The legacy
 * token names (navy/accent/ink/paper/stone) are remapped onto the new palette so
 * existing markup adopts the system without a second styling layer:
 *   navy/ink  → oxblood (brand + text on bone)
 *   accent    → brass   (accent only: rules, labels, link hover)
 *   paper     → bone    (page background; pure white is not in the palette)
 *   white     → bone    (text on oxblood is bone, never #FFF)
 *   stone-*   → bone tints, a brass hairline, and muted-oxblood text
 */
const OXBLOOD = { DEFAULT: '#5A2634', 900: '#49202B', 700: '#5A2634', 600: '#6C3140' };
const BRASS = { DEFAULT: '#A98B62', 600: '#A98B62', 700: '#8C7150' };

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Named system tokens
        oxblood: OXBLOOD,
        bone: { DEFAULT: '#E8E1D5', light: '#F1EBE1' },
        brass: BRASS,

        // Legacy remaps → new palette
        white: '#E8E1D5',
        navy: OXBLOOD,
        accent: BRASS,
        ink: '#5A2634',
        paper: '#E8E1D5',
        stone: {
          50: '#F1EBE1', // second lighter surface
          100: '#DCD4C5', // faint fill / image placeholder, still legible on oxblood
          200: '#C8B69B', // brass hairline (~brass at 0.5 on bone)
          400: '#9A7C84', // small-caps labels / meta (muted oxblood)
          600: '#835F65', // secondary body text (oxblood at ~65% on bone)
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', "'Helvetica Neue'", 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        wordmark: '0.06em',
        heading: '0.04em',
        label: '0.2em',
        body: '0.02em',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
