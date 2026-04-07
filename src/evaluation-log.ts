import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { getMemoryDir } from "./paths.js";

export type EvaluationVerdict = "pass" | "revise" | "reject";

export type QualityScores = {
  searchability: boolean;
  self_contained: boolean;
  pattern_consistency: boolean;
  compression: boolean;
  connectivity: boolean;
};

export type EvaluationChecklist = {
  scope_exceeded: boolean;
  memory_structure_changed: boolean;
  secret_exposed: boolean;
  must_not_violated: boolean;
  frontmatter_valid: boolean;
  unverified_claims: boolean;
  content_lost: boolean;
  voice_aligned: boolean;
};

export type LogEvaluationParams = {
  verdict: EvaluationVerdict;
  task: string;
  files_changed: number;
  revise_count: number;
  quality_scores: QualityScores;
  checklist: EvaluationChecklist;
  /** 프론트매터 아래에 붙일 선택 본문(마크다운) */
  body?: string;
  /** 테스트용; 비우면 Asia/Seoul 기준 당일 */
  date?: string;
};

function seoulDateYmd(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

async function nextSequence(evalDir: string, dateStr: string): Promise<number> {
  const prefix = `eval-${dateStr}-`;
  let names: string[];
  try {
    names = await readdir(evalDir);
  } catch {
    return 1;
  }
  let max = 0;
  for (const f of names) {
    if (!f.endsWith(".md") || !f.startsWith(prefix)) continue;
    const num = parseInt(f.slice(prefix.length, -3), 10);
    if (!Number.isNaN(num) && num > max) max = num;
  }
  return max + 1;
}

/**
 * Evaluator 구조화 로그를 memory/metrics/evaluations/eval-{date}-{seq}.md 로 저장한다.
 */
export async function writeEvaluationLog(params: LogEvaluationParams): Promise<{
  id: string;
  path: string;
  date: string;
  seq: number;
}> {
  const root = getMemoryDir();
  const evalDir = join(root, "metrics", "evaluations");
  await mkdir(evalDir, { recursive: true });

  const dateStr = params.date?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.date : seoulDateYmd();
  const seq = await nextSequence(evalDir, dateStr);
  const seqPadded = String(seq).padStart(3, "0");
  const id = `eval-${dateStr}-${seqPadded}`;
  const fileName = `${id}.md`;
  const filePath = join(evalDir, fileName);

  const front: Record<string, unknown> = {
    id,
    date: dateStr,
    type: "evaluation",
    verdict: params.verdict,
    task: params.task,
    files_changed: params.files_changed,
    revise_count: params.revise_count,
    quality_scores: params.quality_scores,
    checklist: params.checklist,
  };

  const yamlBlock = stringifyYaml(front).trimEnd();
  let out = `---\n${yamlBlock}\n---\n`;
  if (params.body?.trim()) {
    out += `\n${params.body.trim()}\n`;
  }

  await writeFile(filePath, out, "utf8");

  return { id, path: filePath.replace(/\\/g, "/"), date: dateStr, seq };
}
