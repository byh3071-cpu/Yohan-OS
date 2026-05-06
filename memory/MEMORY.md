---
id: memory-index
date: 2026-05-06
tags: [memory, index, sot]
related:
  - AGENTS.md
  - memory/active-project.yaml
  - memory/rules/recording-rules.md
status: active
---

# Yohan OS — 메모리 인덱스

`memory/`는 단일 출처(SoT)다. 이 파일은 **현 상태 한눈 요약**일 뿐, 자세한 SoT는 각 경로를 직접 본다.

## 활성 프로젝트

- **id:** `yohan-ai-dictionary`
- **단계:** Phase 3 (배포·템플릿·블로그)
- **다음 한 가지:** P3-2 Vercel 1차 배포 — 사용자가 vercel.com에서 import. 5/9 KST follow-up routine 자동 점검 등록됨(`trig_0169mbKQJdw32BEwGU3j8jSX`).
- **SoT 경로:** `memory/projects/yohan-ai-dictionary/{vision,current-phase,phase3-checklist}.md` · 코드 레포 `yohan-ai-dictionary/`(별도 클론).

## 완료된 백로그 (Yohan OS 본체)

- 대시보드 DB-101~DB-401 — 별자리 D-1~D-4·SoT draft API·히트맵 도메인·Evaluations API·Linear/GitHub 워크플로 문서·자동화 스크립트.
- 위키 Phase 1~5 (Entities 6 + Concepts 8, Ch.15~18 인사이트 병합).
- 텔레그램 routine 알림 2시간 디바운스 + 소셜 OCR strip.

## 인프라 스택

- **메인 DB:** Supabase (PostgreSQL · pgvector) — `docs/adr/ADR-001-...`.
- **벡터 DB:** Qdrant (Docker 셀프호스트) — `docs/adr/ADR-002-...`.
- **자동화 오케스트레이터:** n8n (Docker) — `docs/adr/ADR-003-...`.
- **외부 도구 단일 접점:** `yohan-os` MCP 서버 (stdio) — `docs/adr/ADR-004-...`.
- **지식 SoT:** git-tracked `memory/` 마크다운. **노션은 미러+입력**(`docs/adr/ADR-006-...`).
- **지식 레이어 패턴:** Karpathy LLM-Wiki — raw / wiki / insight 3층 (`docs/adr/ADR-007-...`).

## 하네스 (3층)

- **RULEBOOK:** `memory/rules/agent-harness.md`(절대 규칙) + `memory/rules/recording-rules.md`(기록 규칙) + `AGENTS.md`(진입점).
- **PROTOCOL:** `memory/rules/{telegram-workflow,wiki-ops,dashboard-quick-actions,...}.md` (도메인별 절차).
- **SKILL:** `.cursor/skills/*/SKILL.md` · Claude Skills (능동 호출).
- 결정: `docs/adr/ADR-005-harness-3-layer.md`.

## 다음 후보 (트랙 C)

1. **P3-3 GitHub 템플릿화** — Settings → Template, README 3줄. (사용자 + AI 협업)
2. **P3-4 학습 글 1편 초안** — "왜 Starlight + md로 사전을?" (`memory/projects/yohan-ai-dictionary/blog-drafts/` 초안 후 사전 레포로 이전).
3. 백로그 다음 트랙 발굴 — `DASHBOARD-SPEC.md` §11~ 미구현 영역 스캔.

## 자주 보는 길

- 활성 프로젝트 메타: `memory/active-project.yaml`
- 최근 결정: `memory/decisions/` (날짜순)
- 세션 로그: `memory/logs/sessions/`
- 자동화 상태: `memory/metrics/automation/`
- 위키: `memory/wiki/{entities,concepts}/`
