---
id: automation-runbook-v1
date: 2026-04-08
domain: operations
tags: [automation, runbook, troubleshooting, telegram, notion]
related: [automation-pipeline-v1-2026-04, automation-ops-checklist, notion-ocr-pipeline, policy-decision-options-2026-04]
status: active
---

# Automation Runbook v1

## 현재 운영 상태

- 스케줄: 30분 간격 배치
- 입력: `screenshot + github url`
- 처리 윈도우: 당일+전일 (일별 파일 없으면 레거시 `telegram-inbox.md` fallback)
- 출력: insight 초안 + notion resource(+조건부 summary) + github why-how
- 알림: 평시 1줄, 문제 시 상세

## v1.1~v1.2 반영

- 범위: `v1.1 only` (안정화 우선)
- OCR 교정 강도: 보수적(원문 최대 보존)
- 템플릿 분기: `Prompt n` 패턴 2개 이상이면 `prompt-set`
- review 게이트: 균형형
  - 저신뢰 OCR이면 review
  - 또는 핵심 내용 부족 + 분류 애매 조합이면 review
- 자동 태깅(v1.2-1): `창업레이더/재무/생산성/개발` 상위 태그 자동 병합
- GitHub 카드 품질 업(v1.2-2): 인제스트 본문에서 핵심 문장 3~5줄 자동 추출
- 유사중복 탐지(v1.2-3): 텍스트 시그니처 Jaccard 임계치(0.72) 이상이면 review

## 서머리 형식 원칙 (v1.2)

- 노션 서머리 본문은 템플릿 기반이며, `generic`/`prompt-set` 2종으로 분기한다.
- `prompt-set`은 프롬프트 묶음 OCR에서 라벨·개수 정보를 추가로 기록한다.
- 스크린샷 1건이어도 템플릿 구조는 유지되고, 내용 값만 달라진다.
- OCR 교정은 보수적 규칙 기반이며, 결과 버전은 `적용 사항`에 기록된다 (예: v1.1.3).

## Daily Quick Check (1~2분)

- 텔레그램 1줄 요약 확인:
  - `failed=0` 유지
  - `review` 급증 여부
- 로그 최신 실행 확인:
  - `memory/logs/automation-batch.log`
- 이슈 발생 시:
  - `memory/inbox/automation-review.md`
  - `memory/inbox/automation-dead-letter.md`

## Weekly Check (5~10분)

- dead-letter/review 누적 추세
- state 파일 중복 키 이상 유무
- 샘플 3건 품질 점검(insight/notion/github 카드)
- 규칙 조정 필요 여부 기록

## 장애 코드 대응표

- `LastTaskResult = 0`: 정상 종료
- `LastTaskResult = 267009 (0x41301)`: 현재 실행 중
- `LastTaskResult = 2147942402 (0x80070002)`: 파일/경로 탐색 실패
  - 작업 Action/runner 경로 점검
- `0x80070005`: 권한 거부
  - user-level fallback 등록 또는 관리자 권한 등록

## 자주 나오는 운영 이슈

- `scanned=0`:
  - 원인 1) 실제 screenshot 블록 없음
  - 원인 2) bot 미실행으로 인박스 미생성
  - 원인 3) 경로 불일치(현재는 fallback 처리됨)
- OCR 텍스트 깨짐:
  - v1은 원문 보존 우선이라 교정이 약함
  - 필요 시 v1.1에서 OCR 교정 레이어 추가

## v1.3 착수 기준

- 아래 4개를 **2주 연속** 충족하면 v1.3 시작:
  - 일일 `failed=0` 유지율 95% 이상
  - review 비율 20% 이하
  - dead-letter 주간 순증 0~1건
  - 랜덤 샘플 5건 품질 점검에서 치명 오류 0건
- 시작 타이밍 권장:
  - 최소 100건 이상 처리 데이터가 쌓인 뒤
  - 현재 규칙 수정 빈도가 주 1회 이하로 안정된 시점

## 개선 백로그 (v1.3+)

- 도메인별 summary 템플릿 확장(창업/재무/개발)
- 주간 리포트 자동 생성 및 텔레그램 요약 전송
- 태그/중복 판단의 경량 학습형 보정(휴리스틱 + 피드백)