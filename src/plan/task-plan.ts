/**
 * Planner 스텁 — 복잡 요청을 JSON 플랜(plan.v0)으로 고정해 오케스트레이션·P/G/E와 맞춘다.
 * (실제 분해 로직은 에이전트가 채우고, 여기서는 스키마·최소 1태스크만 보장)
 */

export type PlanV0 = {
  schema_version: "plan.v0";
  goal: string;
  success_criteria: string[];
  constraints: { must: string[]; must_not: string[] };
  tasks: Array<{ id: string; description: string; depends_on: string[] }>;
  assumptions: string[];
  open_questions: string[];
  next_step: "generator" | "revise_plan";
};

export function buildPlanStub(input: {
  goal: string;
  constraints_must?: string[];
  constraints_must_not?: string[];
  notes?: string;
}): PlanV0 {
  const must = input.constraints_must ?? [];
  const mustNot = input.constraints_must_not ?? [];

  const tasks = [
    {
      id: "T1",
      description: input.goal.trim(),
      depends_on: [] as string[],
    },
  ];

  if (input.notes?.trim()) {
    tasks.push({
      id: "T2",
      description: `참고: ${input.notes.trim()}`,
      depends_on: ["T1"],
    });
  }

  return {
    schema_version: "plan.v0",
    goal: input.goal.trim(),
    success_criteria: [
      "플랜의 tasks가 모두 수행 가능한 크기로 쪼개지거나 완료로 표시될 것",
      "memory/rules/evaluator-checklist.md 기준으로 Evaluator 통과",
    ],
    constraints: { must, must_not: mustNot },
    tasks,
    assumptions: ["stub: 세부 분해는 Generator(에이전트)가 수행"],
    open_questions: [],
    next_step: "generator",
  };
}
