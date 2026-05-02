---
id: session-2026-05-02-dashboard-db203-401
date: 2026-05-02
duration_min: 90
files_changed: 22
verdict: pass
tags: [dashboard, constellation, sot-draft, heatmap, evaluator, backlog, health-scripts]
---

# 세션 요약

## 한 일

- 대시보드 백로그 **DB-203~401** 일괄 반영: SoT `POST /api/sot-draft`에 `draftKind`·인사이트 `domain`·결정 `created` 정합, SoT 패널에서 동기화.
- 별자리 **DB-110**: `computePulledPositions` 강도 옵션 + 허브 중력 ON/OFF 시 `lerp` 차등.
- **DB-120**: [`docs/DB-120-CONSTELLATION-SPIKE.md`](../../../docs/DB-120-CONSTELLATION-SPIKE.md) 성능 메모.
- **DB-301**: 차트 히트맵 일별 **도메인 스택**(문서당 첫 태그→도메인), `DOMAIN_AXIS_ORDER` 범례.
- **DB-401**: `GET /api/evaluations`, 차트 탭 Evaluator **본문 미리보기 상세**·판정 필터.
- (선행) **DB-101~102·201~202**: 별자리 시점 필터 문서화·`useDeferredValue`, `/api/sot-draft/generate`, 홈 SoT 초안 패널 등 — 동일 트랜잭션에서 커밋.
- 운영 보조: [`docs/DASHBOARD-TICKET-BACKLOG.md`](../../../docs/DASHBOARD-TICKET-BACKLOG.md), [`docs/LINEAR-GITHUB-WORKFLOW.md`](../../../docs/LINEAR-GITHUB-WORKFLOW.md), `npm run issues:dashboard*`, `workspace:health` / `scripts/workspace-health.mjs`, `scripts/gh-issue-create-dashboard-tickets.mjs`.

## 변경 파일 (핵심)

- `dashboard/src/app/api/{docs/route.ts,sot-draft/**,evaluations/route.ts}`
- `dashboard/src/app/page.tsx`, `dashboard/src/components/{constellation-view,full-charts,sot-draft-panel}.tsx`
- `dashboard/src/lib/{constellation,constellation-gravity,domains,memory,types}.ts`
- `docs/{DASHBOARD-SPEC.md,DASHBOARD-TICKET-BACKLOG.md,DB-120-CONSTELLATION-SPIKE.md,LINEAR-GITHUB-WORKFLOW.md}`
- `package.json`, `scripts/gh-issue-create-dashboard-tickets.mjs`, `scripts/workspace-health.mjs`

## 다음 세션에 전달

- 마스터 백로그 9티켓 처리 완료 표기됨 — 이후는 §10 나머지(에이전트 피드·포커스 모드 등) 또는 실측 FPS 튜닝.
- `memory/logs/automation-batch.log`, `memory/metrics/automation/last-telegram-notify.json`, `memory/inbox/telegram/*` 등은 로컬/배치 변동 가능 → 필요 시 별도 커밋.
