/**
 * 대시보드 백로그 티켓(DB-*)을 GitHub Issues로 일괄 생성한다.
 *
 * 사전 조건: gh CLI 설치 + `gh auth login` + 저장소에 이슈 생성 권한
 *
 *   npm run issues:dashboard:dry   # 명령만 출력
 *   npm run issues:dashboard       # 실제 생성
 */
import { spawnSync } from "node:child_process"

const REPO = "byh3071-cpu/Yohan-OS"
const LABEL = "dashboard-roadmap"

const SPEC_BASE =
  "스펙: https://github.com/byh3071-cpu/Yohan-OS/blob/main/docs/DASHBOARD-SPEC.md · 백로그: https://github.com/byh3071-cpu/Yohan-OS/blob/main/docs/DASHBOARD-TICKET-BACKLOG.md"

const tickets = [
  {
    id: "DB-101",
    title: "별자리 D-2 — 시점 필터 데이터층 (filterConstellationAtDate 고도화·성능)",
    body: `## 목표
시점 변경 시 노드·엣지 필터를 서버/클라에서 일관되게 적용하고, 슬라이더 조작 시 불필요한 재계산을 줄인다.

## 수용 기준
- 선택한 as-of 날짜 기준 노드 포함 규칙이 코드 주석 또는 스펙 한 줄로 문서화됨
- 문서 수 증가 시 슬라이더 드래그 프레임 드랍이 있으면 useMemo/데이터 단 컷 적용

## 파일 힌트
- dashboard/src/lib/constellation.ts
- dashboard/src/app/api/constellation/route.ts

## 스펙
§10.1 D-2

${SPEC_BASE}`,
  },
  {
    id: "DB-102",
    title: "별자리 D-2 — 날짜 슬라이더 UI·성장/페이드 UX·미리보기 연동",
    body: `## 목표
날짜 슬라이더로 표시 변화(성장 느낌) + DocPreview 클릭 연동 유지.

## 수용 기준
- 슬라이더 값과 씬 상태가 레이블(날짜)로 이해 가능
- D-1 카테고리 필터·DocPreview 연동 유지

## 파일 힌트
- dashboard/src/components/constellation-view.tsx
- dashboard/src/app/page.tsx

## 의존
- DB-101

## 스펙
§10.1 D-2

${SPEC_BASE}`,
  },
  {
    id: "DB-201",
    title: "§10.11 — 초안 생성 API (POST /api/sot-draft/generate)",
    body: `## 목표
브리핑과 동일한 OPENAI_API_KEY 패턴으로 주제·맥락 → 마크다운 초안 JSON.

## 수용 기준
- 요청 JSON 필드명 고정 및 문서화
- 키 없을 때 동작 정책 일관(스텁 또는 503)

## 파일 힌트
- dashboard/src/app/api/briefing/route.ts 패턴 재사용

## 스펙
§10.11

${SPEC_BASE}`,
  },
  {
    id: "DB-202",
    title: "§10.11 — 대시보드 UI: 초안 검토·수정 → 확정 저장",
    body: `## 목표
확정 시 기존 POST /api/sot-draft 호출로 memory/ 저장.

## 수용 기준
- 저장 후 목록 갱신(fresh 또는 캐시 무효화)
- 실패 시 사용자에게 에러 표시

## 의존
- DB-201, 기존 /api/sot-draft

## 스펙
§10.11

${SPEC_BASE}`,
  },
  {
    id: "DB-203",
    title: "§10.11 — 저장 템플릿·프론트매터 검증",
    body: `## 목표
인사이트/결정/계획 등 종류별 YAML 최소 필드 정합.

## 수용 기준
- memory/ 기존 샘플 2건 이상과 형식 충돌 없음

## 의존
- DB-202

## 스펙
§10.11

${SPEC_BASE}`,
  },
  {
    id: "DB-110",
    title: "별자리 D-3 — 허브 중력 토글·국소 끌림",
    body: `## 목표
토글 ON 시 허브 주변만 완만한 인력, 성능 저하 시 OFF 가능.

## 수용 기준
- 기본 OFF

## 의존
- DB-102

## 스펙
§10.1 D-3

${SPEC_BASE}`,
  },
  {
    id: "DB-120",
    title: "별자리 D-4 — 스파이크: 포그/인스턴싱 FPS → 도입 범위",
    body: `## 목표
측정 후 스펙 또는 DB-120-SPIKE 메모에 결정 5줄 이상 기록.

## 의존
- DB-110

## 스펙
§10.1 D-4

${SPEC_BASE}`,
  },
  {
    id: "DB-301",
    title: "§10.3 주의 히트맵 — 도메인 레이어·잔디 시각",
    body: `## 목표
domains/태그 기준 색 레이어 + GitHub 잔디 정렬에 가깝게.

## 수용 기준
- 범례·툴팁에 도메인 의미

## 스펙
§10.3

${SPEC_BASE}`,
  },
  {
    id: "DB-401",
    title: "Evaluator 상세 패널(선택) — evaluations 본문 미리보기",
    body: `## 목표
metrics/evaluations 내용 일부 표시, 결정 타임라인과 연계 가능하게.

## 수용 기준
- 본문 truncate, 시크릿/PII 노출 없음

${SPEC_BASE}`,
  },
]

const dryRun = process.argv.includes("--dry-run")

function ensureLabel() {
  const r = spawnSync(
    "gh",
    [
      "label",
      "create",
      LABEL,
      "--repo",
      REPO,
      "--color",
      "6F42C1",
      "--description",
      "Yohan OS dashboard roadmap (DB-* tickets)",
    ],
    { encoding: "utf8" }
  )
  if (dryRun) {
    console.log("[dry-run] gh label create", LABEL)
    return
  }
  const err = (r.stderr || "").toLowerCase()
  if (r.status !== 0 && !err.includes("already exists")) {
    console.warn("label create:", r.stderr?.trim() || r.stdout?.trim())
  }
}

function createIssue(t) {
  const title = `[${t.id}] ${t.title}`
  const args = ["issue", "create", "--repo", REPO, "--title", title, "--body", t.body, "--label", LABEL]
  if (dryRun) {
    console.log("[dry-run] gh", args.join(" "))
    return true
  }
  const r = spawnSync("gh", args, { encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] })
  if (r.status !== 0) {
    console.error(`FAILED ${t.id}:`, r.stderr || r.stdout)
    return false
  }
  console.log(r.stdout?.trim() || `created ${t.id}`)
  return true
}

console.log(dryRun ? "--- dry-run ---" : "--- creating issues ---")
ensureLabel()
let ok = 0
for (const t of tickets) {
  if (createIssue(t)) ok++
}
console.log(dryRun ? `Would create ${tickets.length} issues.` : `Done: ${ok}/${tickets.length}`)
