import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import Parser from "rss-parser";
import { stringify as stringifyYaml } from "yaml";
import { getMemoryDir } from "../paths.js";

/** GeekNews 메인 피드 (공식) */
export const GEEKNEWS_FEED_URL = "https://news.hada.io/rss/news";

export type IngestGeekNewsResult = {
  feed_url: string;
  out_dir: string;
  written: string[];
  skipped: string[];
  errors: string[];
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function fileIdForLink(link: string): string {
  return `gn-${createHash("sha256").update(link).digest("hex").slice(0, 16)}`;
}

/**
 * GeekNews RSS → memory/ingest/rss/geeknews/*.md (ingest.v0 스키마)
 * 동일 source_url 은 파일명 해시로 중복 스킵.
 */
export async function ingestGeekNewsRss(options?: {
  limit?: number;
  feedUrl?: string;
}): Promise<IngestGeekNewsResult> {
  const feedUrl = options?.feedUrl ?? GEEKNEWS_FEED_URL;
  const limit = Math.min(100, Math.max(1, options?.limit ?? 20));

  const outDir = join(getMemoryDir(), "ingest", "rss", "geeknews");
  await mkdir(outDir, { recursive: true });

  const parser = new Parser();
  const feed = await parser.parseURL(feedUrl);

  const written: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  const items = (feed.items ?? []).slice(0, limit);

  for (const item of items) {
    const link = item.link ?? "";
    if (!link) {
      errors.push("link 없는 항목 스킵");
      continue;
    }

    const id = fileIdForLink(link);
    const filePath = join(outDir, `${id}.md`);
    if (existsSync(filePath)) {
      skipped.push(id);
      continue;
    }

    const title = (item.title ?? "(no title)").replace(/\r?\n/g, " ");
    const pub = item.pubDate ?? item.isoDate ?? "";
    const bodyText =
      item.contentSnippet?.trim() ||
      (item.content ? stripHtml(item.content).slice(0, 12000) : "") ||
      "_본문 없음_";

    const front: Record<string, unknown> = {
      schema_version: "ingest.v0",
      kind: "rss",
      source_name: "geeknews",
      source_feed: feedUrl,
      source_url: link,
      title,
      published: pub || null,
      guid: item.guid ?? null,
      ingested_at: new Date().toISOString(),
    };

    const yamlBlock = stringifyYaml(front).trim();
    const md = `---\n${yamlBlock}\n---\n\n# ${title}\n\n${bodyText}\n\n**원문:** [열기](${link})\n`;

    try {
      await writeFile(filePath, md, "utf8");
      written.push(filePath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${id}: ${msg}`);
    }
  }

  return {
    feed_url: feedUrl,
    out_dir: outDir,
    written,
    skipped,
    errors,
  };
}
