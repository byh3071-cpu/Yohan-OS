"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { StatCards } from "@/components/stat-cards"
import { DocCard } from "@/components/doc-card"
import { DocPreview } from "@/components/doc-preview"
import { CommandPalette } from "@/components/command-palette"
import { ViewTabs, type ViewTab } from "@/components/view-tabs"
import { SerendipityCard } from "@/components/serendipity-card"
// MiniCharts removed from home — charts live in chart tab only
import { BriefingCard } from "@/components/briefing-card"
import { FullCharts } from "@/components/full-charts"
import { TimelineView } from "@/components/timeline-view"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DocMeta, DocCategory, Stats, ChartData, SerendipityDoc, GitCommit, DecisionEntry, SessionLog } from "@/lib/types"

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocMeta[]>([])
  const [stats, setStats] = useState<Stats>({
    totalDocs: 0,
    decisions: 0,
    ingests: 0,
    batchStatus: "unknown",
    batchLastRun: null,
  })
  const [charts, setCharts] = useState<ChartData>({ ingestTrend: [], domainDist: [], categoryDist: [], sourceDist: [], batchHistory: [], activity: [], decisionHistory: [] })
  const [serendipity, setSerendipity] = useState<SerendipityDoc | null>(null)
  const [changelog, setChangelog] = useState<GitCommit[]>([])
  const [decisionEntries, setDecisionEntries] = useState<DecisionEntry[]>([])
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([])
  const [activeCategory, setActiveCategory] = useState<DocCategory | "all">("all")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ViewTab>("home")
  const [cmdOpen, setCmdOpen] = useState(false)
  const [statsCollapsed, setStatsCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => {
        setDocs(data.docs ?? [])
        setStats(data.stats ?? stats)
        setCharts(data.charts ?? { ingestTrend: [], domainDist: [], categoryDist: [], sourceDist: [], batchHistory: [], activity: [], decisionHistory: [] })
        setSerendipity(data.serendipity ?? null)
        setChangelog(data.changelog ?? [])
        setDecisionEntries(data.decisions ?? [])
        setSessionLogs(data.sessions ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: docs.length }
    for (const d of docs) {
      map[d.category] = (map[d.category] ?? 0) + 1
    }
    return map
  }, [docs])

  const filtered = useMemo(() => {
    if (activeCategory === "all") return docs
    return docs.filter((d) => d.category === activeCategory)
  }, [docs, activeCategory])

  const [actionResult, setActionResult] = useState<{ action: string; ok: boolean; message: string } | null>(null)
  const [actionRunning, setActionRunning] = useState<string | null>(null)

  const handleQuickAction = useCallback(async (action: string) => {
    if (action === "new:insight" || action === "new:decision") {
      setActionResult({ action, ok: true, message: "커맨드 팔레트에서 생성 가능 (v2 예정)" })
      return
    }
    if (action === "ocr:upload") {
      setActionResult({ action, ok: true, message: "OCR 업로드 기능 (v2 예정)" })
      return
    }
    if (action === "view:changelog" || action === "view:evaluator") {
      setActionResult({ action, ok: true, message: "뷰 기능 (v2 예정)" })
      return
    }

    setActionRunning(action)
    setActionResult(null)
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      setActionResult({
        action,
        ok: data.ok,
        message: data.ok
          ? `✅ ${action} 완료\n${(data.stdout ?? "").slice(0, 200)}`
          : `❌ ${action} 실패\n${data.error ?? ""}\n${(data.stderr ?? "").slice(0, 200)}`,
      })
    } catch (e) {
      setActionResult({ action, ok: false, message: "❌ 네트워크 오류" })
    } finally {
      setActionRunning(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-primary font-bold text-lg">Y</span>
          </div>
          <p className="text-sm text-muted-foreground">Yohan OS 로딩 중…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onOpenSearch={() => setCmdOpen(true)} />
      <StatCards
        stats={stats}
        collapsed={statsCollapsed || !!selectedDoc}
        onToggle={() => setStatsCollapsed((c) => !c)}
      />
      <ViewTabs active={activeView} onChange={setActiveView} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          counts={counts}
          onQuickAction={handleQuickAction}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {activeView === "home" && !selectedDoc && (
            <div className="shrink-0 px-3 pt-3 pb-2 border-b border-border">
              <SerendipityCard doc={serendipity} onSelect={(p) => { setSelectedDoc(p) }} />
            </div>
          )}
          {activeView === "home" && (
            <BriefingCard />
          )}

          {activeView === "charts" && (
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                <FullCharts data={charts} />
              </div>
            </ScrollArea>
          )}

          {activeView === "timeline" && (
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                <TimelineView
                  changelog={changelog}
                  decisions={decisionEntries}
                  sessions={sessionLogs}
                  onSelectDoc={(p) => { setSelectedDoc(p); setActiveView("home") }}
                />
              </div>
            </ScrollArea>
          )}

          {activeView === "home" && (
            <div className="flex-1 flex overflow-hidden min-h-0">
              <ScrollArea className="w-80 shrink-0 border-r border-border min-h-0">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {activeCategory === "all" ? "전체" : activeCategory} · {filtered.length}건
                    </p>
                  </div>
                  {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">문서가 없습니다</p>
                  ) : (
                    filtered.map((d) => (
                      <DocCard
                        key={d.relPath}
                        doc={d}
                        isActive={selectedDoc === d.relPath}
                        onClick={() => setSelectedDoc(d.relPath)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
              <DocPreview relPath={selectedDoc} onClose={() => setSelectedDoc(null)} />
            </div>
          )}
        </div>
      </div>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        docs={docs}
        onSelectDoc={(p) => setSelectedDoc(p)}
        onQuickAction={handleQuickAction}
      />

      {actionRunning && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-3 shadow-lg z-50 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{actionRunning} 실행 중…</span>
        </div>
      )}

      {actionResult && !actionRunning && (
        <button
          onClick={() => setActionResult(null)}
          className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-4 py-3 shadow-lg z-50 max-w-sm text-left cursor-pointer hover:bg-accent transition-colors"
        >
          <pre className="text-xs whitespace-pre-wrap">{actionResult.message}</pre>
          <p className="text-[10px] text-muted-foreground mt-1">클릭하면 닫힘</p>
        </button>
      )}
    </div>
  )
}
