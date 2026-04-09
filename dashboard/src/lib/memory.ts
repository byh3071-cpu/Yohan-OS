import { readdir, readFile, stat } from "node:fs/promises"
import { join, relative, extname } from "node:path"
import matter from "gray-matter"
import { buildDomainCounts, DOMAIN_COLORS } from "./domains"

const MEMORY_ROOT = join(process.cwd(), "..", "memory")

export type DocCategory =
  | "insights"
  | "rss"
  | "url"
  | "decisions"
  | "rules"
  | "templates"

export interface DocMeta {
  id: string
  title: string
  date: string | null
  tags: string[]
  category: DocCategory
  relPath: string
  excerpt: string
  sourceName: string | null
}

export interface DocFull extends DocMeta {
  content: string
  frontmatter: Record<string, unknown>
}

const CATEGORY_MAP: Record<string, DocCategory> = {
  "ingest/insights": "insights",
  "ingest/rss": "rss",
  "ingest/url": "url",
  decisions: "decisions",
  rules: "rules",
  templates: "templates",
}

function categorize(relPath: string): DocCategory {
  for (const [prefix, cat] of Object.entries(CATEGORY_MAP)) {
    if (relPath.startsWith(prefix)) return cat
  }
  return "rules"
}

const CATEGORY_LABELS: Record<DocCategory, string> = {
  insights: "인사이트",
  rss: "RSS",
  url: "URL",
  decisions: "결정로그",
  rules: "규칙",
  templates: "템플릿",
}

export function getCategoryLabel(cat: DocCategory): string {
  return CATEGORY_LABELS[cat] ?? cat
}

async function collectMdFiles(dir: string, base: string): Promise<string[]> {
  const result: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) {
        result.push(...(await collectMdFiles(full, base)))
      } else if (e.name.endsWith(".md") && !e.name.startsWith("README")) {
        result.push(full)
      }
    }
  } catch {
    /* skip unreadable dirs */
  }
  return result
}

function extractDate(data: Record<string, unknown>, fileName: string): string | null {
  for (const key of ["ingested_at", "date", "created", "published"]) {
    const v = data[key]
    if (!v) continue
    if (v instanceof Date) return v.toISOString().slice(0, 10)
    if (typeof v === "string") {
      const m = v.match(/^\d{4}-\d{2}-\d{2}/)
      if (m) return m[0]
    }
  }
  const fm = fileName.match(/^(\d{4}-\d{2}-\d{2})/)
  if (fm) return fm[1]
  return null
}

function extractSourceName(data: Record<string, unknown>): string | null {
  if (typeof data.source_name === "string" && data.source_name) return data.source_name
  return null
}

function extractTitle(data: Record<string, unknown>, content: string, fileName: string): string {
  if (typeof data.title === "string" && data.title) return data.title
  const h1 = content.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return fileName.replace(/\.md$/, "")
}

