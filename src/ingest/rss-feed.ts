import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import Parser from "rss-parser";
import { stringify as stringifyYaml } from "yaml";
import { getMemoryDir, resolveRepoRoot } from "../paths.js";
import { translateTitleAndSummaryToKo } from "./openai-translate-ko.js";
import type { RssFeedDefinition } from "./rss-feed-config.js";

config({ path: join(resolveRepoRoot(), ".env") });

export type IngestRssFeedResult = {
  feed_key: string;
  feed_url: string;
  out_dir: string;
  written: string[];
  skipped: string[];
  errors: string[];
  translation: "ok" | "skipped" | "partial";
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function fileIdForLink(feedKey: string, link: string): string {
  const h = createHash("sha256").update(link).digest("hex").slice(0, 16);
  return `${feedKey}-${h}`;
}

/**
 * 범용 RSS/Atom → memory/ingest/rss/{feedKey}/*.md (ingest.v0)
 * OPENAI_API_KEY 있으면 title_ko, summary_ko frontmatter 추가 (실패 시 원문만).
 */
export async function ingestRssFeed(
  def: RssFeedDefinition,
  options?: { limit?: number },
): Promise<IngestRssFeedResult> {
  const feedUrl = def.feedUrl;
  const limit = Math.min(100, Math.max(1, options?.limit ?? 20));
  const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";

  const outDir = join(getMemoryDir(), "ingest", "rss", def.feedKey);
  await mkdir(outDir, { recursive: true });

  const parser = new Parser({
    timeout: 60_000,
    headers: {
      "User-Agent": "Yohan-OS-RSS-Ingest/1.0",
    },
  });

  const feed = await parser.parseURL(feedUrl);

  const written: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  let feedHadTranslation = false;

  const items = (feed.items ?? []).slice(0, limit);

  for (const item of items) {
    const link = item.link ?? "";
    if (!link) {
      errors.push("link 없는 항목 스킵");
      continue;
    }

    const id = fileIdForLink(def.feedKey, link);
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

    const excerptForKo = item.contentSnippet?.trim() || stripHtml(item.content ?? "").slice(0, 8000) || bodyText;

    const front: Record<string, unknown> = {
      schema_version: "ingest.v0",
      kind: "rss",
      source_name: def.sourceName,
      source_feed: feedUrl,
      source_url: link,
      title,
      published: pub || null,
      guid: item.guid ?? null,
      ingested_at: new Date().toISOString(),
    };

    if (apiKey) {
      const tr = await translateTitleAndSummaryToKo(title, excerptForKo, apiKey);
      if (tr) {
        front.title_ko = tr.title_ko;
        front.summary_ko = tr.summary_ko;
        feedHadTranslation = true;
      }
    }

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

  const translation: IngestRssFeedResult["translation"] = !apiKey
    ? "skipped"
    : feedHadTranslation
      ? "ok"
      : "partial";

  return {
    feed_key: def.feedKey,
    feed_url: feedUrl,
    out_dir: outDir,
    written,
    skipped,
    errors,
    translation,
  };
}
