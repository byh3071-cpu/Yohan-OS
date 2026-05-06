---
name: yohan-os-workflow
description: >-
  Runs the Yohan OS agent workflow—MCP get_context first, memory/ SoT, P/G/E
  pipeline, Evaluator gate, and decision logging. Use when working in the Yohan
  OS repository, when the user mentions memory/, yohan-os MCP, SoT, or agent
  harness rules.
---

# Yohan OS — 에이전트 워크플로

## 세션 시작 (필수)

1. MCP `yohan-os`가 있으면 **`get_context`** 를 코드·문서 작업 전에 한 번 호출한다.
2. 실패·미연결 시: [`memory/rules/agent-harness.md`](memory/rules/agent-harness.md)와 [`README.md`](README.md)의 MCP 점검을 안내한다.
3. MCP·RAG·스킬·하네스·Select 축이 주제면 [`memory/rules/agent-harness.md`](memory/rules/agent-harness.md) **§1.1** 표에서 필요한 `memory/wiki/` 파일만 최소 `@` 주입 (교재 인사이트: `memory/ingest/insights/modern-ai-ch*.md`).

## 컨텍스트 vs 하네스 (한 줄)

- **컨텍스트:** `memory/` SoT, `search_memory`, 인제스트, `.cursor/rules` 스코프. 차별성·우선순위는 [`memory/profile.yaml`](memory/profile.yaml)의 `differentiation`.
- **하네스:** [`memory/rules/agent-harness.md`](memory/rules/agent-harness.md) · [`memory/rules/pge-pipeline.md`](memory/rules/pge-pipeline.md) · Evaluator(`.cursor/rules/evaluator-vision-gate.mdc` + 체크리스트 §E).

전체 다이어그램·인덱스: [`docs/CONTEXT-AND-HARNESS-SYSTEM.md`](docs/CONTEXT-AND-HARNESS-SYSTEM.md).

## 작업 중

- `memory/ingest/insights/`에 새 노트·정제본을 쓸 때: 요약은 [**인사이트 요약 품질**](memory/rules/insight-summary-quality.md)(문단 우선·사실/해석 분리·출처 명시).
- 복잡한 목표: **`plan_task`** 또는 **`search_memory`** (Planner).
- 구현·문서 수정 후: **`memory/rules/evaluator-checklist.md`** 기준으로 응답 말미 Evaluator 블록(프로젝트 규칙 준수).
- Evaluator 블록 직후 MCP 가능하면 **`log_evaluation`** 으로 `memory/metrics/evaluations/` 에 판정 로그 저장.
- 아키텍처·비전 충돌 가능 결정: **`append_decision`**.

## 진입 순서 (복붙용)

1. [`AGENTS.md`](AGENTS.md)
2. [`memory/rules/agent-harness.md`](memory/rules/agent-harness.md)
