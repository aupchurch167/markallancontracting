/**
 * The team, carried over from macont.com/about so the /team page ships with the
 * real people and photos (in public/team/*). Roles are exactly as listed on the
 * current site; bios are written in the site voice around each person's role —
 * honest and role-focused, not invented personal history. Editable in Sanity,
 * which overrides this per-slug once teamMember documents exist.
 */
export interface FallbackTeamMember {
  slug: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  email?: string;
}

export const FALLBACK_TEAM: FallbackTeamMember[] = [
  {
    slug: 'adam-upchurch',
    name: 'Adam Upchurch',
    role: 'Business Development',
    photo: '/team/adam-upchurch.jpg',
    bio: 'Usually the first person you talk to. Adam walks the space, scopes the work, and gets you a real number you can take to your owner.',
    email: 'adam@macont.com',
  },
  {
    slug: 'justin-upchurch',
    name: 'Justin Upchurch',
    role: 'Sr. Project Manager',
    photo: '/team/justin-upchurch.jpg',
    bio: 'Runs jobs start to finish — scope, budget, schedule, and the paperwork. If you’re getting an update, it’s usually coming from Justin.',
    email: 'justin@macont.com',
  },
  {
    slug: 'brian-helton',
    name: 'Brian Helton',
    role: 'Superintendent',
    photo: '/team/brian-helton.jpg',
    bio: 'Runs the site day to day — sequencing the trades, keeping the work moving, and catching problems in the field before they cost you.',
    email: 'brian@macont.com',
  },
  {
    slug: 'nick-demarco',
    name: 'Nick DeMarco',
    role: 'Project Coordinator',
    photo: '/team/nick-demarco.jpg',
    bio: 'Keeps the moving parts moving — permits, submittals, scheduling, and the coordination that keeps a job from stalling.',
    email: 'nick@macont.com',
  },
];
