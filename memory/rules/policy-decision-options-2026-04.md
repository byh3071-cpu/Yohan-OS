---

## id: policy-decision-options-2026-04

date: 2026-04-08
domain: operations
tags: [policy, decision, workflow, ocr, github, evaluator]
related: [archiving-appraisal-feynman, github-repo-why-how, notion-ocr-pipeline, agent-harness, evaluator-checklist]
status: draft

# 운영 정책 결정안 (A/B) — 2026-04

## 목적

- 최근 운영 점검에서 나온 6개 쟁점을 빠르게 선택·합의하기 위한 문서
- 코드 수정 전, 정책 합의부터 확정하기 위한 체크리스트

## 확정안 (2026-04-08)

- `1`: A안 (고정형)
- `2`: B안 (분리형: `github=why-how`, `ocr/rss=feynman`)
- `3`: A안 (주간 갱신)
- `4`: A안 (실질 산출물 턴은 항상 Evaluator + log_evaluation)
- `5`: A안 (정량형: 줄 수 + 문자 수)
- `6`: A안 (정규화 필수)

## 1) OCR 정제 스킬 템플릿 상태

- **쟁점:** `.cursor/skills/ocr-refine/SKILL.md`의 `프롬프트 템플릿`·`출력 형식`이 placeholder
- **A안 (고정형):** 템플릿과 출력 형식을 고정 문구로 확정
- **B안 (유연형):** 핵심 필드만 강제하고 프롬프트는 작업별 커스텀 허용
- **추천:** A안 (재현성 우선)
- **결정 기준:** 같은 입력으로 담당자/세션이 바뀌어도 결과 구조가 동일해야 하는가

## 2) Standard 정의 이중화 (feynman vs why-how)

- **쟁점:** `archiving-appraisal-feynman.md`의 Standard와 `github-repo-why-how.md` 실무 템플릿이 병렬 운용
- **A안 (통합형):** Standard 기본을 `why-how + 파인만 3단`으로 명시 통합
- **B안 (분리형):** Standard를 소스 유형별로 분기 (`github=why-how`, `ocr/rss=feynman`)
- **추천:** B안 (운영 비용 최소)
- **결정 기준:** 단일 포맷 통일보다 소스별 가독성과 작성 속도를 우선하는가

## 3) active-project 갱신 주기

- **쟁점:** `memory/active-project.yaml`이 현재 운영 축(OCR/Notion/GitHub 카드) 반영이 약함
- **A안 (주간 갱신):** 매주 1회 목표·브랜치·메모 업데이트
- **B안 (이벤트 갱신):** 큰 방향 전환 시에만 업데이트
- **추천:** B안 (불필요한 관리 최소)
- **결정 기준:** 운영판으로 쓸지, 상태 스냅샷으로 쓸지

## 4) Evaluator + log_evaluation 실행 강도

- **쟁점:** 문서상 강하지만 실제 턴마다 누락 가능
- **A안 (엄격형):** 실질 산출물 있는 턴은 항상 Evaluator + log_evaluation
- **B안 (경량형):** 아키텍처/규칙/자동화 변경 턴만 필수, 단순 문서 편집은 선택
- **추천:** B안 (속도와 통제 균형)
- **결정 기준:** 운영 리듬을 해치지 않으면서도 품질 로그를 유지할 수 있는가

## 5) OCR short/long 경계 규칙

- **쟁점:** 현재 “3줄 이하” 기준이 정성적
- **A안 (정량형):** 줄 수 + 문자 수 기준 동시 사용 (예: 3줄 이하 또는 180자 이하)
- **B안 (정성형):** 현재처럼 판단자 재량 유지
- **추천:** A안 (판정 일관성)
- **결정 기준:** 자동화/배치에서 분기 오류를 줄여야 하는가

## 6) URL canonical 정규화

- **쟁점:** GitHub/Gist에 트래킹 파라미터가 남아 중복 가능
- **A안 (정규화 필수):** `utm`_*, `media_`*, `ranking_*` 제거 후 canonical 저장
- **B안 (원본 보존):** 수집 원문 URL 그대로 저장
- **추천:** A안 (중복·검색 노이즈 감소)
- **결정 기준:** 원문 재현성보다 검색/중복 관리 효율을 우선하는가

## 바로 결정할 최소 세트

- 우선 결정: `2`, `4`, `6`
- 다음 결정: `1`, `5`
- 마지막 결정: `3`

## 합의 후 반영 순서

- `2` 확정 → `memory/rules/archiving-appraisal-feynman.md` + `memory/rules/github-repo-why-how.md` 텍스트 정합화
- `4` 확정 → `memory/rules/evaluator-checklist.md` 실행 강도 문구 조정
- `6` 확정 → URL 인제스트 파이프라인 정규화 규칙 반영
- `1`, `5` 확정 → `.cursor/skills/ocr-refine/SKILL.md`와 OCR 배치 기준 업데이트
- `3` 확정 → `memory/active-project.yaml` 운영 규칙 반영