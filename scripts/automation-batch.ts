import { config } from "dotenv"
import { join } from "node:path"
import { appendFile, mkdir } from "node:fs/promises"
import { readTargetBlocks, extractHttpUrls, isGithubLikeUrl, normalizeTrackingParams } from "./automation/parse-telegram.js"
import { prepareOcr } from "./automation/quality.js"
import { findNearDuplicate, makeTextSignature } from "./automation/dedupe.js"
import { writeInsightDraft } from "./automation/insight.js"
import { pushToNotionWithRetry } from "./automation/notion.js"
import { ingestGithubAndUpsertCard } from "./automation/github.js"
import { notifyTelegram } from "./automation/notify.js"
import { appendQueueLine, deadLetterPath, loadState, reviewPath, saveState } from "./automation/state.js"
import type { AutomationState, CliOptions, ScreenshotBlock, Stats } from "./automation/types.js"
import { resolveRepoRoot } from "../src/paths.js"

config({ path: join(resolveRepoRoot(), ".env") })

function parseArgs(argv: string[]): CliOptions {
  const inboxArg = argv.find((a) => a.startsWith("--inbox-file="))
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    noNotify: argv.includes("--no-notify"),
    inboxFile: inboxArg ? inboxArg.replace("--inbox-file=", "").trim() : undefined,
  }
}

async function processOneBlock(
  block: ScreenshotBlock,
  opts: CliOptions,
  state: AutomationState,
  stats: Stats,
  issueDetails: string[],
): Promise<void> {
  stats.scanned += 1

  if (!opts.force && state.processedMessageIds[block.messageId]) {
    stats.skipped += 1
    return
  }

  const prepared = prepareOcr(block)
  const nearDup = findNearDuplicate(prepared.cleanedBody, state.recentTextSignatures ?? {})
  if (nearDup.duplicated && !opts.force) {
    stats.review += 1
    issueDetails.push(
      `review: msg_${block.messageId} (near_duplicate with msg_${nearDup.matchedId}, similarity=${(nearDup.similarity ?? 0).toFixed(2)})`,
    )
    if (!opts.dryRun) {
      await appendQueueLine(
        reviewPath,
        `- [${new Date().toISOString()}] message_id=${block.messageId} reason=near_duplicate matched_id=${nearDup.matchedId} similarity=${(nearDup.similarity ?? 0).toFixed(2)}`,
      )
    }
    return
  }
  if (prepared.review.shouldReview) {
    stats.review += 1
    issueDetails.push(
      `review: msg_${block.messageId} (${prepared.review.reasons.join(", ") || "unspecified"})`,
    )
    if (!opts.dryRun) {
      await appendQueueLine(
        reviewPath,
        `- [${new Date().toISOString()}] message_id=${block.messageId} reason=${prepared.review.reasons.join(",") || "unspecified"}`,
      )
    }
    return
  }

  try {
    await writeInsightDraft(block, prepared, opts.dryRun)
    await pushToNotionWithRetry(block, prepared, opts.dryRun)

    const urls = extractHttpUrls(block.body).filter(isGithubLikeUrl)
    for (const u of urls) {
      const canonical = normalizeTrackingParams(u)
      if (!opts.force && state.processedCanonicals[canonical]) {
        continue
      }
      const githubResult = await ingestGithubAndUpsertCard(canonical, opts.dryRun)
      if (githubResult.error) {
        issueDetails.push(`failed: msg_${block.messageId} (ingest_url: ${githubResult.error})`)
        continue
      }
      if (!opts.dryRun) {
        state.processedCanonicals[canonical] = new Date().toISOString()
      }
    }

    if (!opts.dryRun) {
      state.processedMessageIds[block.messageId] = new Date().toISOString()
      state.recentTextSignatures = state.recentTextSignatures ?? {}
      state.recentTextSignatures[block.messageId] = makeTextSignature(prepared.cleanedBody)
      const sigKeys = Object.keys(state.recentTextSignatures)
      if (sigKeys.length > 200) {
        const sorted = sigKeys.sort((a, b) => Number(a) - Number(b))
        const keep = new Set(sorted.slice(-200))
        state.recentTextSignatures = Object.fromEntries(
          Object.entries(state.recentTextSignatures).filter(([k]) => keep.has(k)),
        )
      }
    }
    stats.processed += 1
  } catch (e) {
    stats.failed += 1
    const msg = e instanceof Error ? e.message : String(e)
    issueDetails.push(`failed: msg_${block.messageId} (${msg})`)
    if (!opts.dryRun) {
      await appendQueueLine(
        deadLetterPath,
        `- [${new Date().toISOString()}] message_id=${block.messageId} error=${msg.replace(/\s+/g, " ").trim()}`,
      )
    }
  }
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2))
  const state = await loadState()
  const blocks = await readTargetBlocks(opts.inboxFile)
  const stats: Stats = { scanned: 0, processed: 0, skipped: 0, review: 0, failed: 0 }
  const issueDetails: string[] = []

  for (const block of blocks) {
    await processOneBlock(block, opts, state, stats, issueDetails)
  }

  if (!opts.dryRun) {
    await saveState(state)
  }

  const summary = `[Yohan OS][batch] 완료: 스캔=${stats.scanned} 처리=${stats.processed} 스킵=${stats.skipped} 검토=${stats.review} 실패=${stats.failed}`
  if (stats.review > 0 || stats.failed > 0) {
    await notifyTelegram([summary, ...issueDetails.slice(0, 20)], opts.noNotify)
  } else {
    await notifyTelegram([summary], opts.noNotify)
  }
  console.log(summary)
  if (issueDetails.length > 0) {
    for (const line of issueDetails) {
      console.log(line)
    }
  }

  if (!opts.dryRun && (stats.failed > 0 || stats.review > 0)) {
    const errDir = join(resolveRepoRoot(), "memory", "logs", "errors")
    await mkdir(errDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const lines = [`# Batch Error — ${ts}\n`, `${summary}\n`, ...issueDetails.map((l) => `- ${l}\n`)]
    await appendFile(join(errDir, `batch-${ts}.md`), lines.join("\n"), "utf8")
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
