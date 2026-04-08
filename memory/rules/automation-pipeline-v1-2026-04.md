---
id: automation-pipeline-v1-2026-04
date: 2026-04-08
domain: operations
tags: [automation, telegram, ocr, notion, github, pipeline]
related: [policy-decision-options-2026-04, notion-ocr-pipeline, github-repo-why-how, telegram-inbox]
status: draft
---

# 자동화 설계안 v1 (로컬 배치 30분)

## 확정 파라미터

- 배치 주기: `30분`
- 입력 범위: `screenshot + github url`
- 처리 윈도우: `당일 + 전일`
- 노션 실패 재시도: `3회`
- 승인 대기 알림: `텔레그램`
- 재처리 모드: `--force` 지원 (기본 OFF, 복구/마이그레이션 시만 사용)
- URL 정책: `source_url` 원문 보존 + `canonical_url` 정규화(`utm_*`, `media_*`, `ranking_*` 제거)

## 실행 전제

- v1은 로컬 스케줄러 기반이므로 **PC가 켜져 있고 프로세스가 살아 있을 때만 실행**된다.
- 레포 루트 `.env`에 노션·텔레그램 토큰이 설정되어 있어야 한다.
- SoT 우선 원칙: `memory/` 반영이 항상 먼저, 노션은 미러/협업 용도.
- 작업 스케줄러 등록은 관리자 권한이 없으면 **user-level fallback**으로 등록된다 (`task-scheduler-setup.ps1` 자동 처리).

## 파이프라인 범위 (v1)

- `screenshot` 메시지:
  - OCR 정제 → `memory/ingest/insights/` 초안 저장
  - 노션 리소스 push
  - long 판단이면 노션 서머리 push
- `github url` 메시지:
  - URL 인제스트(`memory/ingest/url/url-*.md`)
  - why-how 카드 생성/갱신(`memory/ingest/insights/*-github-why-how.md`)

## 처리 우선순위

1. SoT 산출물 (`insight` / `url ingest`)
2. 노션 리소스
3. 노션 서머리 (short면 생략)
4. GitHub why-how

## short/long 분기 규칙

- short: `3줄 이하` 또는 `180자 이하`
- long: short 조건 불충족
- short는 `resource_only`, long은 `resource + summary`

## 중복·정규화 규칙

- GitHub/Gist URL은 canonical 기준 dedupe
- dedupe 키 예시: `{host + pathname}` + 정규화된 query
- 중복 시:
  - 인제스트 파일 재생성 대신 기존 파일 `updated_at` 또는 처리 로그만 갱신
  - why-how는 새 파일 생성 대신 기존 카드 갱신

## 실패 복구 정책

- 노션 API 실패: 최대 `3회` 재시도
  - backoff: `1분 → 5분 → 15분`
- 3회 초과 시 dead-letter 큐에 적재:
  - `memory/inbox/automation-dead-letter.md`
- dead-letter 항목은 다음 배치에서 자동 재시도하지 않고 승인 후 재처리

## 승인 대기(게이트) 조건

- OCR 품질 낮음 (의미 해석 불가/문장 파편 과다)
- 중복 의심 강함 (동일 날짜·유사 제목·동일 canonical 충돌)
- 노션 push 3회 실패
- 프론트매터 필수 필드 누락 또는 규칙 위반 가능성

## 텔레그램 알림 규격

- 채널: 기존 봇 송신 채널(운영 chat id)
- 기본 모드(평시): **1줄 요약만 전송**
  - 예: `[Yohan OS][batch] done: scanned=18 processed=9 skipped=8 review=1 failed=0`
- 이슈 모드(문제 발생 시): 1줄 요약 + 상세 알림 전송
  - 상세 대상: `review > 0` 또는 `failed > 0`
  - 예: `failed: msg_5678 (notion_timeout after 3 retries)`

## 파일/스크립트 설계 (v1)

- 신규 권장:
  - `scripts/automation-batch.ts` (메인 오케스트레이터)
  - `scripts/automation-notify.ts` (텔레그램 알림 유틸)
  - `scripts/normalize-url.ts` (canonical 정규화 유틸)
- 기존 활용:
  - `src/telegram-bot.ts`
  - `scripts/telegram-ocr-batch.ts` (v1에서는 일반화 필요)
  - `src/notion/notion-ocr-env.ts`
  - `src/notion/push-ocr.ts`

## 스케줄러 운영 (Windows)

- 권장: 작업 스케줄러(Task Scheduler)에서 `30분 간격` 트리거
- 실행 커맨드(예):
  - `npm run automation:batch`
- 옵션:
  - "컴퓨터 유휴 시만 실행" 비활성
  - "실패 시 다시 시작" 활성

자동 등록 스크립트:

- 등록: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/task-scheduler-setup.ps1`
- 즉시 실행: `Start-ScheduledTask -TaskName "YohanOS-AutomationBatch-30min"`
- 제거: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/task-scheduler-remove.ps1`
- 실행 래퍼: `scripts/run-automation-batch.ps1` (로그: `memory/logs/automation-batch.log`)
- 무창 래퍼: `scripts/run-automation-batch-hidden.vbs` (`wscript.exe`로 실행, 콘솔창 표시 최소화)

운영 메모:

- 게임/작업 중 콘솔창 깜빡임을 줄이기 위해 스케줄러는 VBS 무창 래퍼로 실행한다.
- 스케줄러 `General`에서 `Run whether user is logged on or not` + `Hidden` 설정 시 체감상 창 노출이 더 줄어든다.
- 관리자 권한 없이 등록한 경우에도 배치 자체는 동작하며, 이 경우 실행 컨텍스트는 현재 사용자 기준이다.

## 관측 지표 (초기 2주)

- 배치 성공률
- 노션 push 실패율/재시도율
- 승인 대기 비율
- dead-letter 발생 수
- 중복 차단 수(canonical dedupe)

## v2 전환 조건

- 2주 이상 배치 성공률 안정
- 승인 대기 비율 하락(운영 임계치 이내)
- dead-letter 처리 루틴 정착
- 위 조건 충족 시:
  - 처리 범위 확장(일반 텍스트/기타 URL)
  - 실시간 이벤트형 워커 검토
