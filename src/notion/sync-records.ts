import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Client } from "@notionhq/client";
import { parse as parseYaml } from "yaml";
import type { NotionRecordsEnv } from "./notion-records-env.js";

const execFileAsync = promisify(execFile);

export type RecordKind = "adr" | "session-log" | "troubleshooting";

export type SyncResult = {
  file: string;
  kind: RecordKind;
  sot_key: string;
  action: "created" | "updated" | "skipped";
  page_id?: string;
  error?: string;
};

export type SyncSummary = {
  synced: SyncResult[];
  skipped: SyncResult[];
  errors: SyncResult[];
  by_kind: Record<RecordKind, number>;
};

export type SyncOptions = {
  /** "today" 또는 ISO 날짜(YYYY-MM-DD). 미지정 시 today. */
  since?: string;
  /** 명시적 파일 목록 (지정 시 git log 무시). 레포 루트 기준 상대 경로. */
  files?: string[];
};

function repoRoot(): string {
  // dist/notion/sync-records.js → repo root (dist 또는 src에서 모두 동작)
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..");
}

function classifyPath(rel: string): RecordKind | null {
  const p = rel.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return null;
  if (p.endsWith("/README.md") || p.endsWith("/TEMPLATE.md")) return null;
  if (p.startsWith("docs/adr/")) return "adr";
  if (p.startsWith("memory/logs/sessions/")) return "session-log";
  if (p.startsWith("docs/troubleshooting/")) return "troubleshooting";
  return null;
}

function sotKeyForPath(rel: string): string {
  return createHash("sha256")
    .update(rel.replace(/\\/g, "/"), "utf8")
    .digest("hex")
    .slice(0, 32);
}

function parseFrontmatter(raw: string): {
  fm: Record<string, unknown>;
  body: string;
} {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  try {
    const parsed = parseYaml(m[1]);
    const fm =
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : {};
    return { fm, body: m[2] };
  } catch {
    return { fm: {}, body: m[2] };
  }
}

function firstHeading(body: string): string | null {
  const m = body.match(/^\s*#{1,6}\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function todayKst(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

function dateFromFm(fm: Record<string, unknown>): string {
  const d = fm.date;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.slice(0, 10);
  }
  return todayKst();
}

function deriveTitle(
  rel: string,
  fm: Record<string, unknown>,
  body: string,
): string {
  const fmTitle = typeof fm.title === "string" ? fm.title.trim() : "";
  const heading = firstHeading(body) ?? "";
  const fileName = rel.split("/").pop() ?? rel;
  const stem = fileName.replace(/\.md$/i, "");
  const date = dateFromFm(fm);
  const base = fmTitle || heading || stem;
  return `[${date}] ${base}`.slice(0, 200);
}

function chunkText(s: string, max = 1900): string[] {
  if (!s) return [""];
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    out.push(s.slice(i, i + max));
    i += max;
  }
  return out;
}

function richText(s: string) {
  return chunkText(s).map((chunk) => ({
    type: "text" as const,
    text: { content: chunk },
  }));
}

