/**
 * Fallback copy for the initial campaign landing pages, overridden by the Sanity
 * `landingPage` document when authored (the goal is publishing a new LP from
 * Sanity in under 10 minutes with no code change). One message per traffic
 * source. Always noindex,nofollow. Never in sitemap.
 */
export interface LpContent {
  headline: string;
  subhead: string;
  problem: string;
  plan: string[];
  proofLine: string;
}

export const LP_CONTENT: Record<string, LpContent> = {
  'restaurant-buildout': {
    headline: 'Restaurant buildouts that open on time.',
    subhead: 'Metro Atlanta and across the Southeast. Over a hundred franchise buildouts.',
    problem:
      'Every day past your target open date is revenue you do not get back. You need a GC who has run the hood, grease, and health-department sequence before — not one learning it on your job.',
    plan: ['Walk the space', 'Get a real number', 'We build to your open date'],
    proofLine: 'Over a hundred Domino’s buildouts. Work for Darden since.',
  },
  'trade-partner': {
    headline: 'Interior crews that make your schedule.',
    subhead: 'Framing, drywall, paint, ACT, and flooring under one contract.',
    problem:
      'A sub that no-shows Monday makes you look bad to your own client. You need interior trades that show up and perform.',
    plan: ['Send the scope and dates', 'We confirm crew size and mobilization', 'We’re on site when we said'],
    proofLine: '25+ years self-performing interior trades. Licensed in four states.',
  },
  lsa: {
    headline: 'Commercial buildouts and renovations. Metro Atlanta.',
    subhead: 'Family-owned since 1999. Get a real number, not a range.',
    problem:
      'You have a space that needs work and a date it has to be ready by. You need someone who gives you a real number, starts when they said, and picks up when you call.',
    plan: ['Walk the space', 'Get a real number', 'We build'],
    proofLine: '25 years. Four states. Projects from $50K to $500K.',
  },
};

export const LP_SLUGS = Object.keys(LP_CONTENT);
