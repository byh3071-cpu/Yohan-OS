import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { parseMdFrontmatter } from "./frontmatter.js";
import { getMemoryDir } from "../paths.js";

export type IngestSummaryItem = {
  file: string;
  rel_path: string;
  title: string;
  source_url: string;
  kind: string;
  subtype?: string;
  ingested_at?: string;
};

async function collectMdFilesUnderRss(memoryDir: string): Promise<string[]> {
  const rssRoot = join(memoryDir, "ingest", "rss");
  if (!existsSync(rssRoot)) return [];
  const subs = await readdir(rssRoot, { withFileTypes: true });
  const out: string[] = [];
  for (const d of subs) {
    if (!d.isDirectory()) continue;
    const dir = join(rssRoot, d.name);
    const names = await readdir(dir);
    for (const n of names) {
      if (n.endsWith(".md")) out.push(join(dir, n));
    }
  }
  return out;
}

/**
 * RSS·URL 인제스트 md 중 수정 시각 최신순 상위 limit개, 제목·링크만.
 */
export async function loadRecentIngestSummary(limit: number): Promise<IngestSummaryItem[]> {
  const memoryDir = getMemoryDir();

  const files: { path: string; mtime: number }[] = [];

  for (const p of await collectMdFilesUnderRss(memoryDir)) {
    const s = await stat(p);
    files.push({ path: p, mtime: s.mtimeMs });
  }

  const urlDir = join(memoryDir, "ingest", "url");
  if (existsSync(urlDir)) {
    const names = await readdir(urlDir);
    for (const n of names) {
      if (!n.endsWith(".md")) continue;
      const p = join(urlDir, n);
      const s = await stat(p);
      files.push({ path: p, mtime: s.mtimeMs });
    }
  }
  files.sort((a, b) => b.mtime - a.mtime);
  const picked = files.slice(0, limit);

  const out: IngestSummaryItem[] = [];
  for (const { path } of picked) {
    const raw = await readFile(path, "utf8");
    const fm = parseMdFrontmatter(raw);
    if (!fm) continue;
    out.push({
      file: basename(path),
      rel_path: relative(memoryDir, path).replace(/\\/g, "/"),
      title: String(fm.title ?? "(no title)"),
      source_url: String(fm.source_url ?? ""),
      kind: String(fm.kind ?? ""),
      subtype: fm.subtype != null ? String(fm.subtype) : undefined,
      ingested_at: fm.ingested_at != null ? String(fm.ingested_at) : undefined,
    });
  }
  return out;
}
