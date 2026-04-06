import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { Client } from "@notionhq/client";
import { getNotionQueuePath } from "../paths.js";
import type { NotionSyncEnv } from "./notion-env.js";
import { normalizeNotionId } from "./notion-id.js";

type NotionProps = Record<
  string,
  | { type: "title"; title: Array<{ type: string; plain_text: string }> }
  | { type: "rich_text"; rich_text: Array<{ type: string; plain_text: string }> }
  | { type: string }
>;

function isPageObject(r: unknown): r is { id: string; properties: NotionProps } {
  return (
    typeof r === "object" &&
    r !== null &&
    "object" in r &&
    (r as { object?: string }).object === "page" &&
    "properties" in r &&
    "id" in r
  );
}

function getTitle(props: NotionProps, titleKey: string): string {
  const p = props[titleKey];
  if (!p || p.type !== "title" || !("title" in p)) return "";
  return p.title.map((t: { type?: string; plain_text?: string }) => (t.type === "text" ? t.plain_text ?? "" : "")).join("");
}

function getRichText(props: NotionProps, key: string): string {
  const p = props[key];
  if (!p || p.type !== "rich_text" || !("rich_text" in p)) return "";
  return p.rich_text.map((t: { type?: string; plain_text?: string }) => (t.type === "text" ? t.plain_text ?? "" : "")).join("");
}

function notionPageUrl(pageId: string): string {
  const hex = pageId.replace(/-/g, "");
  return `https://www.notion.so/${hex}`;
}

/** 비교용: 하이픈·대소문자 무시 */
function canonicalPageId(id: string): string {
  return id.replace(/-/g, "").toLowerCase();
}

/**
 * `notion-queue.md` 본문에 이미 기록된 page_id 집합 (백틱 안 UUID).
 */
export async function loadExistingQueuePageIds(queuePath: string): Promise<Set<string>> {
  const set = new Set<string>();
  if (!existsSync(queuePath)) {
    return set;
  }
  const raw = await readFile(queuePath, "utf8");
  const re = /\*\*page_id\*\*:\s*`([^`]+)`/g;
  let m: RegExpExecArray | null;
  for (m = re.exec(raw); m !== null; m = re.exec(raw)) {
    set.add(canonicalPageId(m[1].trim()));
  }
  return set;
}

/**
 * 노션 DB 행을 읽어 **큐 파일에만 append** 한다. profile/decisions 자동 덮어쓰기 없음.
 * 이미 큐에 같은 `page_id`가 있으면 해당 행은 스킵한다.
 */
export async function pullNotionDatabaseToQueue(
  env: NotionSyncEnv,
  options: { pageSize: number },
): Promise<{ appended_chars: number; pages: number; skipped: number; fetched: number }> {
  const notion = new Client({ auth: env.token, notionVersion: "2022-06-28" });
  const queuePath = getNotionQueuePath();
  const iso = new Date().toISOString();

  const existingIds = await loadExistingQueuePageIds(queuePath);

  const entryLines: string[] = [];
  let fetched = 0;
  let skipped = 0;
  let cursor: string | undefined;

  for (;;) {
    const r = await notion.databases.query({
      database_id: env.databaseId,
      page_size: options.pageSize,
      start_cursor: cursor,
    });

    for (const row of r.results) {
      if (!isPageObject(row)) continue;
      fetched++;
      const canon = canonicalPageId(row.id);
      if (existingIds.has(canon)) {
        skipped++;
        continue;
      }
      existingIds.add(canon);

      const title = getTitle(row.properties, env.titleProperty) || "(no title)";
      const sotKey = getRichText(row.properties, env.sotKeyProperty);
      entryLines.push(`### ${title}`, "");
      entryLines.push(`- **page_id**: \`${row.id}\``);
      entryLines.push(`- **url**: ${notionPageUrl(row.id)}`);
      if (sotKey) entryLines.push(`- **SoT Key**: \`${sotKey}\``);
      entryLines.push("");
    }

    if (!r.has_more) break;
    cursor = r.next_cursor ?? undefined;
    if (!cursor) break;
  }

  const appended = entryLines.length > 0 ? entryLines.filter((l) => l.startsWith("### ")).length : 0;

  if (entryLines.length === 0) {
    return { appended_chars: 0, pages: 0, skipped, fetched };
  }

  const lines: string[] = [
    "",
    "---",
    `pulled_at: ${iso}`,
    "source: notion.pull_to_queue",
    `database_id: ${env.databaseId}`,
    "---",
    "",
    `## Notion pull ${iso}`,
    "",
    ...entryLines,
  ];

  const block = lines.join("\n");
  await appendFile(queuePath, block, "utf8");
  return { appended_chars: block.length, pages: appended, skipped, fetched };
}

/** DB 연결·스키마 확인용 (Integration·DB 공유 여부) */
export async function verifyNotionDatabase(token: string, databaseIdRaw: string): Promise<string> {
  const notion = new Client({ auth: token, notionVersion: "2022-06-28" });
  const id = normalizeNotionId(databaseIdRaw);
  const db = await notion.databases.retrieve({ database_id: id });
  if ("title" in db && Array.isArray(db.title) && db.title[0] && "plain_text" in db.title[0]) {
    return (db.title[0] as { plain_text: string }).plain_text;
  }
  return id;
}
