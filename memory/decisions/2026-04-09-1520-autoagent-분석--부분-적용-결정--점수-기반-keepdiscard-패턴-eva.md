---
title: AutoAgent 분석 — 부분 적용 결정 + 점수 기반 keep/discard 패턴 Evaluator 강화에 반영
created: 2026-04-09T15:20:38.469Z
source: mcp.append_decision
---

AutoAgent(ThirdLayer) 분석 결과, 핵심 인프라(Docker+Harbor)는 1인 운영에 과도. 단, '점수 기반 keep/discard' 패턴을 Evaluator에 정량 점수 추가로 반영. '도구 추가 > 프롬프트 튜닝' 원칙 확인.

## 원문

- GitHub: https://github.com/kevinrgu/autoagent
- 기사: https://www.aitimes.com/news/articleView.html?idxno=208859

## AutoAgent 핵심

- 메타 에이전트가 agent.py(하네스)를 자동 수정 → 벤치마크 실행 → 점수 측정 → keep/discard 반복
- program.md(메타 지시서) = 우리의 .cursorrules + AGENTS.md
- results.tsv(실험 로그) = 우리의 eval-*.md
- .agent/(스킬) = 우리의 .cursor/skills/

## 적용 판단

| 개념 | 적용 | 이유 |
|------|------|------|
| Docker+Harbor 벤치마크 | ❌ | 1인에게 과도한 인프라 |
| 자동 프롬프트 튜닝 | ❌ | 벤치마크 없이 효과 측정 불가 |
| 점수 기반 keep/discard | ✅ 부분 | Evaluator에 정량 점수 추가 |
| 도구 > 프롬프트 원칙 | ✅ 확인 | MCP 도구 추가가 규칙 문구 다듬기보다 레버리지 높음 |
| program.md 패턴 | ✅ 이미 적용 | .cursorrules + AGENTS.md |
| 실험 로그 | ✅ 이미 적용 | eval-*.md |

## 부분 적용: Evaluator 정량 점수 추가

현재 Evaluator는 pass/revise/reject 3단계만 있음. AutoAgent의 '점수 기반 keep/discard'에서 가져올 것:

1. `quality_scores` 5개 boolean을 **점수화** (0~5점)
2. 이전 세션 점수와 비교 → "점수 올랐으면 keep, 내렸으면 revise 근거 강화"
3. `memory/metrics/evaluations/`에 점수 추이 차트 데이터 축적

이건 v3에서 Evaluator 대시보드 뷰와 연결하면 "품질이 올라가고 있는지" 시각적으로 볼 수 있다.
