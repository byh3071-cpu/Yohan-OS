---

## id: work-summary-2026-04-08

date: 2026-04-08
domain: operations
tags: [daily, summary, automation, router, notion, telegram, mcp]
related: [daily-2026-04-08, automation-pipeline-v1-2026-04, automation-runbook-v1, router-spec-v1]
status: active

# 2026-04-08 작업 전체 요약

## 오늘 완료한 핵심 결과

- 텔레그램 OCR/URL 자동화 파이프라인을 v1에서 v1.2까지 고도화했다.
- Windows 작업 스케줄러 30분 배치 실행을 실제 동작 상태로 안정화했다.
- 라우터 Day 1~Day 3(스펙, dry-run 구현, 실행 연결)까지 완료했다.
- 운영 문서/체크리스트/런북을 보강해 재현 가능한 운영 상태를 만들었다.

## 정책·규칙 확정 및 반영

- 정책 확정: `1:A`, `2:B`, `3:A`, `4:A`, `5:A`, `6:A`.
- 분리 운영 확정: `github=why-how`, `ocr/rss=feynman`.
- Evaluator 강도: 실질 산출물 턴은 Evaluator + log_evaluation 수행 원칙.
- OCR short/long 기준: `3줄 이하` 또는 `180자 이하`.
- URL 정책: `source_url` 원문 보존 + `canonical_url` 정규화.
- 관련 문서 반영:
  - `memory/rules/policy-decision-options-2026-04.md`
  - `memory/rules/archiving-appraisal-feynman.md`
  - `memory/rules/github-repo-why-how.md`
  - `memory/rules/notion-ocr-pipeline.md`
  - `memory/rules/agent-harness.md`

## GitHub 2차 정제(why-how) 작업

- 규칙 문서 보강: 영어 README 대비 한국어 why-how 카드 필요성 문단 추가.
- 신규 카드 3건 생성:
  - `memory/ingest/insights/supabase-naver-oidc-proxy-github-why-how.md`
  - `memory/ingest/insights/awesome-design-md-github-why-how.md`
  - `memory/ingest/insights/llm-wiki-gist-why-how.md`
- 기존 카드(anthropic-sdk-python)에 Standard용 파인만 3단 섹션 추가 완료.

## 자동화 설계/운영 문서화

- 생성:
  - `memory/rules/automation-pipeline-v1-2026-04.md`
  - `memory/rules/automation-ops-checklist.md`
  - `memory/rules/automation-runbook-v1.md`
- 정리 내용:
  - 30분 배치, 당일+전일 처리, 재시도 3회, 텔레그램 알림 정책.
  - 평시 1줄 알림 + 이슈 시 상세 알림.
  - dead-letter/review 운영 기준, 장애 코드 대응, v1.3 착수 조건.

## Windows 스케줄러/무창 실행 안정화

- 추가 스크립트:
  - `scripts/run-automation-batch.ps1`
  - `scripts/task-scheduler-setup.ps1`
  - `scripts/task-scheduler-remove.ps1`
  - `scripts/run-automation-batch.cmd`
  - `scripts/run-automation-batch-hidden.vbs`
- 이슈 해결:
  - schtasks 인수 파싱/한글 경로/권한(0x80070005)/파일탐색(0x80070002) 문제 대응.
  - 관리자 권한 실패 시 user-level fallback 등록.
  - 무창 실행 래퍼(VBS) 적용.
- 최종 상태:
  - `LastTaskResult` 실행 중 코드(267009) 확인 후 실제 배치 정상 동작 확인.

## automation-batch 개선 (v1 -> v1.2)

- `scripts/automation-batch.ts` 모듈 분리 리팩토링:
  - `scripts/automation/types.ts`
  - `scripts/automation/parse-telegram.ts`
  - `scripts/automation/state.ts`
  - `scripts/automation/notion.ts`
  - `scripts/automation/insight.ts`
  - `scripts/automation/github.ts`
  - `scripts/automation/notify.ts`
  - `scripts/automation/quality.ts`
  - `scripts/automation/tags.ts`
  - `scripts/automation/dedupe.ts`
- 기능 추가:
  - `--inbox-file`, `--no-notify`, `--force`, `--dry-run`.
  - 레거시 `telegram-inbox.md` fallback 입력.
  - 알림 실패 non-fatal 처리.
  - OCR 보수 교정 + prompt-set 템플릿 분기 + 균형형 review 게이트.
  - 자동 태깅(창업레이더/재무/생산성/개발).
  - GitHub why-how 자동 요약 품질 향상(인제스트 기반 핵심 문장 추출).
  - 유사중복 탐지(Jaccard, threshold 0.72) review 처리.

## OCR 품질 미세 보정(v1.1.1~v1.1.3)

- 노이즈 정리:
  - `SEE`, `수입 수입`, `10002]`, `at혀`, 깨진 Prompt 라벨 등 보정.
  - `누구인\n가`, `효과\n를` 등 줄바꿈 결합.
  - Prompt 3 앞 불필요 문자(`7`) 제거.
- 결과 버전 마커:
  - 서머리 `적용 사항`을 `자동화 파이프라인 v1.1.3`로 표기.

## 라우터 Day 1~Day 3 구현

- Day 1:
  - `memory/rules/router-spec-v1.md` 작성.
  - 입력 타입/출력 계약/결정 테이블/테스트 케이스 10개 확정.
- Day 2:
  - `src/router/route-task.ts` (pure decision 함수).
  - `src/route-task-cli.ts` (단건 확인).
  - `scripts/router-fixture-check.ts` (TC-01~10 자동 검증).
  - `check:router` 10/10 PASS 확인.
- Day 3:
  - `src/router/execute-route.ts` (결정 -> 실행 연결).
  - `src/route-and-run-cli.ts` (route + run 오케스트레이터).
  - Windows 실행 호환(`npm.cmd`, spawn 예외 처리, cmd 실행 경로) 안정화.
  - `route:run` 실실행 `ok: true` 확인.

## CLI/명령 체계 정리

- 자동화:
  - `automation:batch`, `automation:batch:force`, `automation:batch:dry`, `automation:batch:test`
- 라우터:
  - `route:task`, `route:run`, `route:dry`, `route:json`, `route:dry:json`, `route:help`
- 상태:
  - 한국어 중심 출력으로 가독성 개선, JSON 모드는 `--json` 유지.

## Evaluator/로그

- 누락됐던 `memory/rules/evaluator-checklist.md` 복구 완료.
- MCP 평가 로그 저장:
  - `memory/metrics/evaluations/eval-2026-04-09-001.md`
- 판정:
  - Day 2 라우터 dry-run 및 fixture 정합성 `pass`.

## 오늘 확인된 운영 정상 시그널

- 배치 성공 예시: `scanned=1 processed=1 skipped=0 review=0 failed=0`.
- 중복 스킵 정상 예시: `scanned=1 processed=0 skipped=1 review=0 failed=0`.
- 라우터 실행 정상 예시: `route:run` 결과 `ok=true` + `exitCode=0`.

## 남은 다음 액션

- Day 4: `general-note` 경로를 noop에서 실제 inbox append 실행기로 연결.
- v1.3 착수는 런북 기준(2주 안정 지표 충족) 이후 시작.

