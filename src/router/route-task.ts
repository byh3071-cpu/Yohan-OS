export type RouteType = "ocr" | "github-url" | "general-note" | "review-task"

export type RouteDecision = {
  route_type: RouteType
  primary_action: string
  fallback_action: string
  requires_review: boolean
  reason: string
  secondary_actions?: string[]
}

export type RouteInput = {
  raw_text?: string
  message_type?: "screenshot" | "text"
  source?: "telegram" | "manual" | "queue"
  is_replay?: boolean
}

function extractHttpUrls(text: string): string[] {
  const re = /\bhttps?:\/\/[^\s<>"{}|\\^`[\]]+/gi
  const found = text.match(re) ?? []
  return [...new Set(found.map((u) => u.replace(/[),.]+$/g, "")))]
}

function hasGithubUrl(text: string): boolean {
  const urls = extractHttpUrls(text)
  return urls.some((u) => {
    try {
      const host = new URL(u).hostname.toLowerCase()
      return host === "github.com" || host === "www.github.com" || host === "gist.github.com" || host === "www.gist.github.com"
    } catch {
      return false
    }
  })
}

function isScreenshotLike(input: RouteInput): boolean {
  if (input.message_type === "screenshot") return true
  const raw = input.raw_text ?? ""
  return /type:\s*screenshot/i.test(raw)
}

function isReplayLike(input: RouteInput): boolean {
  if (input.is_replay) return true
  const raw = (input.raw_text ?? "").toLowerCase()
  return raw.includes("automation-review.md") || raw.includes("automation-dead-letter.md") || raw.includes("replay:")
}

export function routeTask(input: RouteInput): RouteDecision {
  const raw = (input.raw_text ?? "").trim()
  const github = hasGithubUrl(raw)
  const screenshot = isScreenshotLike(input)
  const replay = isReplayLike(input)

  if (replay) {
    return {
      route_type: "review-task",
      primary_action: "automation:batch --force",
      fallback_action: "manual review handling",
      requires_review: true,
      reason: "재처리 요청 또는 review/dead-letter 맥락이 감지됨",
    }
  }

  if (screenshot && github) {
    return {
      route_type: "ocr",
      primary_action: "automation:batch (ocr->insight/notion)",
      fallback_action: "append to automation-review.md",
      requires_review: false,
      reason: "스크린샷 OCR + GitHub URL 동시 감지",
      secondary_actions: ["ingest_url + github why-how upsert"],
    }
  }

  if (screenshot) {
    return {
      route_type: "ocr",
      primary_action: "automation:batch (ocr->insight/notion)",
      fallback_action: "append to automation-review.md",
      requires_review: false,
      reason: "스크린샷 OCR 입력 감지",
    }
  }

  if (github) {
    return {
      route_type: "github-url",
      primary_action: "ingest_url + github why-how upsert",
      fallback_action: "append to automation-review.md",
      requires_review: false,
      reason: "GitHub/Gist URL 텍스트 입력 감지",
    }
  }

  if (raw.length > 0) {
    return {
      route_type: "general-note",
      primary_action: "append to telegram inbox queue",
      fallback_action: "append to automation-review.md",
      requires_review: false,
      reason: "URL 없는 일반 텍스트 입력",
    }
  }

  return {
    route_type: "review-task",
    primary_action: "append to automation-review.md",
    fallback_action: "manual classification",
    requires_review: true,
    reason: "입력 타입을 확정할 수 없어 review fallback 적용",
  }
}
