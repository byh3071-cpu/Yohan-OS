import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import * as z from "zod/v4";
import { ingestGeekNewsRss } from "./ingest/geeknews.js";
import { loadRecentIngestSummary } from "./ingest/recent-summary.js";
import { ingestUrl } from "./ingest/url.js";
import { buildPlanStub } from "./plan/task-plan.js";
import { getMemoryDir } from "./paths.js";
import { loadNotionQueuePreview } from "./notion-queue.js";
import { searchMemory } from "./search/memory-search.js";

async function readYamlFile<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const raw = await readFile(path, "utf8");
    return { ok: true, data: parseYaml(raw) as T };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

async function loadRecentDecisions(dir: string, limit: number): Promise<
  Array<{ file: string; content: string }>
> {
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  const mdFiles = names.filter((n) => n.endsWith(".md"));
  const withStat = await Promise.all(
    mdFiles.map(async (file) => {
      const p = join(dir, file);
      const s = await stat(p);
      return { file, path: p, mtime: s.mtimeMs };
    }),
  );
  withStat.sort((a, b) => b.mtime - a.mtime);
  const picked = withStat.slice(0, limit);
  const out: Array<{ file: string; content: string }> = [];
  for (const { file, path } of picked) {
    const content = await readFile(path, "utf8");
    out.push({ file, content });
  }
  return out;
}

function slugify(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-가-힣]/g, "")
    .slice(0, 48);
  return s || "decision";
}

async function main(): Promise<void> {
  const server = new McpServer({
    name: "yohan-os",
    version: "0.1.0",
  });

  server.registerTool(
    "get_context",
    {
      description:
        "Yohan OS 에이전트 SoT: profile, active-project, 최근 decisions, 최근 인제스트 요약, 노션 풀 큐(`notion_queue`) 미리보기를 한 번에 반환. 세션 시작 시 호출.",
    },
    async () => {
      const root = getMemoryDir();
      const profilePath = join(root, "profile.yaml");
      const activePath = join(root, "active-project.yaml");
      const decisionsPath = join(root, "decisions");

      const profile = await readYamlFile<Record<string, unknown>>(profilePath);
      const activeProject = await readYamlFile<Record<string, unknown>>(activePath);
      const recentDecisions = await loadRecentDecisions(decisionsPath, 8);
      const recentIngest = await loadRecentIngestSummary(12);
      const notionQueue = await loadNotionQueuePreview();

      const payload = {
        sot_version: "0.1",
        memory_root: root,
        profile: profile.ok ? profile.data : { _error: profile.error },
        active_project: activeProject.ok ? activeProject.data : { _error: activeProject.error },
        recent_decisions: recentDecisions.map(({ file, content }) => ({
          file,
          content: content.length > 6000 ? `${content.slice(0, 6000)}\n\n…(truncated)` : content,
        })),
        recent_ingest: recentIngest,
        notion_queue: {
          path: notionQueue.path.replace(/\\/g, "/"),
          exists: notionQueue.exists,
          preview: notionQueue.preview,
          truncated: notionQueue.truncated,
          rules: "memory/rules/notion-sync.md",
        },
      };

      const text = JSON.stringify(payload, null, 2);
      return {
        content: [{ type: "text", text }],
      };
    },
  );

  server.registerTool(
    "append_decision",
    {
      description:
        "결정 로그를 memory/decisions/ 아래 마크다운 파일로 추가한다. Evaluator 통과 후 등 반영용.",
      inputSchema: {
        title: z.string().describe("결정 제목"),
        summary: z.string().optional().describe("한 줄 요약"),
        body: z.string().optional().describe("상세 본문 (마크다운 가능)"),
      },
    },
    async ({ title, summary, body }) => {
      const root = getMemoryDir();
      const decisionsPath = join(root, "decisions");
      await mkdir(decisionsPath, { recursive: true });

      const slug = slugify(title);
      const iso = new Date().toISOString();
      const day = iso.slice(0, 10);
      const hhmm = iso.slice(11, 16).replace(":", "");
      const fileName = `${day}-${hhmm}-${slug}.md`;
      const path = join(decisionsPath, fileName);

      const front = {
        title,
        created: iso,
        source: "mcp.append_decision",
      };
      const yamlBlock = stringifyYaml(front).trim();
      const parts = [`---\n${yamlBlock}\n---\n`];
      if (summary) parts.push(`\n${summary}\n`);
      if (body) parts.push(`\n${body}\n`);
      if (!summary && !body) parts.push("\n_(no summary)_\n");

      await writeFile(path, parts.join(""), "utf8");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, path: path.replace(/\\/g, "/") }, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "ingest_geeknews_rss",
    {
      description:
        "GeekNews RSS(https://news.hada.io/rss/news)를 가져와 memory/ingest/rss/geeknews/ 에 ingest.v0 마크다운으로 저장한다. 동일 원문 URL은 건너뜀.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("가져올 최대 항목 수 (기본 20)"),
      },
    },
    async (args) => {
      const limit = args?.limit ?? 20;
      const r = await ingestGeekNewsRss({ limit });
      return {
        content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
      };
    },
  );

  server.registerTool(
    "ingest_url",
    {
      description:
        "http(s) URL 하나를 ingest.v0로 memory/ingest/url/에 저장. 유튜브는 oEmbed+자막, 그 외는 Readability 본문 추출. 동일 URL은 스킵.",
      inputSchema: {
        url: z.string().url().describe("https://… 로 시작하는 주소"),
      },
    },
    async ({ url }) => {
      const r = await ingestUrl(url);
      return {
        content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_memory",
    {
      description:
        "memory/ 이하 .md/.yaml/.txt 에서 부분 문자열 검색(대소문자 무시). ingest·decisions·rules·프로필 등 통합 검색.",
      inputSchema: {
        query: z.string().min(1).describe("검색어"),
        max_results: z.number().int().min(1).max(200).optional().describe("최대 히트 수 (기본 40)"),
      },
    },
    async ({ query, max_results }) => {
      const r = await searchMemory(query, { maxResults: max_results ?? 40 });
      return {
        content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
      };
    },
  );

  server.registerTool(
    "plan_task",
    {
      description:
        "Planner 스텁: 목표를 plan.v0 JSON으로 감싼다. 복잡 요청 전 구조화·오케스트레이션 대비. 이어서 Generator(실작업)·Evaluator(말미 검증) 단계.",
      inputSchema: {
        goal: z.string().min(1).describe("한 문장 목표"),
        constraints_must: z.array(z.string()).optional().describe("반드시 지킬 조건"),
        constraints_must_not: z.array(z.string()).optional().describe("하면 안 되는 것"),
        notes: z.string().optional().describe("추가 맥락"),
      },
    },
    async (args) => {
      const plan = buildPlanStub({
        goal: args.goal,
        constraints_must: args.constraints_must,
        constraints_must_not: args.constraints_must_not,
        notes: args.notes,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(plan, null, 2) }],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

/** `node dist/index.js` 로 직접 실행될 때만 MCP stdio 기동 (import 시 부작용 방지) */
const entryFile = resolve(fileURLToPath(import.meta.url));
const argvMain = process.argv[1] ? resolve(process.argv[1]) : "";
if (argvMain && entryFile === argvMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
