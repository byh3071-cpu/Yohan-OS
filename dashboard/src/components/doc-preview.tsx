"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { X, ExternalLink, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DocFull } from "@/lib/types"

interface DocPreviewProps {
  relPath: string | null
  onClose: () => void
}

export function DocPreview({ relPath, onClose }: DocPreviewProps) {
  const [doc, setDoc] = useState<DocFull | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!relPath) { setDoc(null); return }
    setLoading(true)
    fetch(`/api/docs/${relPath}`)
      .then((r) => r.json())
      .then((d) => setDoc(d))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [relPath])

  const handleCopy = async () => {
    if (!doc) return
    await navigator.clipboard.writeText(doc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!relPath) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>문서를 선택하면 여기에 미리보기가 표시됩니다</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">로딩 중…</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>문서를 찾을 수 없습니다</p>
      </div>
    )
  }

  const sourceUrl = typeof doc.frontmatter?.source_url === "string" ? doc.frontmatter.source_url : null

  return (
    <div className="flex-1 flex flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold truncate flex-1">{doc.title}</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </Button>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink size={14} />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X size={14} />
          </Button>
        </div>
      </div>

      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-border">
          {doc.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] font-medium h-5 px-2 py-0">
              {t}
            </Badge>
          ))}
          {doc.date && (
            <span className="text-[10px] text-muted-foreground ml-auto self-center">{doc.date}</span>
          )}
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <article className="prose prose-sm dark:prose-invert max-w-none px-5 py-4 prose-headings:scroll-mt-4 prose-pre:bg-muted prose-pre:text-muted-foreground prose-code:text-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.content}
          </ReactMarkdown>
        </article>
      </ScrollArea>
    </div>
  )
}