function extractExcerpt(content: string, max = 120): string {
  const cleaned = content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/^#+\s+.+$/gm, "")
    .replace(/[*_`[\]]/g, "")
    .trim()
  const firstPara = cleaned.split("\n\n")[0] ?? ""
  const flat = firstPara.replace(/\n/g, " ").trim()
  return flat.length > max ? flat.slice(0, max) + "…" : flat
}

export async function listDocs(): Promise<DocMeta[]> {
  const scanDirs = [
    "ingest/insights",
    "ingest/rss",
    "ingest/url",
    "decisions",
    "rules",
    "templates",
  ]

  const allFiles: string[] = []
  for (const d of scanDirs) {
    allFiles.push(...(await collectMdFiles(join(MEMORY_ROOT, d), MEMORY_ROOT)))
  }

  const docs: DocMeta[] = []

  for (const filePath of allFiles) {
    try {
      const raw = await readFile(filePath, "utf8")
      const { data, content } = matter(raw)
      const relPath = relative(MEMORY_ROOT, filePath).replace(/\\/g, "/")
      const fileName = filePath.split(/[\\/]/).pop() ?? ""

      docs.push({
        id: typeof data.id === "string" ? data.id : relPath,
        title: extractTitle(data, content, fileName),
        date: extractDate(data, fileName),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        category: categorize(relPath),
        relPath,
        excerpt: extractExcerpt(content),
        sourceName: extractSourceName(data),
      })
    } catch {
      /* skip unparseable files */
    }
  }

  docs.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
  return docs
}

export async function getDoc(relPath: string): Promise<DocFull | null> {
  const filePath = join(MEMORY_ROOT, relPath)
  try {
    const raw = await readFile(filePath, "utf8")
    const { data, content } = matter(raw)
    const fileName = filePath.split(/[\\/]/).pop() ?? ""

    return {
      id: typeof data.id === "string" ? data.id : relPath,
      title: extractTitle(data, content, fileName),
      date: extractDate(data, fileName),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: categorize(relPath),
      relPath,
      excerpt: extractExcerpt(content),
      sourceName: extractSourceName(data),
      content,
      frontmatter: data,
    }
  } catch {
    return null
  }
}

export interface Stats {
  totalDocs: number
  decisions: number
  ingests: number
  batchStatus: "ok" | "error" | "unknown"
  batchLastRun: string | null
}

export interface IngestTrend { date: string; count: number }
export interface DomainSlice { domain: string; count: number; color: string }
export interface BatchDay { date: string; ok: number; fail: number }
export interface ActivityPoint { date: string; commits: number; ingests: number; decisions: number }
export interface DecisionPoint { date: string; count: number }
export interface CategorySlice { category: string; label: string; count: number; color: string }
export interface SourceSlice { source: string; count: number; color: string }

export interface ChartData {
  ingestTrend: IngestTrend[]
  domainDist: DomainSlice[]
  categoryDist: CategorySlice[]
  sourceDist: SourceSlice[]
  batchHistory: BatchDay[]
  activity: ActivityPoint[]
  decisionHistory: DecisionPoint[]
}

export async function parseBatchHistory(): Promise<BatchDay[]> {
  const days: Record<string, { ok: number; fail: number }> = {}
  try {
    const log = await readFile(join(MEMORY_ROOT, "logs", "automation-batch.log"), "utf8")
    let currentDate = ""
    for (const line of log.split("\n")) {
      const dm = line.match(/^\[(\d{4}-\d{2}-\d{2})/)
      if (dm) currentDate = dm[1]
      if (!currentDate) continue
      const sm = line.match(/실패=(\d+)/) ?? line.match(/fail=(\d+)/i)
      const done = line.includes("DONE")
      if (done) {
        if (!days[currentDate]) days[currentDate] = { ok: 0, fail: 0 }
        const failCount = sm ? parseInt(sm[1]) : 0
        if (failCount > 0) days[currentDate].fail++
        else days[currentDate].ok++
      }
    }
  } catch { /* no log */ }
  return Object.entries(days)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30)
}

export function buildChartData(docs: DocMeta[], batchHistory: BatchDay[]): ChartData {
  const dateCounts: Record<string, number> = {}
  for (const d of docs) {
    if (d.date && ["insights", "rss", "url"].includes(d.category)) {
      dateCounts[d.date] = (dateCounts[d.date] ?? 0) + 1
    }
  }
  const sortedDates = Object.keys(dateCounts).sort()
  const last30 = sortedDates.slice(-30)
  const ingestTrend: IngestTrend[] = last30.map((date) => ({ date, count: dateCounts[date] }))

  const allTags = docs.flatMap((d) => d.tags)
  const domainCounts = buildDomainCounts(allTags)
  const domainDist: DomainSlice[] = Object.entries(domainCounts)
    .filter(([, count]) => count > 0)
    .map(([domain, count]) => ({
      domain,
      count,
      color: DOMAIN_COLORS[domain as keyof typeof DOMAIN_COLORS] ?? "#94a3b8",
    }))
    .sort((a, b) => b.count - a.count)

  const ingestByDate: Record<string, number> = {}
  const decisionByDate: Record<string, number> = {}
  for (const d of docs) {
    if (!d.date) continue
    if (["insights", "rss", "url"].includes(d.category)) {
      ingestByDate[d.date] = (ingestByDate[d.date] ?? 0) + 1
    }
    if (d.category === "decisions") {
      decisionByDate[d.date] = (decisionByDate[d.date] ?? 0) + 1
    }
  }

  const allDates = new Set([...Object.keys(ingestByDate), ...Object.keys(decisionByDate)])
  const activity: ActivityPoint[] = [...allDates]
    .sort()
    .slice(-30)
    .map((date) => ({
      date,
      commits: 0,
      ingests: ingestByDate[date] ?? 0,
      decisions: decisionByDate[date] ?? 0,
    }))

  const decisionHistory: DecisionPoint[] = Object.entries(decisionByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const CAT_COLORS: Record<string, string> = {
    insights: "#818cf8", rss: "#a78bfa", url: "#34d399",
    decisions: "#fbbf24", rules: "#f472b6", templates: "#38bdf8",
  }
  const catCounts: Record<string, number> = {}
  for (const d of docs) catCounts[d.category] = (catCounts[d.category] ?? 0) + 1
  const categoryDist: CategorySlice[] = Object.entries(catCounts)
    .map(([cat, count]) => ({ category: cat, label: CATEGORY_LABELS[cat as DocCategory] ?? cat, count, color: CAT_COLORS[cat] ?? "#94a3b8" }))
    .sort((a, b) => b.count - a.count)

  const SOURCE_COLORS = ["#818cf8", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#38bdf8", "#fb923c", "#94a3b8"]
  const srcCounts: Record<string, number> = {}
  for (const d of docs) {
    if (d.sourceName) srcCounts[d.sourceName] = (srcCounts[d.sourceName] ?? 0) + 1
  }
  const sourceDist: SourceSlice[] = Object.entries(srcCounts)
    .map(([source, count], i) => ({ source, count, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }))
    .sort((a, b) => b.count - a.count)

  return { ingestTrend, domainDist, categoryDist, sourceDist, batchHistory, activity, decisionHistory }
}

export interface GitCommit { hash: string; date: string; message: string }

export async function getGitLog(limit = 30): Promise<GitCommit[]> {
  const { execSync } = require("node:child_process") as typeof import("node:child_process")
  try {
    const cwd = join(MEMORY_ROOT, "..")
    const raw = execSync(
      `git log --oneline -${limit} --format="%h||%ad||%s" --date=short`,
      { cwd, encoding: "utf8", timeout: 5000 }
    )
    return raw.trim().split("\n").filter(Boolean).map((line) => {
      const [hash = "", date = "", ...rest] = line.split("||")
      return { hash, date, message: rest.join("||") }
    })
  } catch {
    return []
  }
}

export interface DecisionEntry { title: string; date: string; relPath: string; summary: string }

export function extractDecisions(docs: DocMeta[]): DecisionEntry[] {
  return docs
    .filter((d) => d.category === "decisions")
    .map((d) => ({
      title: d.title,
      date: d.date ?? "",
      relPath: d.relPath,
      summary: d.excerpt,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface SessionLog { id: string; date: string; summary: string[]; filesChanged: number }

export async function getSessionLogs(): Promise<SessionLog[]> {
  const dir = join(MEMORY_ROOT, "logs", "sessions")
  const logs: SessionLog[] = []
  try {
    const entries = await readdir(dir)
    for (const name of entries) {
      if (!name.endsWith(".md") || name === "README.md") continue
      const raw = await readFile(join(dir, name), "utf8")
      const { data, content } = matter(raw)
      const id = typeof data.id === "string" ? data.id : name.replace(/\.md$/, "")
      const date = extractDate(data, name) ?? ""
      const filesChanged = typeof data.files_changed === "number" ? data.files_changed : 0
      const bullets: string[] = []
      const inSection = content.match(/## 한 일\n([\s\S]*?)(?=\n##|$)/)
      if (inSection) {
        for (const line of inSection[1].split("\n")) {
          const m = line.match(/^-\s+(.+)/)
          if (m) bullets.push(m[1].trim())
        }
      }
      logs.push({ id, date, summary: bullets.length > 0 ? bullets : ["(요약 없음)"], filesChanged })
    }
  } catch { /* no sessions dir */ }
  return logs.sort((a, b) => b.date.localeCompare(a.date))
}

export function pickSerendipity(docs: DocMeta[]): DocMeta | null {
  const pool = docs.filter((d) => ["insights", "rss", "url"].includes(d.category) && d.excerpt.length > 20)
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export async function getStats(docs: DocMeta[]): Promise<Stats> {
  const decisions = docs.filter((d) => d.category === "decisions").length
  const ingests = docs.filter((d) =>
    ["insights", "rss", "url"].includes(d.category)
  ).length

  let batchStatus: Stats["batchStatus"] = "unknown"
  let batchLastRun: string | null = null

  try {
    const logPath = join(MEMORY_ROOT, "logs", "automation-batch.log")
    const log = await readFile(logPath, "utf8")
    const lines = log.trim().split("\n")
    for (let i = lines.length - 1; i >= 0; i--) {
      const dateMatch = lines[i].match(/^\[(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\]/)
      if (dateMatch) {
        batchLastRun = dateMatch[1]
        break
      }
    }
    const lastChunk = lines.slice(-5).join("\n")
    batchStatus = lastChunk.includes("=0") || lastChunk.includes("DONE") ? "ok" : "error"
    if (lastChunk.match(/실패=([1-9])/)) batchStatus = "error"
  } catch {
    /* no log */
  }

  return {
    totalDocs: docs.length,
    decisions,
    ingests,
    batchStatus,
    batchLastRun,
  }
}
