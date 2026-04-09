"use client"

import { Home, BarChart3, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewTab = "home" | "charts" | "timeline"

const TABS: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "홈", icon: <Home size={14} /> },
  { id: "charts", label: "차트", icon: <BarChart3 size={14} /> },
  { id: "timeline", label: "타임라인", icon: <Clock size={14} /> },
]

interface ViewTabsProps {
  active: ViewTab
  onChange: (tab: ViewTab) => void
}

export function ViewTabs({ active, onChange }: ViewTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border bg-background/60">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            active === t.id
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}
