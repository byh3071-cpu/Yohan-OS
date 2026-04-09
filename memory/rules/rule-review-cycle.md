---
id: rule-review-cycle
date: 2026-04-09
domain: harness
tags: [rules, review, maintenance, governance]
related: [agent-harness, decision-trigger, dashboard-design-system]
status: active
---

# 규칙·문서 정기 점검 사이클

규칙·템플릿·스킬은 **확정적이지 않은 문서**가 대부분이다. 프로젝트가 진행되면 맥락이 바뀌고, 안 쓰는 규칙은 효용이 없어진다. 이 문서는 **언제, 무엇을, 어떻게** 점검하는지 정한다.

---

## 1. 점검 주기

| 주기 | 대상 | 방법 |
|------|------|------|
| **매 세션** | `check:drift` 자동 실행 | 깨진 링크, 중복 ID (기계적) |
| **주간 (일요일)** | 규칙 15개 전체 훑기 | 아래 체크리스트로 1개씩 확인 |
| **월간 (1일)** | 템플릿·스킬·.cursor/rules | 전면 재검토 — 안 쓰는 것 `archived` 처리 |

## 2. 주간 점검 체크리스트 (규칙 1개당)

1. **최근 1주일 안에 참조된 적 있나?** — 없으면 효용 의심
2. **내용이 현재 코드/구조와 맞나?** — 파일 경로·함수명·프로세스 변경 확인
3. **status가 `draft`인데 1주 이상 방치?** — `active`로 승격하거나 `archived`
4. **date가 없거나 2주 이상 오래됐나?** — 갱신 필요 여부 판단
5. **다른 규칙과 중복/충돌?** — 합치거나 하나 삭제

## 3. 현재 규칙 상태 감사 (2026-04-09 기준)

| 파일 | date | status | 판정 |
|------|------|--------|------|
| `agent-harness.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 + date 추가 |
| `archiving-appraisal-feynman.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `evaluator-checklist.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `github-repo-why-how.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `notion-ocr-pipeline.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `notion-sync.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `pge-pipeline.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `telegram-inbox.md` | 없음 | 없음 | **갱신 필요** — 프론트매터 추가 |
| `automation-ops-checklist.md` | 04-08 | active | OK |
| `automation-pipeline-v1-2026-04.md` | 04-08 | **draft** | 1주 미만, 아직 유효 |
| `automation-runbook-v1.md` | 04-08 | active | OK |
| `dashboard-design-system.md` | 04-09 | active | OK (오늘 갱신) |
| `dashboard-quick-actions.md` | 04-09 | active | OK |
| `decision-trigger.md` | 04-09 | active | OK |
| `decisions/policy-decision-options-2026-04.md` | 04-08 | **draft** | 1주 미만, 유효 |
| `router-spec-v1.md` | 04-08 | **draft** | 1주 미만, 유효 |
| `session-log.md` | 04-09 | active | OK |

**8개 규칙에 프론트매터 없음** → 다음 세션에서 일괄 추가 권장.

## 4. 자동화

- `check:drift`는 **링크·구조** 점검 (이미 있음)
- 주간 점검은 **사람(Yohan) + 에이전트**가 함께 — 대시보드 "규칙" 카테고리에서 열어보며 확인
- 월간 전면 재검토는 별도 세션 잡아서 진행

## 5. 개정 시 규칙

- 내용 변경 시 `date` 갱신 필수
- 큰 변경(구조·방향)은 `append_decision` 기록
- `archived` 처리 시 파일 삭제 대신 `status: archived` + 사유 1줄
