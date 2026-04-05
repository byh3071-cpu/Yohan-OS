import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import * as z from "zod/v4";

function resolveRepoRoot(): string {
  const env = process.env.YOHAN_OS_ROOT?.trim();
  if (env) return env;
  return process.cwd();
}

function memoryDir(): string {
  return join(resolveRepoRoot(), "memory");
}

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
        "Yohan OS 에이전트 SoT: profile.yaml, active-project.yaml, 최근 decisions/*.md 를 로드해 단일 맥락 패키지로 반환한다. 세션 시작 시 호출.",
    },
    async () => {
      const root = memoryDir();
      const profilePath = join(root, "profile.yaml");
      const activePath = join(root, "active-project.yaml");
      const decisionsPath = join(root, "decisions");

      const profile = await readYamlFile<Record<string, unknown>>(profilePath);
      const activeProject = await readYamlFile<Record<string, unknown>>(activePath);
      const recentDecisions = await loadRecentDecisions(decisionsPath, 8);

      const payload = {
        sot_version: "0.1",
        memory_root: root,
        profile: profile.ok ? profile.data : { _error: profile.error },
        active_project: activeProject.ok ? activeProject.data : { _error: activeProject.error },
        recent_decisions: recentDecisions.map(({ file, content }) => ({
          file,
          content: content.length > 6000 ? `${content.slice(0, 6000)}\n\n…(truncated)` : content,
        })),
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
      const root = memoryDir();
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

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
