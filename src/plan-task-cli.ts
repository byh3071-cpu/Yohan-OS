import { buildPlanStub } from "./plan/task-plan.js";

const goal = process.argv.slice(2).join(" ").trim();
if (!goal) {
  console.error('Usage: npx tsx src/plan-task-cli.ts "목표 한 문장"');
  process.exit(1);
}

const plan = buildPlanStub({ goal });
console.log(JSON.stringify(plan, null, 2));
