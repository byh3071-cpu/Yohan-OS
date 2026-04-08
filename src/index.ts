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
import {
  type RssFeedDefinition,
  RSS_FEED_AITIMES,
  RSS_FEED_KARPATHY,
  RSS_FEED_PAULGRAHAM,
  RSS_FEED_SAMALTMAN,
  RSS_FEED_THEMILK,
  RSS_FEED_YOZM,
} from "./ingest/rss-feed-config.js";
import { ingestRssFeed } from "./ingest/rss-feed.js";
import { loadRecentIngestSummary } from "./ingest/recent-summary.js";
import { ingestUrl } from "./ingest/url.js";
import { buildPlanStub } from "./plan/task-plan.js";
import { getMemoryDir } from "./paths.js";
import { loadNotionSyncEnv } from "./notion/notion-env.js";
import { loadNotionOcrEnv } from "./notion/notion-ocr-env.js";
import { pushDecisionsFromSoT } from "./notion/push-decisions.js";
import { OcrPushInputSchema, pushOcrResourceAndSummary } from "./notion/push-ocr.js";
import { pullNotionDatabaseToQueue } from "./notion/pull-queue.js";
import { loadNotionQueuePreview } from "./notion-queue.js";
import { searchMemory } from "./search/memory-search.js";
import { writeEvaluationLog } from "./evaluation-log.js";

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
        "Yohan OS 에이전트 SoT: profile, active-project, 최근 decisions, 최근 인제스트 요약, 노션 풀 큐(`notion_queue`) 미리보기. 노션 동기는 MCP `notion_push_decisions` / `notion_push_ocr_pair` / `notion_pull_to_queue` 또는 npm 스크립트. 세션 시작 시 호출.",
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

  const qualityScoresSchema = z.object({
    searchability: z.boolean().describe("true = 검색·키워드 등 탐색 가능성 충족"),
    self_contained: z.boolean().describe("true = 카드/문서만으로 맥락 이해 가능"),
    pattern_consistency: z.boolean().describe("true = 기존 코드·문서 패턴과 일치"),
    compression: z.boolean().describe("true = 핵심 압축·중복 없이 요약 적절"),
    connectivity: z.boolean().describe("true = 링크·related·경로 등 연결성 적절"),
  });

  const evaluationChecklistSchema = z.object({
    scope_exceeded: z.boolean().describe("true = 범위 초과 변경 있음(나쁨). 없으면 false"),
    memory_structure_changed: z.boolean().describe("true = memory/ 폴더 구조 변경 있음(나쁨). 없으면 false"),
    secret_exposed: z.boolean().describe("true = 시크릿·키 평문 노출 의심(나쁨). 없으면 false"),
    must_not_violated: z.boolean().describe("true = must_not 위반(나쁨). 없으면 false"),
    frontmatter_valid: z.boolean().describe("true = 새 .md 프론트매터 규칙 충족 또는 해당 없음(양호)"),
    unverified_claims: z.boolean().describe("true = 출처 없는 사실 단정 있음(나쁨). 없으면 false"),
    content_lost: z.boolean().describe("true = 의도치 않은 삭제·유실 의심(나쁨). 없으면 false"),
    voice_aligned: z.boolean().describe("true = profile voice·differentiation과 정합(양호)"),
  });

  server.registerTool(
    "log_evaluation",
    {
      description:
        "Evaluator 판정을 구조화 로그로 memory/metrics/evaluations/eval-{날짜}-{순번}.md 에 저장한다. id·date·순번은 서버가 부여(Asia/Seoul 날짜). 응답 말미 Evaluator 블록 직후 호출.",
      inputSchema: {
        verdict: z.enum(["pass", "revise", "reject"]).describe("Evaluator 판정"),
        task: z.string().min(1).describe("이번 턴 작업 한 줄 설명"),
        files_changed: z.number().int().min(0).describe("변경·추가된 파일 수"),
        revise_count: z.number().int().min(0).describe("누적 revise 횟수 또는 이번 지적 항목 수 등 정수"),
        quality_scores: qualityScoresSchema,
        checklist: evaluationChecklistSchema,
        body: z.string().optional().describe("프론트매터 아래 선택 마크다운(대조 요약·수정 지시 등)"),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .describe("선택. YYYY-MM-DD. 생략 시 Asia/Seoul 당일"),
      },
    },
    async (args) => {
      const r = await writeEvaluationLog({
        verdict: args.verdict,
        task: args.task,
        files_changed: args.files_changed,
        revise_count: args.revise_count,
        quality_scores: args.quality_scores,
        checklist: args.checklist,
        body: args.body,
        date: args.date,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ ok: true, id: r.id, path: r.path, date: r.date, seq: r.seq }, null, 2),
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

  const rssMcpTools: Array<{ name: string; description: string; def: RssFeedDefinition }> = [
    {
      name: "ingest_yozm_rss",
      description:
        "요즘IT RSS(https://yozm.wishket.com/magazine/feed/) → memory/ingest/rss/yozm/ (ingest.v0). OPENAI_API_KEY 있으면 title_ko·summary_ko. 동일 원문 URL 스킵.",
      def: RSS_FEED_YOZM,
    },
    {
      name: "ingest_aitimes_rss",
      description:
        "AI 타임스 RSS(https://www.aitimes.com/rss/allArticle.xml) → memory/ingest/rss/aitimes/. OPENAI_API_KEY 있으면 한국어 필드 추가.",
      def: RSS_FEED_AITIMES,
    },
    {
      name: "ingest_themilk_rss",
      description:
        "더 밀크 RSS(https://www.the-mill.kr/rss) → memory/ingest/rss/themilk/. OPENAI_API_KEY 있으면 한국어 필드 추가.",
      def: RSS_FEED_THEMILK,
    },
    {
      name: "ingest_paulgraham_rss",
      description:
        "Paul Graham 에세이 RSS(Aaron Swartz 스크랩 피드, rss-feed-config 참고) → memory/ingest/rss/paulgraham/. OPENAI_API_KEY 있으면 한국어 필드 추가.",
      def: RSS_FEED_PAULGRAHAM,
    },
    {
      name: "ingest_samaltman_rss",
      description:
        "Sam Altman Atom(https://blog.samaltman.com/posts.atom) → memory/ingest/rss/samaltman/. OPENAI_API_KEY 있으면 한국어 필드 추가.",
      def: RSS_FEED_SAMALTMAN,
    },
    {
      name: "ingest_karpathy_rss",
      description:
        "Andrej Karpathy RSS(https://karpathy.github.io/feed.xml) → memory/ingest/rss/karpathy/. OPENAI_API_KEY 있으면 한국어 필드 추가.",
      def: RSS_FEED_KARPATHY,
    },
  ];

  for (const t of rssMcpTools) {
    server.registerTool(
      t.name,
      {
        description: t.description,
        inputSchema: {
          limit: z.number().int().min(1).max(100).optional().describe("가져올 최대 항목 수 (기본 20)"),
        },
      },
      async (args) => {
        const limit = args?.limit ?? 20;
        const r = await ingestRssFeed(t.def, { limit });
        return {
          content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
        };
      },
    );
  }

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
    "notion_push_decisions",
    {
      description:
        "memory/decisions 의 최근 md 를 노션 DB에 푸시한다. 멱등 키는 파일 경로 해시(`SoT Key` 열). NOTION_TOKEN·NOTION_DATABASE_ID·DB 스키마 필요.",
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("최대 파일 수 (기본 20)"),
      },
    },
    async (args) => {
      try {
        const env = loadNotionSyncEnv();
        const results = await pushDecisionsFromSoT(env, { limit: args?.limit ?? 20 });
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: true, results }, null, 2) }],
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, error: msg }, null, 2) }],
        };
      }
    },
  );

  server.registerTool(
    "notion_pull_to_queue",
    {
      description:
        "노션 DB 행을 읽어 memory/inbox/notion-queue.md 에만 append. 이미 큐에 있는 page_id 는 스킵. profile·decisions 자동 덮어쓰기 없음.",
      inputSchema: {
        page_size: z.number().int().min(1).max(100).optional().describe("한 번에 조회할 행 수 (기본 50)"),
      },
    },
    async (args) => {
      try {
        const env = loadNotionSyncEnv();
        const r = await pullNotionDatabaseToQueue(env, { pageSize: args?.page_size ?? 50 });
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: true, ...r, queue_file: "memory/inbox/notion-queue.md" }, null, 2) }],
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, error: msg }, null, 2) }],
        };
      }
    },
  );

  server.registerTool(
    "notion_push_ocr_pair",
    {
      description:
        "텔레그램 OCR 파이프라인: 리소스 DB(원문 OCR)·서머리 DB(정제본)에 각각 페이지 생성, 서머리는 리소스와 relation 연결. NOTION_TOKEN·NOTION_OCR_* 및 DB 열 이름(.env) 필요. memory/rules/notion-ocr-pipeline.md 참조.",
      inputSchema: OcrPushInputSchema.shape,
    },
    async (args) => {
      try {
        const env = loadNotionOcrEnv();
        const parsed = OcrPushInputSchema.safeParse(args);
        if (!parsed.success) {
          return {
            content: [
              { type: "text", text: JSON.stringify({ ok: false, error: "validation", details: parsed.error.format() }, null, 2) },
            ],
          };
        }
        const r = await pushOcrResourceAndSummary(env, parsed.data);
        return {
          content: [{ type: "text", text: JSON.stringify(r, null, 2) }],
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: false, error: msg }, null, 2) }],
        };
      }
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
