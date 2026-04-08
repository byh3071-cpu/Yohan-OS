import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { getMemoryDir } from "../../src/paths.js"
import type { OcrPrepared, ScreenshotBlock } from "./types.js"

function makeInsightId(block: ScreenshotBlock): string {
  const date = block.receivedAt.slice(0, 10)
  return `telegram-ocr-${date}-${block.messageId}`
}

function makeInsightBody(block: ScreenshotBlock, prepared: OcrPrepared): string {
  return [
    `# 텔레그램 OCR ${block.messageId}`,
    "",
    "## 원문 메타",
    `- received_at: ${block.receivedAt}`,
    `- message_id: ${block.messageId}`,
    `- from_chat_id: ${block.chatId || "(unknown)"}`,
    "",
    "## 한 줄 요약",
    `- OCR 원문 ${prepared.classification} 분류 초안.`,
    `- 템플릿: ${prepared.templateKind}`,
    `- 태그 추론: ${prepared.inferredTags.length > 0 ? prepared.inferredTags.join(", ") : "(none)"}`,
    "",
    "## 교정본 (보수적)",
    `- ${prepared.cleanedBody || "(본문 없음)"}`,
    "",
    "## 리뷰 게이트",
    `- should_review: ${prepared.review.shouldReview}`,
    `- reasons: ${prepared.review.reasons.length > 0 ? prepared.review.reasons.join(", ") : "(none)"}`,
    "",
    "## 원문",
    `- ${block.body || "(본문 없음)"}`,
  ].join("\n")
}

export async function writeInsightDraft(
  block: ScreenshotBlock,
  prepared: OcrPrepared,
  dryRun: boolean,
): Promise<string> {
  const id = makeInsightId(block)
  const date = block.receivedAt.slice(0, 10)
  const file = join(getMemoryDir(), "ingest", "insights", `${id}.md`)
  if (existsSync(file)) {
    return file
  }
  const fm = [
    "---",
    `id: ${id}`,
    `date: ${date}`,
    "domain: ingest",
    "tags: [ocr, telegram, automation]",
    "related: []",
    "status: draft",
    "---",
    "",
  ].join("\n")
  if (!dryRun) {
    await mkdir(join(getMemoryDir(), "ingest", "insights"), { recursive: true })
    await writeFile(file, fm + makeInsightBody(block, prepared) + "\n", "utf8")
  }
  return file
}
