---
id: evaluator-checklist
date: 2026-04-08
domain: harness
tags: [evaluator, checklist, pge, quality]
related: [agent-harness, pge-pipeline]
status: active
---

# Evaluator — 비전·방향성 대조 체크리스트

대조 기준 문서: `docs/VISION-AND-REQUIREMENTS.md` (단일 비전 기록)

## 수행 절차

1. 입력: 이번 턴의 작업 요약, 변경 산출물, 사용자 목표 1줄
2. 대조: 항목별 `충족 / 부분 / 불충족` + 근거 1줄
3. 판정:
  - `pass`: 불충족 없음
  - `revise`: 불충족 있음
  - `reject`: must_not·보안·SoT 오염
4. 로그: Evaluator 블록 직후 `log_evaluation` 호출 (가능 시)

## 체크 항목

### A. 맥락·SoT

- SoT(`memory/`) 우선 원칙을 지켰는가
- `profile.yaml`의 `must_not`를 위반하지 않았는가
- 시크릿/키를 평문 저장하지 않았는가

### B. 하네스(P/G/E)

- 산출물 있는 턴에 Evaluator를 수행했는가
- 결정 로그가 필요한 변경을 누락하지 않았는가

### C. 비전 정합성

- 스키마·파이프라인 단일성 원칙과 충돌하지 않는가
- MCP 기반 맥락 통일 목표를 해치지 않는가

### D. 범위·품질

- 요청 범위를 과도하게 넘지 않았는가
- 과장·불가능 약속을 하지 않았는가

### E. 차별성·혁신 여백

- `priority_order`를 지켰는가 (안전→비전→명확성→새로움)
- 필요한 경우에만 대안·트레이드오프를 제시했는가

## 출력 형식

```text
## Evaluator
- 판정: pass | revise | reject
- 대조 요약: (핵심 2~4문장)
- 불충족 시: 수정 지시 (bullet)
```

## 구조화 로그

- 저장 경로: `memory/metrics/evaluations/eval-{YYYY-MM-DD}-{NNN}.md`
- 원칙: 실질 산출물 있는 턴은 Evaluator + `log_evaluation` 수행
- 호출 불가 시: 생략 사유를 응답에 명시

