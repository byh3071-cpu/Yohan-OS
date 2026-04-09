import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const LOG_PATH = resolve(ROOT, "memory/logs/automation-batch.log")

interface DayStat {
  date: string
  runs: number
  scanned: number
  processed: number
  skipped: number
  review: number
  failed: number
}

async function main() {
  let log: string
  try {
    log = await readFile(LOG_PATH, "utf8")
  } catch {
    console.log("⚠️  로그 파일 없음:", LOG_PATH)
    return
  }

  const lines = log.split("\n")
  const dayMap = new Map<string, DayStat>()
  let currentDate = ""

  for (const line of lines) {
    const dateMatch = line.match(/^\[(\d{4}-\d{2}-\d{2})\s/)
    if (dateMatch) {
      currentDate = dateMatch[1]
    }

    const nums = line.match(/=(\d+)/g)
    if (!nums || nums.length < 5 || !currentDate) continue

    const vals = nums.map((n) => parseInt(n.slice(1), 10))

    const existing = dayMap.get(currentDate) ?? {
      date: currentDate,
      runs: 0,
      scanned: 0,
      processed: 0,
      skipped: 0,
      review: 0,
      failed: 0,
    }

    existing.runs += 1
    existing.scanned += vals[0]
    existing.processed += vals[1]
    existing.skipped += vals[2]
    existing.review += vals[3]
    existing.failed += vals[4]
    dayMap.set(currentDate, existing)
  }

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekStr = weekAgo.toISOString().slice(0, 10)

  const weekDays = [...dayMap.values()]
    .filter((d) => d.date >= weekStr)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (weekDays.length === 0) {
    console.log("⚠️  최근 7일 데이터 없음")
    return
  }

  const totals = weekDays.reduce(
    (acc, d) => ({
      runs: acc.runs + d.runs,
      scanned: acc.scanned + d.scanned,
      processed: acc.processed + d.processed,
      skipped: acc.skipped + d.skipped,
      review: acc.review + d.review,
      failed: acc.failed + d.failed,
    }),
    { runs: 0, scanned: 0, processed: 0, skipped: 0, review: 0, failed: 0 },
  )

  const successRate = totals.runs > 0
    ? ((1 - totals.failed / Math.max(totals.scanned, 1)) * 100).toFixed(1)
    : "N/A"

  console.log(`\n📊 주간 헬스리포트 (${weekStr} ~ ${now.toISOString().slice(0, 10)})`)
  console.log(`${"=".repeat(50)}`)
  console.log(`일수: ${weekDays.length}일 | 배치 실행: ${totals.runs}회`)
  console.log(`스캔: ${totals.scanned} | 처리: ${totals.processed} | 스킵: ${totals.skipped}`)
  console.log(`검토 대기: ${totals.review} | 실패: ${totals.failed}`)
  console.log(`배치 성공률: ${successRate}%`)
  console.log()

  console.log("일별 현황:")
  console.log("날짜        | 실행 | 스캔 | 처리 | 스킵 | 검토 | 실패")
  console.log("------------|------|------|------|------|------|------")
  for (const d of weekDays) {
    console.log(
      `${d.date} | ${String(d.runs).padStart(4)} | ${String(d.scanned).padStart(4)} | ${String(d.processed).padStart(4)} | ${String(d.skipped).padStart(4)} | ${String(d.review).padStart(4)} | ${String(d.failed).padStart(4)}`,
    )
  }

  if (totals.failed > 0) console.log("\n⚠️  실패 건 있음 → memory/inbox/automation-dead-letter.md 확인")
  if (totals.review > 3) console.log("\n⚠️  검토 대기 누적 → memory/inbox/automation-review.md 확인")
  console.log()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
