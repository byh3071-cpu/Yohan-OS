---
id: automation-ops-checklist
date: 2026-04-08
domain: operations
tags: [automation, checklist, telegram, notion, github]
related: [automation-pipeline-v1-2026-04, policy-decision-options-2026-04]
status: active
---

# 자동화 운영 체크리스트 (매일/주간)

## 목적

- 파이프라인 장애를 늦게 발견하지 않고 초기에 잡는다.
- 확인 시간은 짧게, 조치 기준은 명확하게 유지한다.

## 매일 체크 (1~2분)

- 텔레그램 배치 요약 1줄 확인:
  - `failed=0` 유지
  - `review` 급증 여부만 확인
- 로그 파일 최신 타임스탬프 확인:
  - `memory/logs/automation-batch.log`
- 비정상 시 즉시 분기:
  - `failed > 0` 이면 `memory/inbox/automation-dead-letter.md` 확인
  - `review > 0` 이면 `memory/inbox/automation-review.md` 확인

## 주간 체크 (5~10분)

- dead-letter 누적 건수 확인(주간 증가 추세)
- review 누적 건수 확인(품질 기준 과민 여부 점검)
- `state.json` 크기/중복 키 이상 여부 확인:
  - `memory/metrics/automation/state.json`
- 샘플 3건 랜덤 점검:
  - insight 생성 품질
  - notion resource/summary 반영 일관성
  - github why-how 생성/갱신 정상 여부
- 결정 로그/정책 업데이트 필요성 판단:
  - 규칙 완화 또는 강화가 필요한지 기록

## 조치 기준 (간단 룰)

- `failed`가 하루 1회라도 발생:
  - 원인 유형 기록 후 재시도 정책/환경 변수 점검
- `review`가 3일 연속 증가:
  - OCR short/long 기준 또는 게이트 기준 재조정 검토
- 같은 URL 중복이 반복:
  - canonical 정규화 규칙 점검

## 실행 주체

- 기본: 사용자(Yohan)가 매일/주간 짧게 확인
- 보조: 에이전트가 로그 판독·원인 분류·개선안 제시
