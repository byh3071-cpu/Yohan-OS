---
id: pge-pipeline
date: 2026-04-06
domain: harness
tags: [pge, planner, generator, evaluator, pipeline]
related: [agent-harness, evaluator-checklist]
status: active
---

# Planner → Generator → Evaluator (P/G/E)

복잡하거나 SoT·비전과 충돌할 수 있는 작업은 **아래 순서**를 기본으로 한다.

## 1. Planner

- 세션 시작 시 `**get_context`** 로 SoT를 읽는다.
- 작업을 **여러 단계**로 나눌 필요가 있으면 MCP `**plan_task`** 로 `plan.v0` JSON을 받는다 (스텁: 목표·제약·최소 태스크).
- 필요하면 `**search_memory`** 로 `memory/` 안 관련 노트·결정·인제스트를 찾는다.

## 2. Generator

- 플랜(또는 사용자 요청)에 따라 **코드·문서·설정**을 실제로 수정한다.
- 이 단계는 **대화 안의 에이전트 실행**이 담당한다 (별도 MCP 이름은 없을 수 있음).

## 3. Evaluator

- 산출이 있으면 **응답 말미**에 `memory/rules/evaluator-checklist.md` 로 비전·SoT 대조.
- 판정: `pass` / `revise` / `reject` (프로젝트 규칙: `.cursor/rules/evaluator-vision-gate.mdc`).
- **MCP `log_evaluation` 호출:** 위 판정을 텍스트 블록(`## Evaluator`)으로 적은 **바로 다음**에, `yohan-os` MCP가 연결되어 있으면 `**log_evaluation`을 한 번 호출**해 `memory/metrics/evaluations/eval-{날짜}-{순번}.md`에 동일 판정·메트릭을 YAML로 남긴다. 연결 불가·도구 미노출이면 생략 사유를 응답에 적고, `evaluator-checklist.md`의 안내를 따른다 (`npm run build` 후 MCP 재연결 등).

## 도구 매핑 (요약)


| 단계        | MCP·수단                                                   |
| --------- | -------------------------------------------------------- |
| Planner   | `get_context`, `plan_task`, `search_memory`              |
| Generator | (에이전트 작업)                                                |
| Evaluator | 체크리스트 + 규칙; `**log_evaluation`**; 필요 시 `append_decision` |
