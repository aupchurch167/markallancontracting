/** The four insight clusters. Order reflects strategic weight (ground-up first). */
export const CLUSTERS: { value: string; title: string; blurb: string }[] = [
  {
    value: 'ground-up',
    title: 'Ground-Up Authority',
    blurb: 'For owners and developers weighing a ground-up project.',
  },
  {
    value: 'cost-budget',
    title: 'Cost & Budget',
    blurb: 'What things actually cost, and why bids come back different.',
  },
  {
    value: 'process-timeline',
    title: 'Process & Timeline',
    blurb: 'How long it takes and what happens along the way.',
  },
  {
    value: 'broker-pm',
    title: 'Broker & PM Resources',
    blurb: 'Practical guidance for the people scoping the work.',
  },
];

export function clusterTitle(value?: string): string | undefined {
  return CLUSTERS.find((c) => c.value === value)?.title;
}
