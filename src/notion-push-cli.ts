import { config } from "dotenv";
import { join } from "node:path";
import { loadNotionSyncEnv } from "./notion/notion-env.js";
import { pushDecisionsFromSoT } from "./notion/push-decisions.js";
import { resolveRepoRoot } from "./paths.js";

config({ path: join(resolveRepoRoot(), ".env") });

const limit = Math.min(100, Math.max(1, parseInt(process.argv[2] ?? "20", 10) || 20));

async function main(): Promise<void> {
  const env = loadNotionSyncEnv();
  const results = await pushDecisionsFromSoT(env, { limit });
  console.log(JSON.stringify({ ok: true, limit, results }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
