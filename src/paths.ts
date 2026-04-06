import { join } from "node:path";

/** 레포 루트. `YOHAN_OS_ROOT` 없으면 `cwd`. */
export function resolveRepoRoot(): string {
  const env = process.env.YOHAN_OS_ROOT?.trim();
  if (env) return env;
  return process.cwd();
}

export function getMemoryDir(): string {
  return join(resolveRepoRoot(), "memory");
}

/** 노션 풀 → SoT 병합 전 큐 디렉터리 (`memory/inbox/`). */
export function getInboxDir(): string {
  return join(getMemoryDir(), "inbox");
}

/**
 * 노션에서 가져온 제안을 쌓는 단일 큐 파일.
 * `NOTION_QUEUE_FILE`이 있으면 그 절대 경로를 사용 (고급/테스트용).
 */
export function getNotionQueuePath(): string {
  const override = process.env.NOTION_QUEUE_FILE?.trim();
  if (override) return override;
  return join(getInboxDir(), "notion-queue.md");
}