function mdToBlocks(body: string): Array<Record<string, unknown>> {
  const blocks: Array<Record<string, unknown>> = [];
  const lines = body.split(/\r?\n/);
  const MAX_BLOCKS = 95;

  let para: string[] = [];
  let inCode = false;
  let codeLang = "plain text";
  let codeBuf: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const text = para.join("\n").trim();
    para = [];
    if (!text) return;
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: richText(text) },
    });
  };

  for (let i = 0; i < lines.length && blocks.length < MAX_BLOCKS; i++) {
    const line = lines[i];
    if (inCode) {
      if (line.trim().startsWith("```")) {
        blocks.push({
          object: "block",
          type: "code",
          code: {
            rich_text: richText(codeBuf.join("\n")),
            language: codeLang,
          },
        });
        inCode = false;
        codeBuf = [];
        codeLang = "plain text";
      } else {
        codeBuf.push(line);
      }
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushPara();
      inCode = true;
      const lang = line.trim().slice(3).trim();
      codeLang = lang || "plain text";
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (h) {
      flushPara();
      const level = Math.min(3, h[1].length);
      const type =
        level === 1 ? "heading_1" : level === 2 ? "heading_2" : "heading_3";
      blocks.push({
        object: "block",
        type,
        [type]: { rich_text: richText(h[2]) },
      });
      continue;
    }
    const li = line.match(/^\s*[-*]\s+(.+)$/);
    if (li) {
      flushPara();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: richText(li[1]) },
      });
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ol) {
      flushPara();
      blocks.push({
        object: "block",
        type: "numbered_list_item",
        numbered_list_item: { rich_text: richText(ol[1]) },
      });
      continue;
    }
    if (!line.trim()) {
      flushPara();
      continue;
    }
    para.push(line);
  }
  if (inCode && codeBuf.length) {
    blocks.push({
      object: "block",
      type: "code",
      code: { rich_text: richText(codeBuf.join("\n")), language: codeLang },
    });
  }
  flushPara();
  return blocks.slice(0, MAX_BLOCKS);
}

function titleProp(name: string, value: string) {
  return {
    [name]: {
      title: [
        { type: "text" as const, text: { content: value.slice(0, 2000) } },
      ],
    },
  };
}

function richProp(name: string, value: string) {
  return {
    [name]: {
      rich_text: value
        ? [
            {
              type: "text" as const,
              text: { content: value.slice(0, 2000) },
            },
          ]
        : [],
    },
  };
}

function selectProp(name: string, value: string) {
  return { [name]: { select: { name: value } } };
}

function multiSelectProp(name: string, value: string) {
  return { [name]: { multi_select: [{ name: value }] } };
}

function statusProp(name: string, value: string) {
  return { [name]: { status: { name: value } } };
}

async function findPageBySotKey(
  notion: Client,
  dbId: string,
  sotKeyProp: string,
  sotKey: string,
): Promise<string | null> {
  const r = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: sotKeyProp,
      rich_text: { equals: sotKey },
    },
    page_size: 1,
  });
  const first = r.results[0];
  if (first && "id" in first) return first.id;
  return null;
}

async function gitChangedFiles(since: string): Promise<string[]> {
  const cwd = repoRoot();
  const sinceArg =
    since === "today" || !since ? "midnight" : since;
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", `--since=${sinceArg}`, "--name-only", "--pretty=format:"],
      { cwd, maxBuffer: 8 * 1024 * 1024 },
    );
    const set = new Set<string>();
    for (const line of stdout.split(/\r?\n/)) {
      const t = line.trim();
      if (t) set.add(t);
    }
    return Array.from(set);
  } catch {
    return [];
  }
}

function buildHubProps(
  env: NotionRecordsEnv,
  rel: string,
  title: string,
  sotKey: string,
): Record<string, unknown> {
  const hub = env.knowledgeHub;
  const props: Record<string, unknown> = {
    ...titleProp(hub.titleProp, title),
    ...richProp(hub.sotKeyProp, sotKey),
  };
  if (hub.statusKind === "notion_status") {
    Object.assign(props, statusProp(hub.statusProp, hub.statusValue));
  } else {
    Object.assign(props, selectProp(hub.statusProp, hub.statusValue));
  }
  if (hub.categoryKind === "multi_select") {
    Object.assign(
      props,
      multiSelectProp(hub.categoryProp, hub.categoryValue),
    );
  } else {
    Object.assign(props, selectProp(hub.categoryProp, hub.categoryValue));
  }
  if (hub.sourcePathProp) {
    Object.assign(
      props,
      richProp(hub.sourcePathProp, rel.replace(/\\/g, "/")),
    );
  }
  return props;
}

function buildLogProps(
  env: NotionRecordsEnv,
  rel: string,
  title: string,
  sotKey: string,
): Record<string, unknown> {
  const log = env.executionLog;
  const props: Record<string, unknown> = {
    ...titleProp(log.titleProp, title),
    ...richProp(log.sotKeyProp, sotKey),
  };
  if (log.sourcePathProp) {
    Object.assign(
      props,
      richProp(log.sourcePathProp, rel.replace(/\\/g, "/")),
    );
  }
  return props;
}

