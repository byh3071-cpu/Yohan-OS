import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { getNotionQueuePath } from "./paths.js";

const PREVIEW_MAX = 4000;

export type NotionQueuePreview = {
  path: string;
  exists: boolean;
  preview: string | null;
  truncated: boolean;
};

/**
 * 노션 풀 결과를 쌓는 SoT 큐 파일 (`memory/inbox/notion-queue.md`) 미리보기.
 * SoT 병합 전에는 이 파일만 갱신한다 (`memory/rules/notion-sync.md`).
 */
export async function loadNotionQueuePreview(): Promise<NotionQueuePreview> {
  const path = getNotionQueuePath();
  if (!existsSync(path)) {
    return { path, exists: false, preview: null, truncated: false };
  }
  const raw = await readFile(path, "utf8");
  const truncated = raw.length > PREVIEW_MAX;
  const preview = truncated ? `${raw.slice(0, PREVIEW_MAX)}\n\n…(truncated)` : raw;
  return { path, exists: true, preview, truncated };
}
