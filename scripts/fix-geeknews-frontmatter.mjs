/**
 * GeekNews RSS *.md with broken pseudo-frontmatter → valid YAML frontmatter.
 * Dry-run without `--apply`.
 */
import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const DIR = resolve(process.cwd(), "memory", "ingest", "rss", "geeknews")
const APPLY = process.argv.includes("--apply")

const FRONT_KEYS = new Set([
  "schema_version",
  "kind",
  "source_name",
  "source_feed",
  "source_url",
  "title",
  "published",
  "guid",
  "ingested_at",
])

function looksBroken(raw) {
  const lines = raw.split(/\r?\n/)
  if (lines[0] !== "---") return false
  for (let i = 1; i < Math.min(lines.length, 5); i++) {
    if (/^##\s+schema_version:/.test(lines[i])) return true
  }
  return false
}

function repair(raw) {
  const lines = raw.split(/\r?\n/)
  const front = {}
  let i = 1
  for (; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === "") continue
    if (line.startsWith("# ") && !line.startsWith("## ")) break
    let cleaned = line
    if (cleaned.startsWith("## ")) cleaned = cleaned.slice(3)
    const m = cleaned.match(/^([a-z_][a-z0-9_]*):\s*(.*)$/i)
    if (!m) continue
    const key = m[1]
    let value = m[2].trim()
    if (!FRONT_KEYS.has(key)) continue
    value = value.replace(/^\[(.+?)\]\(.+?\)$/, "$1")
    front[key] = value
  }
  if (!front.schema_version) return null

  const orderedKeys = [
    "schema_version",
    "kind",
    "source_name",
    "source_feed",
    "source_url",
    "title",
    "published",
    "guid",
    "ingested_at",
  ]
  const yaml = orderedKeys
    .filter((k) => front[k] !== undefined)
    .map((k) => `${k}: ${front[k]}`)
    .join("\n")

  const body = lines.slice(i).join("\n").replace(/^\n+/, "")
  return `---\n${yaml}\n---\n\n${body}`
}

async function main() {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".md"))
  let fixed = 0
  let skipped = 0
  let failed = 0
  for (const f of files) {
    const p = join(DIR, f)
    const raw = await readFile(p, "utf8")
    if (!looksBroken(raw)) {
      skipped++
      continue
    }
    const next = repair(raw)
    if (!next) {
      failed++
      console.warn(`[fail] ${f}`)
      continue
    }
    if (APPLY) {
      await writeFile(p, next, "utf8")
      console.log(`[fix]  ${f}`)
    } else {
      console.log(`[dry]  ${f}`)
    }
    fixed++
  }
  console.log(`fixed=${fixed} skipped=${skipped} failed=${failed} apply=${APPLY}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
