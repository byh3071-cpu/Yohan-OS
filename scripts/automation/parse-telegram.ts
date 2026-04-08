import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { getInboxDir, getTelegramInboxDir, resolveRepoRoot } from "../../src/paths.js"
import type { ScreenshotBlock } from "./types.js"

const SHORT_LINE_MAX = 3
const SHORT_CHAR_MAX = 180

function ymdSeoul(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date)
}

function dateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((v) => Number(v))
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0))
}

export function lastTwoYmdSeoul(): string[] {
  const now = new Date()
  const today = ymdSeoul(now)
  const todayUtc = dateFromYmd(today)
  const yesterdayUtc = new Date(todayUtc.getTime() - 86_400_000)
  const yesterday = ymdSeoul(yesterdayUtc)
  return [today, yesterday]
}

export function extractHttpUrls(text: string): string[] {
  const re = /\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+/gi
  const found = text.match(re) ?? []
  return [...new Set(found.map((u) => u.replace(/[),.]+$/g, "")))]
}

export function isGithubLikeUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === "github.com" || host === "www.github.com" || host === "gist.github.com" || host === "www.gist.github.com"
  } catch {
    return false
  }
}

export function normalizeTrackingParams(rawUrl: string): string {
  try {
    const u = new URL(rawUrl)
    const kept: Array<[string, string]> = []
    for (const [k, v] of u.searchParams.entries()) {
      const key = k.toLowerCase()
      if (key.startsWith("utm_") || key.startsWith("media_") || key.startsWith("ranking_")) {
        continue
      }
      kept.push([k, v])
    }
    u.search = ""
    for (const [k, v] of kept) {
      u.searchParams.append(k, v)
    }
    u.hash = ""
    return u.toString()
  } catch {
    return rawUrl
  }
}

export function parseScreenshotBlocks(md: string): ScreenshotBlock[] {
  const lines = md.split(/\r?\n/)
  const blocks: ScreenshotBlock[] = []
  let i = 0
  while (i < lines.length) {
    if ((lines[i] ?? "").trim() !== "---") {
      i++
      continue
    }
    const headerStart = i
    i++
    const header: string[] = []
    while (i < lines.length && (lines[i] ?? "").trim() !== "---") {
      header.push(lines[i] ?? "")
      i++
    }
    if (i >= lines.length) break
    i++
    const hMap = new Map<string, string>()
    for (const row of header) {
      const idx = row.indexOf(":")
      if (idx <= 0) continue
      hMap.set(row.slice(0, idx).trim(), row.slice(idx + 1).trim())
    }
    if (hMap.get("type") !== "screenshot") {
      continue
    }
    while (i < lines.length && (lines[i] ?? "").trim() === "") i++
    const bodyLines: string[] = []
    while (i < lines.length && (lines[i] ?? "").trim() !== "---") {
      bodyLines.push(lines[i] ?? "")
      i++
    }
    const receivedAt = hMap.get("received_at") ?? ""
    const messageId = hMap.get("message_id") ?? ""
    const chatId = hMap.get("from_chat_id") ?? ""
    if (!receivedAt || !messageId) {
      i = headerStart + 1
      continue
    }
    blocks.push({ receivedAt, messageId, chatId, body: bodyLines.join("\n").trim() })
  }
  return blocks
}

export function classifyBody(body: string): "short" | "long" {
  const nonEmptyLines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length
  const chars = body.trim().length
  return nonEmptyLines <= SHORT_LINE_MAX || chars <= SHORT_CHAR_MAX ? "short" : "long"
}

export async function readTargetBlocks(inboxFile?: string): Promise<ScreenshotBlock[]> {
  let files = inboxFile
    ? [resolve(resolveRepoRoot(), inboxFile)]
    : lastTwoYmdSeoul().map((d) => join(getTelegramInboxDir(), `${d}.md`))

  // 마이그레이션 호환: 일별 파일이 아직 없으면 레거시 단일 인박스를 fallback 입력으로 사용
  if (!inboxFile && files.every((f) => !existsSync(f))) {
    files = [join(getInboxDir(), "telegram-inbox.md")]
  }

  const out: ScreenshotBlock[] = []
  for (const file of files) {
    if (!existsSync(file)) continue
    const md = await readFile(file, "utf8")
    out.push(...parseScreenshotBlocks(md))
  }
  return out
}
