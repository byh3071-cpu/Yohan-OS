---
id: dashboard-ticket-backlog
date: 2026-04-23
tags: [dashboard, roadmap, tickets, yohan-os]
---

# 대시보드 티켓 백로그 · 순서표

**근거**: [`DASHBOARD-SPEC.md`](./DASHBOARD-SPEC.md) §10, §12 · 구현 상태와 남은 범위를 **티켓 단위**로 쪼갠 것.

## 진행 규칙 (티켓 기반)

| 규칙 | 내용 |
|------|------|
| **한 티켓 = 한 PR(또는 한 커밋 묶음)** | 스펙 섞지 않기; 리뷰·롤백 단위를 맞춘다. |
| **의존성 순서** | 표의 `순서` 열을 따른다. 같은 순서 번호는 병렬 가능하면 병렬. |
| **완료 정의** | 각 티켓의 **수용 기준(AC)** 전부 충족 + `npm run dashboard:build` 통과. |
| **외부 이슈 트래커** | Linear/GitHub 등에 붙일 때 **티켓 ID**(예: `DB-102`)를 제목 접두어로 쓴다. |
| **스펙 동기화** | 마일스톤 단위로 `DASHBOARD-SPEC.md` §12 한 줄 업데이트. |

---

## 마스터 순서표 (우선 진행)

| 순서 | 티켓 ID | 제목 | 스펙 | 의존 |
|:---:|:---:|------|------|------|
| 1 | **DB-101** | 별자리 D-2 — 시점 필터 데이터층 (`filterConstellationAtDate` 고도화·성능) | §10.1 D-2 | — |
| 2 | **DB-102** | 별자리 D-2 — 날짜 슬라이더 UI·성장/페이드 UX·미리보기 연동 | §10.1 D-2 | DB-101 |
| 3 | **DB-201** | §10.11 — 초안 생성 API (`POST /api/sot-draft/generate`, 브리핑과 동일 키 패턴) | §10.11 | — |
| 4 | **DB-202** | §10.11 — 대시보드 UI: 주제·맥락 입력 → 초안 표시·수정 → **확정** | §10.11 | DB-201, 기존 `POST /api/sot-draft` |
| 5 | **DB-203** | §10.11 — 저장 템플릿 종류(인사이트/결정/계획 등)·프론트매터 검증 | §10.11 | DB-202 |
| 6 | **DB-110** | 별자리 D-3 — 허브 중력 토글·부드러운 국소 끌림 | §10.1 D-3 | DB-102 |
| 7 | **DB-120** | 별자리 D-4 — 스파이크: 포그/인스턴싱 FPS 측정 → 단계 도입 범위 확정 | §10.1 D-4 | DB-110 |
| 8 | **DB-301** | §10.3 주의 히트맵 — 도메인 태그 레이어 + 잔디 시각 정합 (차트 데이터 확장) | §10.3 | — |
| 9 | **DB-401** | Evaluator 상세 패널(선택) — `metrics/evaluations` 본문 미리보기·필터 | — | — |

**진행 메모**

- 2026-04-23: **DB-101~102·201~202** 완료(이전 커밋).
- 2026-04-23: **DB-203** `draftKind`·인사이트 `status`/`domain`·결정 `created` 정합. **DB-110** 허브 중력 강도 옵션·lerp 조정. **DB-120** [`DB-120-CONSTELLATION-SPIKE.md`](./DB-120-CONSTELLATION-SPIKE.md). **DB-301** 히트맵 도메인 스택·범례. **DB-401** `GET /api/evaluations`·차트 탭 상세 미리보기.

**이미 반영된 것(티켓 생략·참고만)**:

- D-1 별자리 기본, 브리핑 §10.2, 차트/히트맵 1차(문서 일별 집계), Evaluator 요약 카드, `getDoc` 화이트리스트, `POST /api/sot-draft`(저장만).

---

## 티켓 상세

### DB-101 — D-2 데이터층

- **목표**: 시점 변경 시 노드·엣지가 스펙대로 줄어들거나 나타나도록 **서버/클라 필터 일관** + 불필요한 전체 재계산 방지.
- **AC**
  - 선택한 `as-of` 날짜 기준으로 노드 포함 규칙이 문서화되어 있다(`constellation.ts` 주석 또는 스펙 한 줄).
  - 문서 수 N에서 슬라이더 드래그 시 프레임 드랍이 체감되면 `useMemo`/데이터 단 컷이 적용된다.
