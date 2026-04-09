"use client"

import { Sparkles, ArrowRight } from "lucide-react"
import type { SerendipityDoc } from "@/lib/types"

interface SerendipityCardProps {
  doc: SerendipityDoc | null
  onSelect: (relPath: string) => void
}

export function SerendipityCard({ doc, onSelect }: SerendipityCardProps) {
  if (!doc) return null

  return (
    <button
      type="button"
      onClick={() => onSelect(doc.relPath)}
      className="w-full text-left rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-4 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/20">
          <Sparkles size={14} className="text-primary" />
        </div>
        <span className="text-xs font-medium text-primary">오늘의 재발견</span>
        {doc.date && (
          <span className="text-[10px] text-muted-foreground ml-auto">{doc.date}</span>
        )}
      </div>
      <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1.5">
        {doc.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
        {doc.excerpt}
      </p>
      <div className="flex items-center gap-1 text-xs text-primary/70 group-hover:text-primary transition-colors">
        <span>읽어보기</span>
        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  )
}
