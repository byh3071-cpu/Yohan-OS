"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Search, Lightbulb, Rss, Link2, Scale, Wrench, FileText,
  Globe, ArrowUpFromLine, ArrowDownToLine, BarChart3, Play,
  Bot, RefreshCw, GitBranch, Sparkles,
  Library, GraduationCap, FolderKanban,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DocMeta } from "@/lib/types"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  docs: DocMeta[]
  onSelectDoc: (relPath: string) => void
  onQuickAction: (action: string) => void
}

const ACTIONS = [
  { label: "URL 인제스트", action: "ingest:url", icon: <Globe size={14} /> },
  { label: "RSS 전체 수집", action: "ingest:all", icon: <Rss size={14} /> },
  { label: "노션 푸시", action: "sync:notion:push", icon: <ArrowUpFromLine size={14} /> },
  { label: "노션 풀", action: "sync:notion:pull", icon: <ArrowDownToLine size={14} /> },
  { label: "주간 리포트", action: "report:weekly", icon: <BarChart3 size={14} /> },
  { label: "드리프트 점검", action: "check:drift", icon: <Search size={14} /> },
  { label: "메모리 검색", action: "search:memory", icon: <Search size={14} /> },
  { label: "배치 즉시 실행", action: "automation:batch", icon: <Play size={14} /> },
  { label: "봇 상태", action: "bot:status", icon: <Bot size={14} /> },
  { label: "MCP 빌드", action: "build", icon: <RefreshCw size={14} /> },
  { label: "Git 동기화", action: "git:sync", icon: <GitBranch size={14} /> },
]

const CAT_ICON: Record<string, React.ReactNode> = {
  insights: <Lightbulb size={14} />,
  rss: <Rss size={14} />,
  url: <Link2 size={14} />,
  wiki: <Library size={14} />,
  curriculum: <GraduationCap size={14} />,
  projects: <FolderKanban size={14} />,
  decisions: <Scale size={14} />,
  rules: <Wrench size={14} />,
  templates: <FileText size={14} />,
}

export function CommandPalette({ open, onOpenChange, docs, onSelectDoc, onQuickAction }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [aiResults, setAiResults] = useState<DocMeta[]>([])
  const [aiSearching, setAiSearching] = useState(false)
  const [aiMethod, setAiMethod] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setAiResults([])
      setAiMethod(null)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onOpenChange])

  const q = query.toLowerCase().trim()

  const filteredActions = useMemo(
    () => ACTIONS.filter((a) => !q || a.label.toLowerCase().includes(q)),
    [q]
  )

  const filteredDocs = useMemo(
    () =>
      docs
        .filter((d) => !q || d.title.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q)))
        .slice(0, 12),
    [docs, q]
  )

  const handleAiSearch = useCallback(async () => {
    if (!q || q.length < 2) return
    setAiSearching(true)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setAiResults(data.results ?? [])
      setAiMethod(data.method ?? "unknown")
    } catch {
      setAiResults([])
    } finally {
      setAiSearching(false)
    }
  }, [q])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && q.length >= 2 && filteredDocs.length === 0) {
      e.preventDefault()
      handleAiSearch()
    }
  }

  const hasKeywordResults = filteredActions.length > 0 || filteredDocs.length > 0
  const showAiHint = q.length >= 2 && filteredDocs.length === 0 && aiResults.length === 0 && !aiSearching

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden [&>button]:hidden">
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAiResults([]); setAiMethod(null) }}
            onKeyDown={handleKeyDown}
            placeholder="문서 검색, 명령 실행, 또는 자연어로 질문…"
            className="border-0 shadow-none focus-visible:ring-0 h-11 text-sm"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-[min(60vh,400px)]">
          {filteredActions.length > 0 && (
            <div className="p-1">
              <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">빠른 실행</p>
              {filteredActions.map((a) => (
                <button
                  key={a.action}
                  onClick={() => { onQuickAction(a.action); onOpenChange(false) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {filteredDocs.length > 0 && (
            <div className="p-1">
              <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">문서</p>
              {filteredDocs.map((d) => (
                <button
                  key={d.relPath}
                  onClick={() => { onSelectDoc(d.relPath); onOpenChange(false) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  {CAT_ICON[d.category] ?? <FileText size={14} />}
                  <span className="flex-1 text-left truncate">{d.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{d.date}</span>
                </button>
              ))}
            </div>
          )}

          {aiSearching && (
            <div className="p-4 flex items-center gap-2 justify-center">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">AI가 문서를 찾는 중…</span>
            </div>
          )}

          {aiResults.length > 0 && (
            <div className="p-1">
              <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium flex items-center gap-1">
                <Sparkles size={10} /> AI 검색 결과
              </p>
              {aiResults.map((d) => (
                <button
                  key={d.relPath}
                  onClick={() => { onSelectDoc(d.relPath); onOpenChange(false) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  {CAT_ICON[d.category] ?? <FileText size={14} />}
                  <span className="flex-1 text-left truncate">{d.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{d.date}</span>
                </button>
              ))}
            </div>
          )}

          {showAiHint && (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">키워드 결과 없음</p>
              <button
                type="button"
                onClick={handleAiSearch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles size={12} />
                AI로 "{q}" 검색
              </button>
            </div>
          )}

          {!hasKeywordResults && aiResults.length === 0 && !aiSearching && !showAiHint && q.length < 2 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              검색어를 입력하세요
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
