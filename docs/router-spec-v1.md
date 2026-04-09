---
id: router-spec-v1
date: 2026-04-08
domain: operations
tags: [router, orchestration, pge, automation]
related: [pge-pipeline, automation-pipeline-v1-2026-04, automation-runbook-v1]
status: draft
---

# Router Spec v1

## 이 문서의 목적

- 입력이 들어왔을 때 어떤 파이프라인으로 보낼지 결정하는 기준을 고정한다.
- "왜 이 라우팅이 필요한지"를 코드보다 먼저 이해하기 위한 Day 1 설계 문서다.

## 라우터가 무엇인가

- 라우터는 **실행기**가 아니라 **분기 결정기**다.
- 입력을 받아 "어디로 보낼지"를 먼저 정하고, 실제 실행은 기존 파이프라인이 담당한다.
- 즉, 라우터의 책임은 **결정(Decision)**, 실행기의 책임은 **처리(Execution)** 다.

## 라우팅 결정 테이블이 무엇인가

- 라우팅 결정 테이블은 "입력 패턴 -> 처리 경로"를 표로 고정한 룰북이다.
- 이 표가 있으면 사람이 바뀌어도 같은 입력에 같은 판단을 내릴 수 있다.
- 나중에 라우터 코드가 꼬일 때도 테이블과 비교하면 빠르게 복구된다.

## 입력 타입 정의 (v1)

- `ocr`: `type: screenshot` OCR 블록
- `github-url`: 본문에 `github.com` 또는 `gist.github.com` URL 포함
- `general-note`: URL 없는 일반 텍스트 메모
- `review-task`: 기존 `automation-review.md`/`automation-dead-letter.md` 재처리 요청

## 출력 계약 (v1)

- 라우터 출력은 아래 필드를 가진다:
  - `route_type`: `ocr` | `github-url` | `general-note` | `review-task`
  - `primary_action`: 실행 파이프라인 이름
  - `fallback_action`: 실패 시 보조 파이프라인
  - `requires_review`: true/false
  - `reason`: 결정 근거 한 줄

## 라우팅 결정 테이블 (v1)


| 입력 조건                              | route_type           | primary_action                   | fallback_action       | requires_review | 이유                     |
| ---------------------------------- | -------------------- | -------------------------------- | --------------------- | --------------- | ---------------------- |
| `type: screenshot`, URL 없음         | `ocr`                | `automation:batch -> OCR/notion` | `review queue append` | 규칙 기반           | OCR 정제·노션 반영이 핵심 경로    |
| `type: screenshot` + GitHub URL 포함 | `ocr` + `github-url` | OCR 처리 후 GitHub ingest           | GitHub 카드만 분리 생성      | 규칙 기반           | 하나의 입력에서 2개 워크플로 동시 필요 |
| 텍스트에 GitHub/Gist URL 포함            | `github-url`         | `ingest_url + why-how upsert`    | `review queue append` | 보통 false        | 링크 기반 지식 카드화           |
| URL 없는 일반 텍스트                      | `general-note`       | `telegram inbox append`          | `review queue append` | false           | 인박스 큐로 보관 후 후속 처리      |
| review/dead-letter 항목 재실행          | `review-task`        | `automation:batch --force`       | 수동 처리 로그 남김           | true            | 예외 복구 작업               |


## 우선순위 규칙 (충돌 시)

- 규칙 1: `review-task`가 최우선
- 규칙 2: `ocr`는 `general-note`보다 우선
- 규칙 3: `github-url`는 `ocr`와 동시 존재 가능 (병행 처리)
- 규칙 4: 어떤 타입도 확정 불가면 `requires_review=true`로 강제

## 실패/예외 처리 규칙

- 라우팅 실패 시:
  - `route_type=review-task`로 downgrade
  - `reason`에 실패 이유 기록
  - `automation-review.md`에 append
- 실행 실패 시:
  - dead-letter 기록 + 텔레그램 상세 알림

## 테스트 케이스 10개 (Day 1 산출물)

- TC-01: screenshot only -> `ocr`
- TC-02: screenshot + github url -> `ocr` and github 후속
- TC-03: github text only -> `github-url`
- TC-04: gist url only -> `github-url`
- TC-05: 일반 텍스트 메모 -> `general-note`
- TC-06: 빈 텍스트/노이즈 -> review
- TC-07: review queue 항목 재실행 -> `review-task`
- TC-08: dead-letter 재시도 -> `review-task`
- TC-09: screenshot 저신뢰 OCR -> `ocr` but `requires_review=true`
- TC-10: 입력 타입 미식별 -> review fallback

## Day 2 구현 범위 (미리보기)

- `src/router/route-task.ts` 생성
- 입력 -> 출력 계약(JSON)만 반환하는 dry-run 라우터
- 위 TC-01~10을 fixtures로 검사

## 성공 기준 (Day 1)

- 이 문서만 보고 "입력 -> 경로"를 설명할 수 있다.
- 테스트 케이스 10개가 모두 라우팅 표와 모순이 없다.

