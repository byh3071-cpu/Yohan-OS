import { config } from "dotenv";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { loadNotionSyncEnv } from "./notion/notion-env.js";
import { pullNotionDatabaseToQueue } from "./notion/pull-queue.js";
import { getInboxDir, resolveRepoRoot } from "./paths.js";

config({ path: join(resolveRepoRoot(), ".env") });

const pageSize = Math.min(100, Math.max(1, parseInt(process.argv[2] ?? "50", 10) || 50));

async function main(): Promise<void> {
  await mkdir(getInboxDir(), { recursive: true });
  const env = loadNotionSyncEnv();
  const r = await pullNotionDatabaseToQueue(env, { pageSize });
  console.log(JSON.stringify({ ok: true, ...r, queue: "memory/inbox/notion-queue.md (append)" }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