/**
 * 변경 파일을 분류해 ADR/트러블슈팅은 지식 허브 DB로, 세션 로그는 EXECUTION LOG DB로 푸시.
 * 멱등 키(`SoT Key` 컬럼)로 중복 페이지 스킵.
 */
export async function syncRecordsToNotion(
  env: NotionRecordsEnv,
  options: SyncOptions,
): Promise<SyncSummary> {
  const notion = new Client({
    auth: env.token,
    notionVersion: "2022-06-28",
  });
  const root = repoRoot();
  const since = options.since ?? "today";
  const candidates =
    options.files && options.files.length > 0
      ? options.files
      : await gitChangedFiles(since);

  const synced: SyncResult[] = [];
  const skipped: SyncResult[] = [];
  const errors: SyncResult[] = [];
  const by_kind: Record<RecordKind, number> = {
    adr: 0,
    "session-log": 0,
    troubleshooting: 0,
  };

  // 중복 처리: 같은 파일 경로가 여러 커밋에 등장해도 1회만
  const seen = new Set<string>();

  for (const raw of candidates) {
    const rel = raw.replace(/\\/g, "/");
    if (seen.has(rel)) continue;
    seen.add(rel);

    const kind = classifyPath(rel);
    if (!kind) continue;

    const abs = join(root, rel);
    if (!existsSync(abs)) continue;

    const sotKey = sotKeyForPath(rel);

    try {
      const fileText = await readFile(abs, "utf8");
      const { fm, body } = parseFrontmatter(fileText);
      const title = deriveTitle(rel, fm, body);
      const blocks = mdToBlocks(body);

      const isHub = kind === "adr" || kind === "troubleshooting";
      const dbId = isHub ? env.knowledgeHubDbId : env.executionLogDbId;
      const sotKeyProp = isHub
        ? env.knowledgeHub.sotKeyProp
        : env.executionLog.sotKeyProp;
      const props = isHub
        ? buildHubProps(env, rel, title, sotKey)
        : buildLogProps(env, rel, title, sotKey);

      const existingId = await findPageBySotKey(
        notion,
        dbId,
        sotKeyProp,
        sotKey,
      );
      if (existingId) {
        skipped.push({
          file: rel,
          kind,
          sot_key: sotKey,
          action: "skipped",
          page_id: existingId,
        });
        continue;
      }

      const created = await notion.pages.create({
        parent: { database_id: dbId },
        properties: props as Parameters<
          typeof notion.pages.create
        >[0]["properties"],
        children: blocks as Parameters<
          typeof notion.pages.create
        >[0]["children"],
      });
      synced.push({
        file: rel,
        kind,
        sot_key: sotKey,
        action: "created",
        page_id: created.id,
      });
      by_kind[kind] += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push({
        file: rel,
        kind,
        sot_key: sotKey,
        action: "skipped",
        error: msg,
      });
    }
  }

  return { synced, skipped, errors, by_kind };
}

/** 한국어 stdout 한 줄 요약. */
export function summarizeForStdout(s: SyncSummary): string {
  const parts: string[] = [];
  if (s.by_kind.adr) parts.push(`ADR ${s.by_kind.adr}건`);
  if (s.by_kind["session-log"])
    parts.push(`로그 ${s.by_kind["session-log"]}건`);
  if (s.by_kind.troubleshooting)
    parts.push(`트러블슈팅 ${s.by_kind.troubleshooting}건`);
  const head = parts.length
    ? `✅ Notion 동기화: ${parts.join(", ")}`
    : "ℹ️ Notion 동기화 대상 없음";
  const skipped = s.skipped.length
    ? ` · 중복 ${s.skipped.length}건 스킵`
    : "";
  const errors = s.errors.length ? ` · 오류 ${s.errors.length}건` : "";
  return head + skipped + errors;
}