- **파일 힌트**: `dashboard/src/lib/constellation.ts`, `api/constellation/route.ts`.

### DB-102 — D-2 UI/UX

- **목표**: 날짜 슬라이더로 “성장” 느낌의 표시 변화 + 클릭 문서 미리보기 유지.
- **AC**
  - 슬라이더 값과 별자리 씬 상태가 양방향으로 이해 가능(레이블에 날짜 표시).
  - D-1과 동일하게 카테고리 필터·DocPreview 연동이 깨지지 않는다.
- **파일 힌트**: `constellation-view.tsx`, `page.tsx`(상태 전달).

### DB-201 — 초안 생성 API

- **목표**: 브리핑과 같이 `OPENAI_API_KEY` 없으면 명확한 메시지; 있으면 주제·맥락으로 마크다운 초안 JSON 반환.
- **AC**
  - 입력 스키마 고정(JSON 필드명 문서화).
  - 키 없을 때 200 + 템플릿 스텁 또는 503 중 하나로 일관.
- **파일 힌트**: `dashboard/src/app/api/briefing/route.ts` 패턴 재사용.

### DB-202 — 초안↔확정 UI

- **목표**: 사용자가 초안을 고친 뒤 **확정** 한 번으로 `memory/`에 저장(기존 `POST /api/sot-draft` 호출).
- **AC**
  - 저장 성공 시 목록 새로고침(`fresh=1` 또는 캐시 클리어)되어 새 파일이 보인다.
  - 실패 시 토스트/인라인 에러.
- **파일 힌트**: 새 컴포넌트 + `page.tsx` 또는 미리보기 영역.

### DB-203 — 템플릿·프론트매터

- **목표**: 저장 종류별 YAML 필드 최소 세트(`type`, `tags`, `date` 등) 정합.
- **AC**
  - `memory/` 기존 결정·인사이트 샘플 2개 이상과 형식 충돌 없음.
- **파일 힌트**: `api/sot-draft/route.ts`, 규칙 문서 한 줄.

### DB-110 — D-3 허브 중력

- **목표**: 토글 ON 시 허브 주변만 완만한 인력(성능 저하 시 즉시 OFF 가능).
- **AC**
  - 기본 OFF; 60fps 근처 유지 목표(기기 스펙 명시는 선택).
- **파일 힌트**: `constellation-view.tsx`, Three 레이어.

### DB-120 — D-4 성운 (스파이크→구현)

- **목표**: 프로파일 결과에 따라 포그/인스턴스 범위를 문서에 적고 1차 구현.
- **AC**
  - `DB-120-SPIKE.md` 또는 스펙 §10.1에 측정 수치·결정 5줄 이상.
- **파일 힌트**: Three 인스턴스/포그 실험 브랜치.

### DB-301 — §10.3 주의 히트맵

- **목표**: 스펙의 **도메인별 색 레이어** + GitHub 잔디 느낌 정렬(현재 차트의 단순 집계와 구분).
- **AC**
  - `domains`/태그 기준 색이 스펙 또는 `DASHBOARD-SPEC` 예시와 모순 없음.
  - 범례·툴팁에 도메인 의미 표시.
- **파일 힌트**: `memory.ts` `buildChartData`, `full-charts.tsx`.

### DB-401 — Evaluator 상세 (선택)

- **목표**: 목록에서 eval 파일 내용 일부를 읽어 결정 타임라인과 연계 가능하게.
- **AC**
  - PII·시크릿 노출 없음(본문 truncate).

---

## Linear / GitHub에 옮길 때

**실행 가이드(일괄 생성·1인 설정)**: [`LINEAR-GITHUB-WORKFLOW.md`](./LINEAR-GITHUB-WORKFLOW.md)

1. GitHub: `npm run issues:dashboard:dry` 확인 후 `npm run issues:dashboard`
2. 위 **티켓 ID**를 이슈 제목 앞에 붙인다. 예: `[DB-102] Constellation D-2 date slider UI`.
3. 본문에 **스펙 앵커** 링크: `docs/DASHBOARD-SPEC.md` 해당 소절.
4. PR에 `Closes #…` 또는 티켓 ID 유지 → 추적 일치.
5. Linear: 팀 1개 · (선택) GitHub 연동 — 상세는 워크플로 문서.

이 문서만으로도 순서대로 체크하면서 진행 가능하다. 에픽 필터가 필요하면 라벨 `epic:constellation`, `epic:ai-sot`, `epic:heatmap`을 이슈에 붙이면 된다.
