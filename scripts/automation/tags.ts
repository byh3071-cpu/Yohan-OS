const TAG_RULES: Array<{ tag: string; patterns: RegExp[] }> = [
  {
    tag: "창업레이더",
    patterns: [
      /창업|오퍼|유료 고객|고객 획득|채널|실행 계획|사업|서비스|코치/gi,
      /\b(startup|offer|customer|channel|go[- ]to[- ]market)\b/gi,
    ],
  },
  {
    tag: "재무",
    patterns: [
      /수입|매출|비용|자본|돈|이익|현금흐름|예산|달러|원\b/gi,
      /\b(revenue|income|cost|capital|cashflow|budget|finance)\b/gi,
    ],
  },
  {
    tag: "생산성",
    patterns: [
      /루틴|습관|생산성|워크플로|정리|실행력|우선순위|시스템/gi,
      /\b(productivity|workflow|routine|habit|system)\b/gi,
    ],
  },
  {
    tag: "개발",
    patterns: [
      /코드|개발|sdk|api|github|repo|자동화|스크립트|노션/gi,
      /\b(code|dev|sdk|api|github|repo|automation|script)\b/gi,
    ],
  },
]

function scoreTag(text: string, patterns: RegExp[]): number {
  let score = 0
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    score += matches?.length ?? 0
  }
  return score
}

export function inferDomainTags(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const scored = TAG_RULES.map((r) => ({
    tag: r.tag,
    score: scoreTag(trimmed, r.patterns),
  }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.tag)

  return [...new Set(scored)]
}

export function mergeTags(base: string[], inferred: string[]): string[] {
  return [...new Set([...base, ...inferred])]
}
