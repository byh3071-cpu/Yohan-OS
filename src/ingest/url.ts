import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { stringify as stringifyYaml } from "yaml";
import { getMemoryDir } from "../paths.js";

/** Node 20+ ESM: `createRequire(youtube-transcript)` 는 패키지 CJS/ESM 혼선으로 깨짐 → 동적 import만 사용 */
async function fetchYoutubeTranscriptText(pageUrl: string): Promise<string> {
  try {
    const mod = await import("youtube-transcript");
    const YT = mod.YoutubeTranscript as {
      fetchTranscript: (url: string) => Promise<Array<{ text: string }>>;
    };
    const chunks = await YT.fetchTranscript(pageUrl);
    return chunks.map((c) => c.text).join(" ").trim();
  } catch {
    return "";
  }
}

export type IngestUrlResult = {
  source_url: string;
  out_path: string | null;
  skipped: boolean;
  error?: string;
};

function normalizeUrlForId(href: string): string {
  try {
    const u = new URL(href)
    u.hash = ""
    u.hostname = u.hostname.toLowerCase()
    const kept: Array<[string, string]> = []
    for (const [k, v] of u.searchParams.entries()) {
      const key = k.toLowerCase()
      if (key.startsWith("utm_") || key.startsWith("media_") || key.startsWith("ranking_")) continue
      kept.push([k, v])
    }
    u.search = ""
    for (const [k, v] of kept) u.searchParams.append(k, v)
    return u.toString()
  } catch {
    return href
  }
}

function fileIdForUrl(canonical: string): string {
  return `url-${createHash("sha256").update(canonical).digest("hex").slice(0, 16)}`;
}

function isYoutubeHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === "youtube.com" || h === "www.youtube.com" || h === "m.youtube.com" || h === "youtu.be" || h === "www.youtu.be";
}

const defaultFetchHeaders: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
};

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  return fetch(url, {
    headers: defaultFetchHeaders,
    signal: AbortSignal.timeout(ms),
  });
}

async function ingestYoutube(pageUrl: string, canonical: string, outFile: string): Promise<void> {
  let title = "(youtube)";
  let author: string | undefined;
  let transcriptText = "";

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(pageUrl)}&format=json`;
    const r = await fetchWithTimeout(oembedUrl, 15000);
    if (r.ok) {
      const j = (await r.json()) as { title?: string; author_name?: string };
      if (j.title) title = j.title;
      author = j.author_name;
    }
  } catch {
    /* oEmbed 실패 시에도 URL만 저장 */
  }

  transcriptText = await fetchYoutubeTranscriptText(pageUrl);

  const bodyParts = [`# ${title}\n`];
  if (author) bodyParts.push(`\n**채널:** ${author}\n`);
  if (transcriptText) {
    bodyParts.push("\n## 자막(추출)\n\n", transcriptText.slice(0, 50000));
    if (transcriptText.length > 50000) bodyParts.push("\n\n…(truncated)");
  } else {
    bodyParts.push("\n_(자막을 가져오지 못했습니다. 원문 링크 참고)_\n");
  }
  bodyParts.push(`\n**원문:** [열기](${pageUrl})\n`);

  const front: Record<string, unknown> = {
    schema_version: "ingest.v0",
    kind: "url",
    subtype: "youtube",
    source_url: pageUrl,
    canonical_url: canonical,
    title,
    author: author ?? null,
    has_transcript: transcriptText.length > 0,
    ingested_at: new Date().toISOString(),
  };

  const yamlBlock = stringifyYaml(front).trim();
  const md = `---\n${yamlBlock}\n---\n${bodyParts.join("")}`;
  await writeFile(outFile, md, "utf8");
}

async function ingestArticle(pageUrl: string, canonical: string, outFile: string): Promise<void> {
  const res = await fetchWithTimeout(pageUrl, 20000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const dom = new JSDOM(html, { url: pageUrl });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  const title = article?.title?.trim() || dom.window.document.title || "(no title)";
  const textContent = article?.textContent?.trim() || "";
  const excerpt = article?.excerpt?.trim() || "";

  const body =
    textContent.slice(0, 80000) || excerpt || "_본문 추출에 실패했습니다. 원문 링크를 열어 확인하세요._";

  const front: Record<string, unknown> = {
    schema_version: "ingest.v0",
    kind: "url",
    subtype: "article",
    source_url: pageUrl,
    canonical_url: canonical,
    title,
    site: (() => {
      try {
        return new URL(pageUrl).hostname;
      } catch {
        return null;
      }
    })(),
    ingested_at: new Date().toISOString(),
  };

  const yamlBlock = stringifyYaml(front).trim();
  const md = `---\n${yamlBlock}\n---\n\n# ${title}\n\n${body}\n\n**원문:** [열기](${pageUrl})\n`;
  await writeFile(outFile, md, "utf8");
}

/**
 * 단일 HTTP(S) URL → memory/ingest/url/*.md (ingest.v0). 동일 canonical URL 이면 스킵.
 */
export async function ingestUrl(rawUrl: string): Promise<IngestUrlResult> {
  let pageUrl: URL;
  try {
    pageUrl = new URL(rawUrl.trim());
  } catch {
    return { source_url: rawUrl, out_path: null, skipped: false, error: "유효한 http(s) URL이 아닙니다." };
  }
  if (pageUrl.protocol !== "http:" && pageUrl.protocol !== "https:") {
    return { source_url: rawUrl, out_path: null, skipped: false, error: "http 또는 https 만 지원합니다." };
  }

  const canonical = normalizeUrlForId(pageUrl.toString());
  const id = fileIdForUrl(canonical);
  const outDir = join(getMemoryDir(), "ingest", "url");
  await mkdir(outDir, { recursive: true });
  const outFile = join(outDir, `${id}.md`);

  if (existsSync(outFile)) {
    return { source_url: pageUrl.toString(), out_path: outFile, skipped: true };
  }

  try {
    if (isYoutubeHost(pageUrl.hostname)) {
      await ingestYoutube(pageUrl.toString(), canonical, outFile);
    } else {
      await ingestArticle(pageUrl.toString(), canonical, outFile);
    }
    return { source_url: pageUrl.toString(), out_path: outFile, skipped: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { source_url: pageUrl.toString(), out_path: null, skipped: false, error: msg };
  }
}
