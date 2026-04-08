import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { getMemoryDir } from "../../src/paths.js"
import type { AutomationState } from "./types.js"

export const statePath = join(getMemoryDir(), "metrics", "automation", "state.json")
export const reviewPath = join(getMemoryDir(), "inbox", "automation-review.md")
export const deadLetterPath = join(getMemoryDir(), "inbox", "automation-dead-letter.md")

export async function loadState(): Promise<AutomationState> {
  if (!existsSync(statePath)) {
    return { processedMessageIds: {}, processedCanonicals: {}, recentTextSignatures: {} }
  }
  try {
    const raw = await readFile(statePath, "utf8")
    const parsed = JSON.parse(raw) as AutomationState
    return {
      processedMessageIds: parsed.processedMessageIds ?? {},
      processedCanonicals: parsed.processedCanonicals ?? {},
      recentTextSignatures: parsed.recentTextSignatures ?? {},
    }
  } catch {
    return { processedMessageIds: {}, processedCanonicals: {}, recentTextSignatures: {} }
  }
}

export async function saveState(state: AutomationState): Promise<void> {
  await mkdir(join(getMemoryDir(), "metrics", "automation"), { recursive: true })
  await writeFile(statePath, JSON.stringify(state, null, 2), "utf8")
}

export async function appendQueueLine(path: string, line: string): Promise<void> {
  await mkdir(join(getMemoryDir(), "inbox"), { recursive: true })
  const prefix = existsSync(path)
    ? ""
    : "---\nid: automation-queue\ndate: 2026-04-08\ndomain: operations\ntags: [automation, queue]\nrelated: []\nstatus: draft\n---\n\n# Automation Queue\n\n"
  const current = existsSync(path) ? await readFile(path, "utf8") : ""
  await writeFile(path, `${current}${prefix}${line}\n`, "utf8")
}
