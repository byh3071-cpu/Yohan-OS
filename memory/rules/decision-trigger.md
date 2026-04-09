---
id: decision-trigger
date: 2026-04-09
domain: harness
tags: [decisions, append_decision, sot, rules]
related: [agent-harness, evaluator-checklist]
status: active
---

# append_decision 트리거 기준

`memory/decisions/`에 결정 로그를 남기는 구체적 기준이다. 1인 운영에서는 "나중에 기록"이 유실과 같으므로, 아래 조건에 해당하면 **해당 턴에서 즉시** `append_decision`을 호출한다.

## 반드시 남기는 경우 (필수)

- 아키텍처·스택 선택을 바꾸거나 새로 정한 경우 (예: 라이브러리 교체, 폴더 구조 변경 방향)
- 비전(`docs/VISION-AND-REQUIREMENTS.md`)과 충돌할 수 있는 트레이드오프를 선택한 경우
- `must_not` 예외를 검토한 경우 (결과가 "예외 없음"이어도 기록)
- 새 MCP 도구·스키마를 추가하거나 기존 도구 시그니처를 변경한 경우
- 규칙 파일(`memory/rules/*`, `.cursor/rules/*`, `.cursorrules`)을 신규 생성하거나 삭제한 경우
- 외부 서비스 연동을 추가·변경한 경우 (노션 DB, 텔레그램 봇, API 등)
- 사용자가 "이렇게 하자"라고 명시적으로 합의한 방향이 있는 경우

## 남기기를 권장하는 경우 (선택)

- 기존 패턴과 다른 구현 방식을 채택한 경우 (이유 포함)
- 규칙·문서를 대폭 보강·재구성한 경우
- 이전 결정을 번복하거나 수정한 경우
- 자동화 파이프라인 파라미터(임계치, 주기, 게이트 조건)를 변경한 경우

## 남기지 않아도 되는 경우

- 단순 오타·포맷 수정
- 기존 결정·규칙대로의 구현 (새 선택이 없는 경우)
- Evaluator pass 후 추가 논의 없이 완료된 작업

## 작성 요령

- `title`: 결정 한 줄 (예: "ingest_url User-Agent를 Chrome형으로 변경")
- `summary`: 왜 이 선택인지 한 문장
- `body`: 대안·트레이드오프·근거 (간결하게)

## 참조

- 호출 도구: MCP `append_decision` (title 필수, summary·body 권장)
- 저장 경로: `memory/decisions/`
- `log_evaluation`과 역할이 다름 — Evaluator 판정은 `log_evaluation`, 설계 결정은 `append_decision`
