import type { Config } from 'tailwindcss';

/**
 * Custom design tokens. No UI kit.
 *
 * Brand hex values are the *assumed* values from the build spec and are flagged
 * as an open item ({{BRAND_NAVY}} / {{BRAND_ACCENT}}) — verify against
 * macont.com before launch and update here + in lib/constants.ts together.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // TODO(brand): verify against macont.com — assumed values only.
        navy: {
          DEFAULT: '#1B3A5C',
          900: '#122A44',
          700: '#1B3A5C',
          600: '#244B72',
        },
        accent: {
          DEFAULT: '#2E75B6',
          600: '#2E75B6',
          700: '#255F95',
        },
        ink: '#14212E',
        paper: '#FFFFFF',
        stone: {
          50: '#F7F8FA',
          100: '#EEF1F4',
          200: '#DCE2E8',
          400: '#8A97A6',
          600: '#556270',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
