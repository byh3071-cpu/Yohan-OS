/**
 * Repo 통합 스모크: MCP 번들, 대시보드 의존성, Cursor MCP 설정, 로컬 스킬 목록.
 * 실행: npm run workspace:health (루트)
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const root = process.cwd()
/** @type {string[]} */
const ok = []
/** @type {string[]} */
const issues = []

/** @param {string} name */
function pass(name) {
  ok.push(name)
}

/** @param {string} name @param {string} detail */
function fail(name, detail) {
  issues.push(`${name}: ${detail}`)
}

if (!existsSync(join(root, "dist", "index.js"))) {
  fail("mcp-dist", "dist/index.js 없음 — npm run build")
} else {
  pass("mcp-dist")
}

try {
  await import(pathToFileURL(join(root, "dist", "index.js")).href)
  pass("mcp-import")
} catch (e) {
  fail("mcp-import", e instanceof Error ? e.message : String(e))
}

const dashNext = join(root, "dashboard", "node_modules", "next")
if (!existsSync(dashNext)) {
  fail("dashboard-deps", "dashboard/node_modules/next 없음 — cd dashboard && npm i")
} else {
  pass("dashboard-deps")
}

const mcpJson = join(root, ".cursor", "mcp.json")
try {
  const raw = readFileSync(mcpJson, "utf8")
  JSON.parse(raw)
  pass("cursor-mcp.json")
} catch (e) {
  fail("cursor-mcp.json", e instanceof Error ? e.message : String(e))
}

const skillsDir = join(root, ".cursor", "skills")
try {
  const names = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  pass(`cursor-skills (${names.length})`)
  for (const n of names) {
    const skillMd = join(skillsDir, n, "SKILL.md")
    if (!existsSync(skillMd)) {
      fail(`skill-${n}`, "SKILL.md 없음")
    }
  }
} catch (e) {
  fail("cursor-skills", e instanceof Error ? e.message : String(e))
}

const hooksDir = join(root, ".cursor", "hooks")
if (existsSync(join(hooksDir, "hooks.json"))) {
  pass("cursor-hooks.json")
} else if (existsSync(hooksDir)) {
  pass("cursor-hooks (dir only, no hooks.json)")
} else {
  pass("cursor-hooks (none)")
}

const summary = { ok, issues, exitCode: issues.length ? 1 : 0 }
console.log(JSON.stringify(summary, null, 2))
process.exit(summary.exitCode)
