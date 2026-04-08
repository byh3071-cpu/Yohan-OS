import { routeTask } from "./router/route-task.js"
import { executeRoute } from "./router/execute-route.js"

function parseFlags(argv: string[]): { dryRun: boolean; asJson: boolean; input: string } {
  const dryRun = argv.includes("--dry-run")
  const asJson = argv.includes("--json")
  const help = argv.includes("--help") || argv.includes("-h")
  const filtered = argv.filter((a) => a !== "--dry-run" && a !== "--json" && a !== "--help" && a !== "-h")
  return {
    dryRun,
    asJson,
    input: help ? "__HELP__" : filtered.join(" ").trim(),
  }
}

function routeTypeKo(routeType: string): string {
  const map: Record<string, string> = {
    "ocr": "OCR",
    "github-url": "GitHub URL",
    "general-note": "일반 메모",
    "review-task": "검토/재처리",
  }
  return map[routeType] ?? routeType
}

function printDecisionKo(decision: {
  route_type: string
  primary_action: string
  fallback_action: string
  requires_review: boolean
  reason: string
  secondary_actions?: string[]
}): void {
  console.log("=== 라우터 결정 ===")
  console.log(`- 분류: ${routeTypeKo(decision.route_type)} (${decision.route_type})`)
  console.log(`- 1차 실행: ${decision.primary_action}`)
  console.log(`- 실패 시: ${decision.fallback_action}`)
  console.log(`- 검토 필요: ${decision.requires_review}`)
  console.log(`- 판단 근거: ${decision.reason}`)
  if (decision.secondary_actions && decision.secondary_actions.length > 0) {
    console.log(`- 보조 실행: ${decision.secondary_actions.join(" | ")}`)
  }
}

function printResultsKo(results: Array<{ ok: boolean; command: string; exitCode: number }>): void {
  console.log("\n=== 실행 결과 ===")
  const allOk = results.every((r) => r.ok)
  console.log(`- 전체 성공: ${allOk}`)
  for (const r of results) {
    console.log(`- 성공: ${r.ok} | 코드: ${r.exitCode} | 명령: ${r.command}`)
  }
}

async function main(): Promise<void> {
  const { dryRun, asJson, input } = parseFlags(process.argv.slice(2))
  if (input === "__HELP__") {
    console.log([
      "사용법:",
      "  npm run route:run -- \"<입력 텍스트>\"",
      "  npm run route:dry -- \"<입력 텍스트>\"",
      "  npm run route:json -- \"<입력 텍스트>\"",
      "  npm run route:dry:json -- \"<입력 텍스트>\"",
      "",
      "설명:",
      "  route:run      판단 + 실제 실행 (한국어 출력)",
      "  route:dry      판단만, 실행 생략",
      "  route:json     판단 + 실제 실행 (JSON 출력)",
      "  route:dry:json 판단만, 실행 생략 (JSON 출력)",
    ].join("\n"))
    return
  }
  if (!input) {
    console.error("Usage: npm run route:run -- \"<input text>\" [--dry-run] [--json]")
    process.exit(1)
  }

  const decision = routeTask({ raw_text: input, source: "manual" })
  if (asJson) {
    console.log(JSON.stringify({ decision }, null, 2))
  } else {
    printDecisionKo(decision)
  }

  if (dryRun) {
    console.log(asJson ? "dry-run: execution skipped" : "\n[드라이런] 실제 실행은 생략했습니다.")
    return
  }

  const results = await executeRoute(decision)
  const ok = results.every((r) => r.ok)
  if (asJson) {
    console.log(JSON.stringify({ ok, results }, null, 2))
  } else {
    printResultsKo(results)
  }
  if (!ok) process.exit(1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
