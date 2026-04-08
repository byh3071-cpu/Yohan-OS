export type CliOptions = {
  dryRun: boolean
  force: boolean
  noNotify: boolean
  inboxFile?: string
}

export type ScreenshotBlock = {
  receivedAt: string
  messageId: string
  chatId: string
  body: string
}

export type SummaryTemplateKind = "generic" | "prompt-set"

export type OcrPrepared = {
  cleanedBody: string
  promptCount: number
  templateKind: SummaryTemplateKind
  classification: "short" | "long"
  inferredTags: string[]
  review: {
    shouldReview: boolean
    reasons: string[]
  }
}

export type AutomationState = {
  processedMessageIds: Record<string, string>
  processedCanonicals: Record<string, string>
  recentTextSignatures?: Record<string, string>
}

export type Stats = {
  scanned: number
  processed: number
  skipped: number
  review: number
  failed: number
}
