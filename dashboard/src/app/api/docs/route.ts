import { NextResponse } from "next/server"
import { listDocs, getStats, buildChartData, parseBatchHistory, pickSerendipity, getGitLog, extractDecisions, getSessionLogs } from "@/lib/memory"

export const dynamic = "force-dynamic"

export async function GET() {
  const docs = await listDocs()
  const stats = await getStats(docs)
  const batchHistory = await parseBatchHistory()
  const charts = buildChartData(docs, batchHistory)
  const serendipity = pickSerendipity(docs)
  const changelog = await getGitLog(30)
  const decisions = extractDecisions(docs)
  const sessions = await getSessionLogs()
  return NextResponse.json({ docs, stats, charts, serendipity, changelog, decisions, sessions })
}
