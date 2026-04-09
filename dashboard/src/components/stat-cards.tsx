"use client"

import { FileText, Scale, ArrowDownToLine, Activity, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stats } from "@/lib/types"

interface StatCardsProps {
  stats: Stats
  collapsed?: boolean
  onToggle?: () => void
}

export function StatCards({ stats, collapsed = false, onToggle }: StatCardsProps) {
  const cards = [
    {
      label: "문서",
      value: `${stats.totalDocs}건`,
      icon: <FileText size={18} />,
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    {
      label: "결정",
      value: `${stats.decisions}건`,
      icon: <Scale size={18} />,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      label: "인제스트",
      value: `${stats.ingests}건`,
      icon: <ArrowDownToLine size={18} />,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      label: "배치",
      value: stats.batchStatus === "ok" ? "정상" : stats.batchStatus === "error" ? "오류" : "?",
      icon: <Activity size={18} />,
      color: stats.batchStatus === "ok" ? "text-green-400" : "text-red-400",
      bg: stats.batchStatus === "ok" ? "bg-green-400/10" : "bg-red-400/10",
      sub: stats.batchLastRun ? `마지막: ${stats.batchLastRun}` : null,
    },
  ]

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 flex items-center gap-4 px-4 py-1.5 border-b border-border bg-background/60 hover:bg-accent/30 transition-colors text-xs text-muted-foreground"
      >
        {cards.map((c) => (
          <span key={c.label} className="flex items-center gap-1">
            <span className={cn("shrink-0", c.color)}>{c.icon}</span>
            <span className="font-medium text-foreground">{c.value}</span>
          </span>
        ))}
        <ChevronDown size={12} className="ml-auto" />
      </button>
    )
  }

  return (
    <div className="shrink-0 border-b border-border">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-3 rounded-lg border border-border px-4 py-3 ${c.bg}`}
          >
            <div className={c.color}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-sm font-semibold truncate">{c.value}</p>
              {c.sub && <p className="text-[10px] text-muted-foreground truncate">{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
        >
          <ChevronUp size={14} />
          <span>접기</span>
        </button>
      )}
    </div>
  )
}
