---

## id: metrics-evaluations-readme
date: 2026-04-16
domain: yohan-os
tags: [metrics, evaluator, session-log]
related: [yohan-ai-dictionary]
status: active

# Evaluator 로그 디렉터리

## 무엇이 들어 있나

- `**eval-YYYY-MM-DD-*.md**` — MCP `log_evaluation` 또는 동일 형식의 세션 종료 검증 기록.
- 파일명 순서는 대략적 시간순; 같은 날 여러 건이면 접미 숫자가 올라간다.

## 운영

- **보존:** 되돌리기·감사용으로 **삭제하지 않는 것**을 기본으로 한다.
- **정리 주기:** 분기마다 오래된 항목을 아카이브 복사본으로만 옮기거나, 요약 한 줄을 `memory/wiki/log.md`급이 아닌 **프로젝트 노트**에 남긴 뒤 폴더를 비우는 식은 **사람이 판단** 후 실행.
- **세션 로그:** 대화형 세션 원문은 Cursor·Claude 등 클라이언트 측에 두고, SoT에는 **결정·Evaluator 요약**만 남긴다 (`append_decision`, 본 폴더).

## 관련 규칙

- `.cursor/rules/evaluator-vision-gate.mdc`
- `memory/rules/evaluator-checklist.md`