import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { Client } from "@notionhq/client";
import { parse as parseYaml } from "yaml";
import { getMemoryDir } from "../paths.js";
import type { NotionSyncEnv } from "./notion-env.js";

export type PushDecisionResult = {
  file: string;
  sot_key: string;
  action: "created" | "updated" | "skipped";
  page_id?: string;
  error?: string;
};

function sotKeyForRelativePath(relativePath: string): string {
  return createHash("sha256").update(relativePath, "utf8").digest("hex").slice(0, 32);
}

function firstNonEmptyLine(text: string): string {
  const line = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return line ?? "";
}

/**
 * Summary: frontmatter `summary` 가 있으면 사용, 없으면 본문 첫 줄(프론트매터 다음).
 */
function parseDecisionFile(raw: string, fileName: string): { title: string; summary: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) {
    const title = fileName.replace(/\.md$/i, "");
    return { title, summary: firstNonEmptyLine(raw).slice(0, 4000) };
  }
  try {
    const fm = parseYaml(m[1]) as { title?: string; summary?: string };
    const body = m[2];
    const title = typeof fm.title === "string" ? fm.title : fileName.replace(/\.md$/i, "");
    let summaryText: string;
    if (typeof fm.summary === "string" && fm.summary.trim()) {
      summaryText = fm.summary.trim();
    } else {
      summaryText = firstNonEmptyLine(body);
    }
    return { title, summary: summaryText.slice(0, 4000) };
  } catch {
    return { title: fileName, summary: firstNonEmptyLine(raw).slice(0, 4000) };
  }
}

async function findPageBySotKey(
  notion: Client,
  env: NotionSyncEnv,
  sotKey: string,
): Promise<string | null> {
  const r = await notion.databases.query({
    database_id: env.databaseId,
    filter: {
      property: env.sotKeyProperty,
      rich_text: { equals: sotKey },
    },
    page_size: 1,
  });
  const first = r.results[0];
  if (first && "id" in first) {
    return first.id;
  }
  return null;
}

function titleProp(name: string, value: string) {
  return {
    [name]: {
      title: [{ type: "text" as const, text: { content: value.slice(0, 2000) } }],
    },
  };
}

function richProp(name: string, value: string) {
  return {
    [name]: {
      rich_text: value
        ? [{ type: "text" as const, text: { content: value.slice(0, 2000) } }]
        : [],
    },
  };
}

/**
 * memory/decisions/*.md 를 노션 DB에 푸시한다.
 * 멱등 키: `decisions/<파일명>` 에 대한 SHA-256 앞 32자를 `SoT Key` 열에 저장.
 */
export async function pushDecisionsFromSoT(
  env: NotionSyncEnv,
  options: { limit: number },
): Promise<PushDecisionResult[]> {
  const notion = new Client({ auth: env.token, notionVersion: "2022-06-28" });
  const decisionsDir = join(getMemoryDir(), "decisions");
  const names = await readdir(decisionsDir);
  const mdFiles = names.filter((n) => n.endsWith(".md"));
  const withMtime = await Promise.all(
    mdFiles.map(async (file) => {
      const p = join(decisionsDir, file);
      const s = await stat(p);
      return { file, path: p, mtime: s.mtimeMs };
    }),
  );
  withMtime.sort((a, b) => b.mtime - a.mtime);
  const picked = withMtime.slice(0, options.limit);

  const results: PushDecisionResult[] = [];

  for (const { file, path } of picked) {
    const rel = `decisions/${file}`;
    const sotKey = sotKeyForRelativePath(rel);
    let raw: string;
    try {
      raw = await readFile(path, "utf8");
    } catch (e) {
      results.push({
        file,
        sot_key: sotKey,
        action: "skipped",
        error: e instanceof Error ? e.message : String(e),
      });
      continue;
    }
    const { title, summary } = parseDecisionFile(raw, file);
    /** 노션 `Source Path` 열용 — SoT 기준 전체 상대 경로 (멱등 키 해시는 `decisions/` 유지) */
    const sourcePathForNotion = `memory/decisions/${file}`.replace(/\\/g, "/");

    const props: Record<string, unknown> = {
      ...titleProp(env.titleProperty, `[Yohan] ${title}`),
      ...richProp(env.sotKeyProperty, sotKey),
    };
    if (env.summaryProperty) {
      Object.assign(props, richProp(env.summaryProperty, summary));
    }
    if (env.sourcePathProperty) {
      Object.assign(props, richProp(env.sourcePathProperty, sourcePathForNotion));
    }

    try {
      const existingId = await findPageBySotKey(notion, env, sotKey);
      if (existingId) {
        await notion.pages.update({
          page_id: existingId,
          properties: props as Parameters<typeof notion.pages.update>[0]["properties"],
        });
        results.push({ file, sot_key: sotKey, action: "updated", page_id: existingId });
      } else {
        const created = await notion.pages.create({
          parent: { database_id: env.databaseId },
          properties: props as Parameters<typeof notion.pages.create>[0]["properties"],
        });
        results.push({ file, sot_key: sotKey, action: "created", page_id: created.id });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ file, sot_key: sotKey, action: "skipped", error: msg });
    }
  }

  return results;
}
