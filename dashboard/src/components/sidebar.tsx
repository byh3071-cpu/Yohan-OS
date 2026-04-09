"use client"

import { useState } from "react"
import {
  Lightbulb, Rss, Link2, BookCheck, Scale, FileText,
  Zap, Globe, RefreshCw, BarChart3, Search, PlusCircle,
  Bot, Play, Wrench, ArrowDownToLine, ArrowUpFromLine, GitBranch,
  Upload, History, ClipboardCheck, FilePlus,
  ChevronsLeft, ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { DocCategory } from "@/lib/types"

const CATEGORIES: { id: DocCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "전체", icon: <BookCheck size={16} /> },
  { id: "insights", label: "인사이트", icon: <Lightbulb size={16} /> },
  { id: "rss", label: "RSS", icon: <Rss size={16} /> },
  { id: "url", label: "URL", icon: <Link2 size={16} /> },
  { id: "decisions", label: "결정로그", icon: <Scale size={16} /> },
  { id: "rules", label: "규칙", icon: <Wrench size={16} /> },
  { id: "templates", label: "템플릿", icon: <FileText size={16} /> },
]

interface QuickAction {
  label: string
  icon: React.ReactNode
  action: string
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "URL 인제스트", icon: <Globe size={16} />, action: "ingest:url" },
  { label: "RSS 수집", icon: <Rss size={16} />, action: "ingest:all" },
  { label: "노션 푸시", icon: <ArrowUpFromLine size={16} />, action: "sync:notion:push" },
  { label: "노션 풀", icon: <ArrowDownToLine size={16} />, action: "sync:notion:pull" },
  { label: "주간 리포트", icon: <BarChart3 size={16} />, action: "report:weekly" },
  { label: "드리프트 점검", icon: <Search size={16} />, action: "check:drift" },
  { label: "메모리 검색", icon: <Search size={16} />, action: "search:memory" },
  { label: "새 결정", icon: <PlusCircle size={16} />, action: "new:decision" },
  { label: "봇 상태", icon: <Bot size={16} />, action: "bot:status" },
  { label: "배치 실행", icon: <Play size={16} />, action: "automation:batch" },
  { label: "MCP 빌드", icon: <RefreshCw size={16} />, action: "build" },
  { label: "Git 동기화", icon: <GitBranch size={16} />, action: "git:sync" },
  { label: "새 인사이트", icon: <FilePlus size={16} />, action: "new:insight" },
  { label: "OCR 업로드", icon: <Upload size={16} />, action: "ocr:upload" },
  { label: "체인지로그", icon: <History size={16} />, action: "view:changelog" },
  { label: "평가 로그", icon: <ClipboardCheck size={16} />, action: "view:evaluator" },
]

interface SidebarProps {
  activeCategory: DocCategory | "all"
  onCategoryChange: (cat: DocCategory | "all") => void
  counts: Record<string, number>
  onQuickAction: (action: string) => void
}

export function Sidebar({ activeCategory, onCategoryChange, counts, onQuickAction }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-sidebar flex flex-col h-full transition-[width] duration-200",
        collapsed ? "w-[3.25rem]" : "w-72"
      )}
    >
      <div className={cn("flex items-center border-b border-border/60 px-1 py-1", collapsed ? "justify-center" : "justify-end")}>
        <button
          type="button"
          className="size-9 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className={cn("p-2", collapsed && "flex flex-col items-center px-0 py-1")}>
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2">카테고리</p>
          )}
          <nav className={cn("space-y-0.5", collapsed && "flex flex-col items-center gap-0.5")}>
            {CATEGORIES.map((c) => {
              const count = c.id === "all" ? counts.all ?? 0 : counts[c.id] ?? 0
              const active = activeCategory === c.id
              const baseStyle = active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-accent/50 hover:text-accent-foreground"

              if (collapsed) {
                const cellClass = cn(
                  "size-9 flex items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  baseStyle
                )
                return (
                  <Tooltip key={c.id}>
                    <TooltipTrigger
                      delay={0}
                      render={(props) => (
                        <button
                          type="button"
                          {...props}
                          className={cn(props.className, cellClass)}
                          onClick={(e) => { props.onClick?.(e); onCategoryChange(c.id) }}
                        >
                          {c.icon}
                        </button>
                      )}
                    />
                    <TooltipContent side="right" sideOffset={6}>
                      {c.label} · {count}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryChange(c.id)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md text-sm px-2 py-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    baseStyle
                  )}
                >
                  {c.icon}
                  <span className="flex-1 text-left min-w-0">{c.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{count}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <Separator className="my-2" />

        <div className={cn("p-2 pb-4", collapsed && "flex flex-col items-center px-0 py-1 pb-4")}>
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1">
              <Zap size={14} /> 빠른 실행
            </p>
          )}
          <div className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
            {QUICK_ACTIONS.map((a) => {
              if (collapsed) {
                const cellClass = "size-9 flex items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                return (
                  <Tooltip key={a.action}>
                    <TooltipTrigger
                      delay={0}
                      render={(props) => (
                        <button
                          type="button"
                          {...props}
                          className={cn(props.className, cellClass)}
                          onClick={(e) => { props.onClick?.(e); onQuickAction(a.action) }}
                        >
                          {a.icon}
                        </button>
                      )}
                    />
                    <TooltipContent side="right" sideOffset={6}>
                      {a.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <button
                  key={a.action}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs text-sidebar-foreground/70 transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => onQuickAction(a.action)}
                >
                  <span className="shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0">{a.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{a.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
