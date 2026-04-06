import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { getMemoryDir } from "../paths.js";

export type MemorySearchHit = {
  rel_path: string;
  line: number;
  snippet: string;
};

const TEXT_EXT = new Set([".md", ".yaml", ".yml", ".txt"]);
const MAX_FILE_BYTES = 1_500_000;
const SKIP_DIR = new Set(["node_modules", ".git", "dist"]);

async function walkFiles(dir: string, out: string[]): Promise<void> {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      await walkFiles(p, out);
    } else {
      const ext = extname(e.name).toLowerCase();
      if (TEXT_EXT.has(ext)) out.push(p);
    }
  }
}

/**
 * `memory/` 이하 텍스트 파일에서 대소문자 무시 부분 문자열 검색 (ingest·decisions·rules·프로필 등).
 */
export async function searchMemory(
  query: string,
  options?: { maxResults?: number; root?: string },
): Promise<{ query: string; hits: MemorySearchHit[]; truncated: boolean }> {
  const q = query.trim();
  const maxResults = Math.min(200, Math.max(1, options?.maxResults ?? 40));
  const root = options?.root ?? getMemoryDir();

  const files: string[] = [];
  await walkFiles(root, files);

  const qLower = q.toLowerCase();
  const hits: MemorySearchHit[] = [];
  let truncated = false;

  outer: for (const filePath of files) {
    let st;
    try {
      st = await stat(filePath);
    } catch {
      continue;
    }
    if (st.size > MAX_FILE_BYTES) continue;

    let content: string;
    try {
      content = await readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(qLower)) {
        const snippet = lines[i].trim().slice(0, 400);
        hits.push({
          rel_path: relative(root, filePath).replace(/\\/g, "/"),
          line: i + 1,
          snippet,
        });
        if (hits.length >= maxResults) {
          truncated = true;
          break outer;
        }
      }
    }
  }

  return { query: q, hits, truncated };
}
