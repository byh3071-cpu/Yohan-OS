import { readdir, readFile, stat } from "node:fs/promises"
import { join, resolve, dirname, relative } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const SCAN_DIRS = ["memory/rules", "docs", ".cursor/rules", ".cursorrules"]
const STALE_DAYS = 60

interface Issue {
  file: string
  type: "broken-link" | "stale" | "duplicate-id" | "missing-frontmatter"
  detail: string
}

const issues: Issue[] = []
const seenIds = new Map<string, string>()

async function collectMdFiles(dir: string): Promise<string[]> {
  const abs = join(ROOT, dir)
  let entries: string[]
  try {
    const s = await stat(abs)
    if (s.isFile()) return [abs]
    entries = await readdir(abs, { recursive: true }) as unknown as string[]
  } catch {
    return []
  }
  return entries
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdc"))
    .map((f) => join(abs, f))
}

function isTemplateOrGlob(s: string): boolean {
  return /[*{}]/.test(s) ||
    /YYYY|MM-DD|NNN|날짜|순번/.test(s) ||
    s.startsWith("npm ") ||
    s.startsWith("npx ") ||
    s.includes("example")
}

function cleanPath(raw: string): string {
  return raw.replace(/^\*{1,2}/, "").replace(/\*{1,2}$/, "").trim()
}

function extractMdLinks(content: string): string[] {
  const re = /(?:\[.*?\]\(([^)]+)\)|`([^`\n]+\.(?:md|yaml|yml|mdc))`)/g
  const links: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    const raw = m[1] ?? m[2]
    if (!raw || raw.startsWith("http://") || raw.startsWith("https://")) continue
    const cleaned = cleanPath(raw)
    if (!cleaned || isTemplateOrGlob(cleaned)) continue
    links.push(cleaned)
  }
  return links
}

function extractFrontmatterId(content: string): string | null {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) return null
  const idMatch = fmMatch[1].match(/^id:\s*(.+)$/m)
  return idMatch ? idMatch[1].trim() : null
}

async function checkFile(filePath: string) {
  const content = await readFile(filePath, "utf8")
  const rel = relative(ROOT, filePath)

  if (filePath.endsWith(".md") && !filePath.includes("ingest")) {
    if (!content.startsWith("---") && !content.startsWith("#")) {
      issues.push({ file: rel, type: "missing-frontmatter", detail: "YAML 프론트매터 또는 제목 없음" })
    }

    const id = extractFrontmatterId(content)
    if (id) {
      const prev = seenIds.get(id)
      if (prev) {
        issues.push({ file: rel, type: "duplicate-id", detail: `id "${id}" 중복 (첫 출현: ${prev})` })
      } else {
        seenIds.set(id, rel)
      }
    }
  }

  const SEARCH_DIRS = [
    dirname(filePath),
    ROOT,
    join(ROOT, "memory"),
    join(ROOT, "memory/rules"),
    join(ROOT, ".cursor/rules"),
    join(ROOT, "docs"),
  ]

  const ON_DEMAND = [
    "automation-dead-letter.md",
    "automation-review.md",
  ]

  const links = extractMdLinks(content)
  for (const link of links) {
    const clean = link.split("#")[0].split("?")[0]
    if (!clean) continue
    if (ON_DEMAND.some((f) => clean.endsWith(f))) continue

    let found = false
    for (const dir of SEARCH_DIRS) {
      try {
        await stat(join(dir, clean))
        found = true
        break
      } catch { /* next */ }
    }
    if (!found) {
      issues.push({ file: rel, type: "broken-link", detail: `"${clean}" → 파일 없음` })
    }
  }

  const fileStat = await stat(filePath)
  const daysSinceModified = (Date.now() - fileStat.mtimeMs) / (1000 * 60 * 60 * 24)
  if (daysSinceModified > STALE_DAYS && (rel.startsWith("memory/rules") || rel.startsWith("docs"))) {
    issues.push({
      file: rel,
      type: "stale",
      detail: `${Math.floor(daysSinceModified)}일 미수정 (임계: ${STALE_DAYS}일)`,
    })
  }
}

async function main() {
  const allFiles: string[] = []
  for (const dir of SCAN_DIRS) {
    allFiles.push(...(await collectMdFiles(dir)))
  }

  await Promise.all(allFiles.map(checkFile))

  if (issues.length === 0) {
    console.log("✅ 드리프트 없음 — 깨진 링크 0, 오래된 규칙 0, 중복 ID 0")
    return
  }

  const grouped = new Map<string, Issue[]>()
  for (const i of issues) {
    const list = grouped.get(i.type) ?? []
    list.push(i)
    grouped.set(i.type, list)
  }

  console.log(`\n⚠️  드리프트 점검 결과: ${issues.length}건\n`)
  for (const [type, list] of grouped) {
    console.log(`--- ${type} (${list.length}건) ---`)
    for (const i of list) {
      console.log(`  ${i.file}: ${i.detail}`)
    }
    console.log()
  }

  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
