"use client"

import { Home, BarChart3, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewTab = "home" | "charts" | "timeline" | "constellation"

const TABS: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "홈", icon: <Home size={14} /> },
  { id: "charts", label: "차트", icon: <BarChart3 size={14} /> },
  { id: "timeline", label: "타임라인", icon: <Clock size={14} /> },
  { id: "constellation", label: "별자리", icon: <Sparkles size={14} /> },
]

interface ViewTabsProps {
  active: ViewTab
  onChange: (tab: ViewTab) => void
}

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-0.5 px-4 border-b border-border bg-background/60">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
            active === t.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t.icon}
          {t.label}
          {active === t.id && (
            <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-foreground" />
          )}
        </button>
      ))}
    </div>
  )
}
