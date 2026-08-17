import { PLAN_STEPS } from '@/lib/fallback-content';
import type { PlanStep } from '@/lib/types';

/** The 3-step plan. Accepts Sanity plan steps, falls back to the standard three. */
export function PlanSteps({ steps }: { steps?: PlanStep[] }) {
  const items =
    steps && steps.length
      ? steps.map((s) => ({
          n: String(s.stepNumber),
          title: s.title,
          body: s.description,
        }))
      : PLAN_STEPS;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {items.map((step) => (
        <div key={step.n}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
            {step.n}
          </div>
          <h3 className="mt-4 text-xl font-bold text-ink">{step.title}</h3>
          <p className="mt-2 text-body">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
