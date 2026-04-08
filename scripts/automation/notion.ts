import { loadNotionOcrEnv } from "../../src/notion/notion-ocr-env.js"
import { pushOcrResourceAndSummary } from "../../src/notion/push-ocr.js"
import { mergeTags } from "./tags.js"
import type { OcrPrepared, ScreenshotBlock } from "./types.js"

const NOTION_RETRY_DELAYS_MS = [60_000, 300_000, 900_000]

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function buildGenericSummary(block: ScreenshotBlock, prepared: OcrPrepared): string {
  return [
    "## 카테고리",
    "자동화/OCR",
    "",
    "## 핵심 요약",
    "배치 자동 생성 요약 초안",
    "",
    "## 상세 내용",
    `- message_id: ${block.messageId}`,
    `- 분류: ${prepared.classification}`,
    "",
    "## 인풋",
    prepared.cleanedBody || "(본문 없음)",
    "",
    "## 아웃풋",
    "notion resource + conditional summary",
    "",
    "## 적용 사항",
    "자동화 파이프라인 v1.1.3",
  ].join("\n")
}

function buildPromptSetSummary(block: ScreenshotBlock, prepared: OcrPrepared): string {
  const lines = prepared.cleanedBody.split(/\r?\n/)
  const prompts = lines
    .filter((l) => /prompt\s*\d+/i.test(l))
    .map((l) => l.trim().replace(/^["']+/, ""))
  return [
    "## 카테고리",
    "자동화/OCR · prompt-set",
    "",
    "## 핵심 요약",
    "여러 개의 실행 프롬프트 묶음이 감지되어 prompt-set 템플릿으로 정리했다.",
    "",
    "## 상세 내용",
    `- message_id: ${block.messageId}`,
    `- 분류: ${prepared.classification}`,
    `- prompt_count: ${prepared.promptCount}`,
    "",
    "## 프롬프트 라벨",
    ...(prompts.length > 0 ? prompts.map((p) => `- ${p}`) : ["- (감지 라벨 없음)"]),
    "",
    "## 인풋",
    prepared.cleanedBody || "(본문 없음)",
    "",
    "## 아웃풋",
    "notion resource + conditional summary",
    "",
    "## 적용 사항",
    "자동화 파이프라인 v1.1.3",
  ].join("\n")
}

export async function pushToNotionWithRetry(
  block: ScreenshotBlock,
  prepared: OcrPrepared,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) return
  const env = loadNotionOcrEnv()
  const dateYmd = block.receivedAt.slice(0, 10)
  const summaryBody =
    prepared.templateKind === "prompt-set"
      ? buildPromptSetSummary(block, prepared)
      : buildGenericSummary(block, prepared)
  const resourceOnly = prepared.classification === "short"
  const autoTags = mergeTags(["ocr", "telegram", "automation"], prepared.inferredTags)

  let lastError: unknown = null
  for (let i = 0; i <= NOTION_RETRY_DELAYS_MS.length; i++) {
    try {
      await pushOcrResourceAndSummary(env, {
        date_ymd: dateYmd,
        resource_title: `[${dateYmd}] OCR 원본 텔레그램 msg ${block.messageId}`,
        ocr_raw_body: block.body,
        summary_title: resourceOnly ? undefined : `[${dateYmd}] OCR 정제 텔레그램 msg ${block.messageId}`,
        summary_body: resourceOnly ? undefined : summaryBody,
        tags: autoTags,
        source_select: "텔레그램 스크린샷",
        resource_only: resourceOnly,
      })
      return
    } catch (e) {
      lastError = e
      if (i >= NOTION_RETRY_DELAYS_MS.length) break
      await sleep(NOTION_RETRY_DELAYS_MS[i] ?? 0)
    }
  }
  throw lastError
}
