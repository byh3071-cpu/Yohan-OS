import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadNotionOcrEnv } from "./notion/notion-ocr-env.js";
import { OcrPushInputSchema, pushOcrResourceAndSummary } from "./notion/push-ocr.js";
import { resolveRepoRoot } from "./paths.js";

config({ path: join(resolveRepoRoot(), ".env") });

async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) {
    console.error("Usage: npm run sync:notion:ocr -- <payload.json>");
    console.error("JSON keys: date_ymd, resource_title, ocr_raw_body, tags?, source_select?, resource_status?");
    console.error("Optional: summary_title, summary_body, summary_type?, summary_status?, resource_only?");
    process.exit(1);
  }
  const rawJson = await readFile(path, "utf8");
  const data = JSON.parse(rawJson) as unknown;
  const parsed = OcrPushInputSchema.safeParse(data);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
  const env = loadNotionOcrEnv();
  const r = await pushOcrResourceAndSummary(env, parsed.data);
  console.log(JSON.stringify(r, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
