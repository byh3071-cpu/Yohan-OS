import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ingestUrl } from "../../src/ingest/url.js"
import { getMemoryDir, resolveRepoRoot } from "../../src/paths.js"

function ymdSeoul(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(date)
}

function githubCardIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    const parts = u.pathname.split("/").filter(Boolean)
    if (host.includes("gist.github.com")) {
      const owner = parts[0] ?? "gist"
      return `${owner}-gist-why-how`
    }
    if (parts.length >= 2) {
      return `${parts[1]}-github-why-how`
    }
    return null
  } catch {
    return null
  }
}

function extractTitleAndBody(ingestMd: string): { title: string; body: string } {
  const titleMatch = ingestMd.match(/\n#\s+(.+)\n/)
  const title = titleMatch?.[1]?.trim() || "GitHub 레포"
  const afterTitle = ingestMd.split(/\n#\s+.+\n/)[1] ?? ingestMd
  const body = afterTitle
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`/g, "")
    .replace(/\r/g, "")
    .trim()
  return { title, body }
}

function pickKeyBullets(body: string, max = 4): string[] {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 24 && !l.startsWith("**원문:**"))

  const scoreLine = (line: string): number => {
    let score = 0
    if (/problem|solution|setup|how to use|architecture|overview|install|deploy|api|workflow/gi.test(line)) score += 3
    if (/문제|해결|설치|구성|실행|흐름|요약|핵심|트레이드오프|제약/gi.test(line)) score += 3
    if (line.length >= 60 && line.length <= 220) score += 2
    return score
  }

  return lines
    .map((line) => ({ line, score: scoreLine(line) }))
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.line)
}

function makeOneLiner(title: string, bullets: string[]): string {
  if (bullets.length === 0) {
    return `${title} 관련 GitHub 레포이며 인제스트 기반 자동 초안입니다.`
  }
  const first = bullets[0].replace(/\.$/, "")
  return `${title}는 ${first.slice(0, 120)}`
}

async function upsertGithubWhyHow(url: string, ingestOutPath: string | null, dryRun: boolean): Promise<void> {
  const cardId = githubCardIdFromUrl(url)
  if (!cardId) return
  const outFile = join(getMemoryDir(), "ingest", "insights", `${cardId}.md`)
  if (existsSync(outFile)) return
  const date = ymdSeoul(new Date())
  const relIngest = ingestOutPath
    ? ingestOutPath.replace(resolveRepoRoot().replace(/\\/g, "/") + "/", "")
    : "(ingest path 없음)"
  let title = cardId.replace(/-github-why-how$|-gist-why-how$/g, "")
  let autoBullets: string[] = []
  let oneLiner = "자동 생성 초안. 인제스트를 보고 수동 보강 필요."
  if (ingestOutPath && existsSync(ingestOutPath)) {
    const ingestMd = await readFile(ingestOutPath, "utf8")
    const parsed = extractTitleAndBody(ingestMd)
    title = parsed.title || title
    autoBullets = pickKeyBullets(parsed.body, 4)
    oneLiner = makeOneLiner(title, autoBullets)
  }
  const content = [
    "---",
    `id: ${cardId}`,
    `date: ${date}`,
    "domain: tools-research",
    "tags: [github, automation]",
    "related: [knowledge-base-strategy]",
    "status: draft",
    "---",
    "",
    `# ${title} — 왜 쓰는지 · 어떻게 쓰는지`,
    "",
    "## 원본·긴 문서",
    "",
    `- **원본:** ${url}`,
    `- **인제스트:** \`${relIngest}\``,
    "",
    "## 한 줄로 하는 일",
    "",
    `- ${oneLiner}`,
    "",
    "## 왜 쓰는지",
    "",
    ...(autoBullets.length > 0 ? autoBullets.map((b) => `- ${b}`) : ["- 인제스트에서 핵심 문장을 자동 추출하지 못해 수동 보강 필요."]),
    "",
    "## 실무에서 어떻게 쓰이는지",
    "",
    "- 설치/실행/산출 흐름은 인제스트 원문을 기준으로 확인.",
    "- 채택 전 트레이드오프와 운영 제약을 1~2줄로 보강 권장.",
    "",
    "## 트레이드오프·전제",
    "",
    "- 자동 요약은 초안 단계이며 최종 채택 전 수동 검토가 필요.",
    "",
  ].join("\n")
  if (!dryRun) {
    await mkdir(join(getMemoryDir(), "ingest", "insights"), { recursive: true })
    await writeFile(outFile, content, "utf8")
  }
}

export async function ingestGithubAndUpsertCard(
  canonicalUrl: string,
  dryRun: boolean,
): Promise<{ error?: string }> {
  const ingestResult = await ingestUrl(canonicalUrl)
  if (ingestResult.error) {
    return { error: ingestResult.error }
  }
  await upsertGithubWhyHow(canonicalUrl, ingestResult.out_path, dryRun)
  return {}
}
