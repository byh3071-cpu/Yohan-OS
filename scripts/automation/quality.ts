import { classifyBody } from "./parse-telegram.js"
import { inferDomainTags } from "./tags.js"
import type { OcrPrepared, ScreenshotBlock, SummaryTemplateKind } from "./types.js"

function conservativeNormalizeOcr(raw: string): string {
  let out = raw
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[«»]/g, "\"")
    .replace(/\uFFFD/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  // v1.1.1 안전 치환: 의미 왜곡 위험이 낮고 반복 출현하는 OCR 노이즈만 보정
  const safeReplacements: Array<[RegExp, string]> = [
    [/수입\s+SEE/gi, "수입"],
    [/\bSEE\b/g, "수입"],
    [/\b1000(?:[2\]]|\b)\s*\]/g, "1000달러"],
    [/\b1000[2\]]\b/g, "1000달러"],
    [/수입\s+수입/gi, "수입"],
    [/(at|a\s*t)\s*[\r\n\s]*혀\s*있는/gi, "막혀 있는"],
    [/\bat\s*혀\s*있는\b/g, "막혀 있는"],
    [/\bat혀\s*있는\b/g, "막혀 있는"],
    [/""\s*Prompt/gi, "\"Prompt"],
    [/호\s*Prompt/gi, "\"Prompt"],
    [/«"\s*Prompt/gi, "\"Prompt"],
    [/"Prompt\s*(\d+)/gi, "Prompt $1"],
    [/\bPrompt\s+(\d)\b/gi, "Prompt $1"],
    [/(\d)\s*\n\s*가\?/g, "$1가?"],
    [/누구인\s*\n\s*가\?/g, "누구인가?"],
    [/효과\s*\n\s*를/g, "효과를"],
    [/([가-힣])\s*\n\s*([가-힣])(?=\?|\.|,|!|")/g, "$1$2"],
    [/(^|\n)\s*"?\s*7\s+(사람이 된 것처럼 행동해줘\.)/g, "$1\"$2"],
    [/\.\s*"/g, ".\""],
  ]

  for (const [pattern, replacement] of safeReplacements) {
    out = out.replace(pattern, replacement)
  }

  return out
}

function countPromptBlocks(text: string): number {
  const matches = text.match(/(?:^|\n)\s*["']?\s*prompt\s*\d+\s*$/gim)
  return matches?.length ?? 0
}

function detectTemplateKind(promptCount: number): SummaryTemplateKind {
  return promptCount >= 2 ? "prompt-set" : "generic"
}

function weirdCharRatio(text: string): number {
  if (!text) return 1
  const weird = (text.match(/[^\p{L}\p{N}\p{P}\p{Z}\n]/gu) ?? []).length
  return weird / Math.max(text.length, 1)
}

function lineAndCharStats(text: string): { nonEmptyLines: number; chars: number } {
  const nonEmptyLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean).length
  return { nonEmptyLines, chars: text.trim().length }
}

function evaluateReviewBalanced(cleaned: string): { shouldReview: boolean; reasons: string[] } {
  const reasons: string[] = []
  const { nonEmptyLines, chars } = lineAndCharStats(cleaned)
  const words = (cleaned.match(/[\p{L}\p{N}]{2,}/gu) ?? []).length
  const weirdRatio = weirdCharRatio(cleaned)

  const lowConfidence =
    chars < 20 ||
    weirdRatio > 0.08 ||
    /[a-zA-Z]{1,2}\s+[가-힣]{1,2}\s+[a-zA-Z]{1,2}/.test(cleaned)
  const missingKeyContent = words < 5
  const ambiguousClassification =
    (nonEmptyLines === 3 && chars >= 150 && chars <= 230) ||
    (nonEmptyLines === 4 && chars >= 120 && chars <= 180)

  if (lowConfidence) reasons.push("low_ocr_confidence")
  if (missingKeyContent) reasons.push("missing_key_content")
  if (ambiguousClassification) reasons.push("ambiguous_classification")

  const shouldReview = lowConfidence || (missingKeyContent && ambiguousClassification)
  return { shouldReview, reasons }
}

export function prepareOcr(block: ScreenshotBlock): OcrPrepared {
  const cleanedBody = conservativeNormalizeOcr(block.body)
  const promptCount = countPromptBlocks(cleanedBody)
  const templateKind = detectTemplateKind(promptCount)
  const classification = classifyBody(cleanedBody)
  const inferredTags = inferDomainTags(cleanedBody)
  const review = evaluateReviewBalanced(cleanedBody)
  return { cleanedBody, promptCount, templateKind, classification, inferredTags, review }
}
