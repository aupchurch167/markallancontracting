/**
 * Blog cluster content, authored in the site voice (down-funnel: plain,
 * specific, answers the question). These render until the Sanity `post`
 * documents are authored, at which point Sanity wins with zero code changes.
 *
 * Body is a small block union rendered by components/FallbackArticle.tsx.
 * Ground-up cluster is first — it carries the most strategic weight per the
 * spec (developer credibility ahead of a ground-up portfolio). No responsiveness
 * guarantees; no invented project references.
 */

export type Block =
  | { h2: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] };

export interface FallbackPost {
  slug: string;
  title: string;
  excerpt: string;
  cluster: 'ground-up' | 'cost-budget' | 'process-timeline' | 'broker-pm';
  author: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  body: Block[];
}

const AUTHOR = 'Mark Allan Contracting';

export const FALLBACK_POSTS: FallbackPost[] = [
  // ---------------------------------------------------------------------------
  // Ground-up authority (priority cluster)
  // ---------------------------------------------------------------------------
  {
    slug: 'what-owners-get-wrong-about-pre-construction-budgets',
    title: 'What owners get wrong about pre-construction budgets',
    excerpt:
      'A per-square-foot number is not a budget. Here is where ground-up budgets actually go sideways, and how to catch it before you commit.',
    cluster: 'ground-up',
    author: AUTHOR,
    publishedAt: '2025-02-04',
    metaTitle: 'What Owners Get Wrong About Pre-Construction Budgets',
    metaDescription:
      'The pre-construction budget mistakes that cost owners the most on ground-up commercial projects — and how to build a number that holds.',
    body: [
      {
        p: 'The number that kills a project is almost never the one on the contract. It is the one an owner carried in their head for six months before anyone priced the real scope. By the time a contractor is in the room, the budget has already been promised to a lender or a partner, and now the job is to defend a figure that was never built from the actual work.',
      },
      { h2: 'A per-square-foot number is not a budget' },
      {
        p: 'Cost per square foot is a useful sanity check and a terrible planning tool. Two buildings of identical size can differ by half on cost because one has a grease-laden kitchen, a tenant with a heavy power draw, or a site that needs a retaining wall the other does not. When an owner anchors to a per-foot figure they saw on a comparable deal, they are budgeting for a building that is not theirs.',
      },
      {
        p: 'A real budget is built from the scope up: sitework, shell, systems, and finish, each priced against what this building on this site actually requires. It takes longer to produce. It is also the only number worth defending.',
      },
      { h2: 'Where the money actually hides' },
      {
        ul: [
          'Site and civil — grading, utilities, stormwater, and anything the jurisdiction requires before you can build vertical. This is the line that surprises owners most, because it is invisible on a floor plan.',
          'Long-lead equipment — switchgear, rooftop units, and specialty items that now carry lead times measured in months. Order late and you pay for the schedule in overtime later.',
          'Code triggers — an occupancy change or a use the building was not designed for can pull in fire suppression, ADA upgrades, and accessibility work that were never in the owner’s mental model.',
          'Allowances that were really guesses — a budget full of round-number allowances is a budget that has not been scoped. Each one is a change order waiting to happen.',
        ],
      },
      { h2: 'Bring the GC in before the drawings are done' },
      {
        p: 'The cheapest time to change something is before it is drawn. A contractor in the room during budgeting catches the conditions, the code triggers, and the long-lead items while they are still cheap to solve — a redline instead of a demolition. Wait until the drawings are complete and you are pricing decisions that were already made for you, whether they made budget sense or not.',
      },
      {
        p: 'If you are being asked for a number before anyone knows the scope, that is the signal to start pre-construction, not to guess. Call us and we will help you build a number you can actually stand behind.',
      },
    ],
  },
  {
    slug: 'shell-vs-full-buildout-what-a-developer-should-scope-to-a-gc',
    title: 'Shell vs. full buildout: what a developer should scope to a GC',
    excerpt:
      'Where the shell ends and the buildout begins is a decision, not a given. Getting the line right protects your budget and your schedule.',
    cluster: 'ground-up',
    author: AUTHOR,
    publishedAt: '2025-02-18',
    metaTitle: 'Shell vs. Full Buildout: What to Scope to a GC',
    metaDescription:
      'How developers should draw the line between shell and tenant buildout when scoping a ground-up commercial project to a general contractor.',
    body: [
      {
        p: 'On a ground-up commercial project, one of the first real decisions is where the shell ends and the tenant work begins. Draw the line in the wrong place and you either over-build a shell for a tenant who wanted it a different way, or you deliver a box so bare that every deal stalls on a build-out negotiation.',
      },
      { h2: 'What a shell usually includes' },
      {
        p: 'A cold shell is the building envelope and the bones: structure, roof, exterior walls, and the utilities stubbed to the space. A warm shell goes further — it might include a finished storefront, a base HVAC system, restrooms, and a demising layout ready for tenants. Neither is wrong. The right level depends on who you are leasing to and how fast you need them in.',
      },
      { h2: 'The trade-off, plainly' },
      {
        ul: [
          'Build more shell, and you spend your money before you have a signed tenant — but you shorten every future buildout and make the space easier to lease.',
          'Build less shell, and you preserve capital and flexibility — but every tenant negotiation now includes a construction scope, and your timeline to rent commencement gets longer.',
        ],
      },
      {
        p: 'For speculative space with unknown tenants, a warm shell with restrooms and base systems usually pays for itself in leasing speed. For a build-to-suit with a known tenant, scope the shell to exactly what their buildout needs and not a stud more.',
      },
      { h2: 'Scope the line explicitly' },
      {
        p: 'The most expensive ambiguity in commercial construction is a scope gap — the item that both the shell contract and the tenant contract assumed the other one covered. Storefront, rooftop units, electrical service size, and restroom rough-in are the usual suspects. Put each one in writing on one side of the line or the other before anyone prices it.',
      },
      {
        p: 'This is exactly the conversation pre-construction is for. Bring a GC in while the line is still a decision and not a dispute, and you will scope a shell that leases fast and buildouts that price clean.',
      },
    ],
  },
  {
    slug: 'ground-up-timeline-metro-atlanta-entitlement-to-co',
    title: 'Ground-up timeline in Metro Atlanta: entitlement to CO',
    excerpt:
      'What actually drives a ground-up schedule in Metro Atlanta — and why the calendar is set long before the first slab is poured.',
    cluster: 'ground-up',
    author: AUTHOR,
    publishedAt: '2025-03-04',
    metaTitle: 'Ground-Up Timeline in Metro Atlanta: Entitlement to CO',
    metaDescription:
      'A realistic ground-up commercial construction timeline in Metro Atlanta, from entitlement and permitting through certificate of occupancy.',
    body: [
      {
        p: 'Owners tend to measure a ground-up schedule from the day the crews show up. The calendar was actually set months earlier, in entitlement and permitting, where most of the real time lives and almost none of the visible progress does.',
      },
      { h2: 'The phases, and where the time goes' },
      {
        ol: [
          'Entitlement and site plan approval — rezoning, variances, and land disturbance approval. In much of Metro Atlanta this is the longest and least predictable stretch, driven by the jurisdiction’s review cycle and public hearing calendar, not by you.',
          'Permitting — building permit review runs in parallel with the tail of entitlement where possible. Plan review comments and resubmittals are the usual source of delay.',
          'Sitework — grading, utilities, and stormwater. Weather-sensitive and often the first place a schedule slips when the rain comes.',
          'Vertical construction — shell, then systems, then finish. The most predictable phase, because it is the one a contractor controls most directly.',
          'Inspections and certificate of occupancy — final inspections across trades, then CO. Book these early; inspection backlogs are real and outside your control.',
        ],
      },
      { h2: 'Why the front end matters more than the back' },
      {
        p: 'A contractor can compress vertical construction with crews and sequencing. Nobody compresses a rezoning hearing. That is why a realistic ground-up timeline is dominated by the entitlement and permitting front end — and why the single most useful thing an owner can do for their schedule is start that front end early and with eyes open about the local jurisdiction.',
      },
      {
        p: 'We are strongest at the pre-construction and shell end of ground-up work, where the schedule is actually won or lost. If you are mapping a timeline for a Metro Atlanta project, call us early and we will help you build one that accounts for the parts you do not control.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Cost & Budget
  // ---------------------------------------------------------------------------
  {
    slug: 'what-a-tenant-improvement-actually-costs-per-square-foot',
    title: 'What a tenant improvement actually costs per square foot',
    excerpt:
      'Why the per-foot range is so wide, and what actually moves your tenant improvement number up or down.',
    cluster: 'cost-budget',
    author: AUTHOR,
    publishedAt: '2025-01-14',
    metaTitle: 'What a Tenant Improvement Actually Costs Per Square Foot',
    metaDescription:
      'A straight answer on tenant improvement cost per square foot — the range, what drives it, and why your number is probably not the average.',
    body: [
      {
        p: 'Everyone wants a per-foot number for a tenant improvement, and everyone is a little disappointed by the honest answer: it depends, and the range is wide. A light cosmetic refresh and a full restaurant buildout can both be called a "TI," and they are not remotely the same job.',
      },
      { h2: 'What moves the number' },
      {
        ul: [
          'Use — an open office finishes far cheaper per foot than a commercial kitchen or a medical suite with special plumbing and power.',
          'Existing conditions — a second-generation space with usable infrastructure costs less than a raw shell where every system starts from nothing.',
          'Systems — HVAC, electrical capacity, and plumbing are where budgets swing hardest. Moving a bathroom is not a finish decision, it is a plumbing project.',
          'Finishes — the same square footage can be builder-standard or brand-flagship, and the spec sheet is entirely in the tenant’s control.',
        ],
      },
      { h2: 'Why a number beats a range' },
      {
        p: 'A per-foot range tells you whether you are in the right universe. It does not tell you what your job costs. The only figure worth budgeting against is one built from your scope, in your space, with your finishes — a scoped estimate, not an average pulled from someone else’s project.',
      },
      {
        p: 'That is what a site walk gets you. We come out, look at the actual conditions, and hand you a real number you can take to your owner. Call us and we will set one up.',
      },
    ],
  },
  {
    slug: 'restaurant-buildout-budget-breakdown',
    title: 'Restaurant buildout budget breakdown',
    excerpt:
      'Where the money goes in a restaurant buildout — and which lines are the ones that blow up a budget when they are underscoped.',
    cluster: 'cost-budget',
    author: AUTHOR,
    publishedAt: '2025-01-28',
    metaTitle: 'Restaurant Buildout Budget Breakdown',
    metaDescription:
      'A line-by-line look at where a restaurant buildout budget goes, and the items most likely to blow up if they are underscoped.',
    body: [
      {
        p: 'A restaurant buildout has more ways to go over budget than almost any other interior, because so much of the cost lives in systems you cannot see on a floor plan. Here is where the money actually goes.',
      },
      { h2: 'The big lines' },
      {
        ul: [
          'Kitchen and equipment — the single largest category on most builds. Equipment set, connections, and the coordination around it.',
          'Hood, make-up air, and exhaust — mechanical work driven by code, not by preference, and easy to underestimate.',
          'Grease interceptor and plumbing — often a below-slab, jurisdiction-specific requirement that lands hard when it is missed early.',
          'Walk-in coolers and freezers — refrigeration, drainage, and the electrical to support it.',
          'MEP upgrades — restaurants pull far more power and water than the space was likely built for, so service upgrades are common.',
          'Dining room and finishes — the visible part, and usually not where the budget risk lives.',
        ],
      },
      { h2: 'The lines that blow up budgets' },
      {
        p: 'The overruns are almost never the dining room. They are the grease interceptor the health department requires, the make-up air the mechanical code demands, and the electrical service that has to be upsized because the panel was never sized for a kitchen. Scope those early and honestly and the rest of the budget behaves.',
      },
      {
        p: 'We have done over a hundred franchise buildouts, so this sequence is not new to us. If you are budgeting a restaurant, call us and we will help you price the lines that actually matter.',
      },
    ],
  },
  {
    slug: 'why-three-gc-bids-come-back-at-three-different-numbers',
    title: 'Why three GC bids come back at three different numbers',
    excerpt:
      'Three bids, three numbers, and none of them wrong. Here is how to read the spread instead of just picking the low one.',
    cluster: 'cost-budget',
    author: AUTHOR,
    publishedAt: '2025-02-11',
    metaTitle: 'Why Three GC Bids Come Back at Three Different Numbers',
    metaDescription:
      'How to read a spread of general contractor bids — why the numbers differ, and why the lowest one is often the most expensive.',
    body: [
      {
        p: 'You send the same drawings to three general contractors and get back three numbers that are nowhere near each other. It is tempting to assume someone is padding or someone is desperate. Usually the truth is duller and more useful: they scoped it differently.',
      },
      { h2: 'What creates the spread' },
      {
        ul: [
          'Assumptions about the unknowns — where the drawings are silent, each GC fills the gap with an assumption. A low bid often assumes the best case for every gap.',
          'Allowances and exclusions — one bid carries a real number for a scope item; another excludes it entirely and it reappears as a change order later.',
          'Subcontractor coverage — the subs each GC got pricing from, and how hungry those subs are this quarter.',
          'What is actually self-performed — a GC that self-performs the interior trades prices differently than one marking up four separate subs.',
        ],
      },
      { h2: 'Read the exclusions, not just the total' },
      {
        p: 'The most expensive bid is often the low one, because the gap between its number and the real cost shows up as change orders after you have already signed. Before you compare totals, compare what each bid includes and excludes. A slightly higher number with nothing hidden in the exclusions is almost always the cheaper job.',
      },
      {
        p: 'When we price a job, the goal is a number you can hand to your owner and trust — scope in, exclusions clear, no surprises waiting on the final invoice. Call us and we will walk you through what a real bid should spell out.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Process & Timeline
  // ---------------------------------------------------------------------------
  {
    slug: 'how-long-a-commercial-buildout-takes',
    title: 'How long a commercial buildout takes',
    excerpt:
      'A realistic timeline for a commercial buildout, and the two things most likely to move your date — neither of which is the construction.',
    cluster: 'process-timeline',
    author: AUTHOR,
    publishedAt: '2025-01-21',
    metaTitle: 'How Long a Commercial Buildout Takes',
    metaDescription:
      'A realistic commercial buildout timeline, phase by phase, and the two factors most likely to move your completion date.',
    body: [
      {
        p: 'The construction itself is often the most predictable part of a buildout. What moves your date is usually what happens before and around the work — permitting and long-lead items. Here is a realistic way to think about the calendar.',
      },
      { h2: 'The phases' },
      {
        ol: [
          'Site walk and estimate — days, not weeks, on most interiors.',
          'Contract and design finalization — as fast as the decisions get made.',
          'Permitting — the wild card. Driven by the jurisdiction, not by you. Plan on weeks and hope for less.',
          'Mobilization and long-lead procurement — ordering the items with month-long lead times so they arrive when the schedule needs them.',
          'Construction — the part a contractor controls, run in sequence.',
          'Punch and closeout — days, plus final inspections and CO.',
        ],
      },
      { h2: 'The two things that actually move your date' },
      {
        p: 'Permitting and long-lead equipment. A contractor can throw crews at construction to hold a schedule, but nobody speeds up a plan reviewer or a switchgear factory. The way you protect your date is to start permitting early and order the long-lead items the day the scope is set — not the day you need them.',
      },
      {
        p: 'For typical ranges on a specific type of work, each of our service pages lists one. For your job specifically, a site walk gets you a real schedule. Call us and we will put one together.',
      },
    ],
  },
  {
    slug: 'permitting-in-gwinnett-cobb-and-fulton',
    title: 'Permitting in Gwinnett, Cobb, and Fulton',
    excerpt:
      'A practical orientation to commercial permitting across the three Metro Atlanta counties you are most likely to build in.',
    cluster: 'process-timeline',
    author: AUTHOR,
    publishedAt: '2025-03-11',
    metaTitle: 'Commercial Permitting in Gwinnett, Cobb, and Fulton Counties',
    metaDescription:
      'A practical orientation to commercial building permits across Gwinnett, Cobb, and Fulton counties in Metro Atlanta.',
    body: [
      {
        p: 'Permitting is the part of a commercial buildout most likely to move your date, and it works a little differently in every jurisdiction. If you are building across Metro Atlanta, here is a practical orientation to the three counties you are most likely to be in. Treat this as background, not legal advice — always confirm current requirements with the authority having jurisdiction for your specific address.',
      },
      { h2: 'The thing they have in common' },
      {
        p: 'A commercial interior buildout generally requires a building permit and, depending on scope, separate trade permits for electrical, mechanical, and plumbing. A change of occupancy — turning retail into a restaurant, say — triggers additional review and often pulls in accessibility and life-safety upgrades. The bigger the change of use, the longer and more involved the review.',
      },
      { h2: 'Where jurisdictions differ' },
      {
        ul: [
          'Municipal vs. county authority — an address inside a city (Alpharetta, Marietta, Sandy Springs, Duluth) is usually permitted by that city, not the county, and the city sets its own process and timeline. The same street can cross a jurisdiction boundary.',
          'Submittal and review process — some jurisdictions run fully online submittals with predictable review windows; others are slower or require more in-person coordination.',
          'Inspection scheduling — availability of inspectors varies, and inspection backlogs are a real schedule factor near completion.',
          'Local requirements — grease interceptor sizing, fire marshal review, and site-related requirements can differ meaningfully from one county or city to the next.',
        ],
      },
      { h2: 'The practical takeaway' },
      {
        p: 'Know which authority actually has jurisdiction over your address before you plan the schedule, and start the permit conversation early. The difference between a smooth permit and a painful one is rarely the fee — it is whether the plans anticipated what that specific jurisdiction was going to ask for.',
      },
      {
        p: 'We build across these counties and know how they differ in practice. Call us and we will help you plan the permitting for your specific address.',
      },
    ],
  },
  {
    slug: 'what-happens-on-a-site-walk',
    title: 'What happens on a site walk',
    excerpt:
      'The site walk is where the price gets real. Here is what we look at, what to have ready, and why it changes the number.',
    cluster: 'process-timeline',
    author: AUTHOR,
    publishedAt: '2025-02-25',
    metaTitle: 'What Happens on a Site Walk',
    metaDescription:
      'What a general contractor looks for on a commercial site walk, what to have ready, and why it produces a better number than a plan alone.',
    body: [
      {
        p: 'A site walk is the hour that makes the estimate real. Plans tell us what is supposed to be there. The walk tells us what actually is — and the gap between those two is where the price lives.',
      },
      { h2: 'What we are looking at' },
      {
        ul: [
          'Existing conditions — what is already in place that we can use, and what has to come out.',
          'Systems — the condition and capacity of the HVAC, electrical service, and plumbing, and whether your use will overrun them.',
          'Access and logistics — how material gets in, where crews stage, and any landlord or building restrictions on hours and access.',
          'Code triggers — anything about the space or the intended use that will pull in accessibility, life-safety, or occupancy work.',
          'The unknowns — the questions that, once answered, change the number the most.',
        ],
      },
      { h2: 'What to have ready' },
      {
        p: 'Whatever you have: drawings, the lease exhibit or landlord work letter, and a clear sense of your target date and any budget you have to hit. None of it is required to have a useful walk — but the more we know going in, the sharper the number coming out.',
      },
      {
        p: 'That is the whole first step of how we work: walk the space, ask the questions that change the price, and come back with a scoped number instead of a range. Call us and we will get on the calendar.',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Broker & PM Resources
  // ---------------------------------------------------------------------------
  {
    slug: 'what-to-send-a-gc-when-youre-requesting-a-bid',
    title: "What to send a GC when you're requesting a bid",
    excerpt:
      'The five things that turn a vague request into a bid you can actually compare — and get back faster.',
    cluster: 'broker-pm',
    author: AUTHOR,
    publishedAt: '2025-01-07',
    metaTitle: "What to Send a GC When You're Requesting a Bid",
    metaDescription:
      'A short checklist of what to send a general contractor to get a fast, accurate, comparable bid on a commercial project.',
    body: [
      {
        p: 'The quality of a bid is capped by the quality of what you send to get it. If you want a fast, accurate number you can compare against others, give the contractor enough to price the real job instead of guessing at it.',
      },
      { h2: 'The short list' },
      {
        ol: [
          'Drawings or a plan — even a preliminary space plan beats a verbal description. If you do not have drawings, say so; a good GC can help scope from a walk.',
          'The lease exhibit or landlord work letter — this defines who pays for what, and it changes the scope more than anything else.',
          'Your target date — the schedule is part of the price. A tight date and a loose date are different jobs.',
          'Any hard budget — if there is a number you cannot exceed, saying so up front lets the GC value-engineer toward it instead of past it.',
          'The use and any brand or tenant standards — a finish package or franchise spec tells the GC what "done" actually means.',
        ],
      },
      { h2: 'Why it pays off' },
      {
        p: 'Every gap in what you send becomes an assumption in the bid, and assumptions are where bids diverge and change orders are born. The half hour you spend assembling the scope is repaid in bids that come back faster, closer together, and far easier to compare.',
      },
      {
        p: 'Send us what you have and we will tell you what else we need to give you a real number. Call us or send over the scope.',
      },
    ],
  },
  {
    slug: 'how-to-evaluate-contractor-bids',
    title: 'How to evaluate contractor bids',
    excerpt:
      'Comparing the totals is the last step, not the first. Here is how to read a set of contractor bids like someone who has been burned before.',
    cluster: 'broker-pm',
    author: AUTHOR,
    publishedAt: '2025-02-05',
    metaTitle: 'How to Evaluate Contractor Bids',
    metaDescription:
      'A practical guide to evaluating commercial contractor bids — reading exclusions, allowances, and scope before you compare the bottom line.',
    body: [
      {
        p: 'Anyone can compare the bottom line of three bids. The people who do not get burned compare everything above the bottom line first, because that is where the real differences hide.',
      },
      { h2: 'What to actually compare' },
      {
        ul: [
          'Exclusions — the fastest way to understand a bid is to read what it leaves out. A low number with a long exclusions list is not a low number.',
          'Allowances — round-number allowances are placeholders. Count how many there are; each is a line that has not really been priced.',
          'Scope coverage — are all three bidding the same job? A missing scope item is the most common reason a total looks low.',
          'Schedule — a number that hits your date and a number that does not are not comparable, no matter how close the dollars are.',
          'Self-performed vs. managed — who actually does the work affects both the price and the accountability when something goes wrong.',
        ],
      },
      { h2: 'The question behind all of it' },
      {
        p: 'The bid is a proxy for a relationship you are about to be in for months. The number matters, but so does whether the contractor scoped the job honestly, answered your questions clearly, and gave you a document you can actually hold them to. A clean bid from someone who communicates well is worth more than a low one from someone who does not.',
      },
      {
        p: 'When we bid, we spell out scope and exclusions so you can compare us fairly against anyone. Call us and we will walk you through ours.',
      },
    ],
  },
  {
    slug: 'landlord-vs-tenant-scope-who-pays-for-what',
    title: 'Landlord vs. tenant scope: who pays for what',
    excerpt:
      'The work letter decides who pays for what — and the gaps in it decide who eats the surprise. How to read the split before you sign.',
    cluster: 'broker-pm',
    author: AUTHOR,
    publishedAt: '2025-03-01',
    metaTitle: 'Landlord vs. Tenant Scope: Who Pays for What',
    metaDescription:
      'How landlord and tenant construction scope gets split in a commercial lease, and how to spot the gaps before they become change orders.',
    body: [
      {
        p: 'In a commercial buildout, the single document that decides the most about your budget is not the construction contract — it is the lease work letter. It defines what the landlord delivers and what the tenant pays for, and the gaps in it decide who eats the surprises.',
      },
      { h2: 'The usual split' },
      {
        ul: [
          'Landlord work — often the shell condition: base building, core systems to a point, and sometimes a defined allowance toward the tenant’s improvements.',
          'Tenant improvement allowance — a dollar figure the landlord contributes, after which the tenant is on the hook. Know whether it is paid up front or as a reimbursement, because that affects your cash flow.',
          'Tenant work — everything above the allowance and beyond the shell condition. This is your scope, your contractor, and your budget.',
        ],
      },
      { h2: 'Where the gaps hide' },
      {
        p: 'The expensive ambiguity is the item both sides assumed the other covered: the rooftop unit, the electrical service size, the restroom rough-in, the storefront. A work letter that says the landlord delivers a "warm shell" without defining exactly what that includes is a negotiation waiting to happen — usually after you have already signed.',
      },
      {
        p: 'Before you sign, get a contractor to read the work letter against the space and flag the gaps while they are still negotiable. We do this with brokers and tenants regularly. Call us and we will help you read the split before it costs you.',
      },
    ],
  },
];

export const FALLBACK_POSTS_BY_SLUG: Record<string, FallbackPost> =
  Object.fromEntries(FALLBACK_POSTS.map((p) => [p.slug, p]));
