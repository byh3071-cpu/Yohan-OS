---
id: ADR-005
date: 2026-05-01
tags: [adr, harness, rulebook, protocol, skill]
status: Accepted
related:
  - docs/adr/ADR-004-mcp-server-architecture.md
  - memory/rules/agent-harness.md
---

# ADR-005: 하네스 3층 구조 채택 (RULEBOOK → PROTOCOL → SKILL)

- **상태:** Accepted
- **날짜:** 2026-05-01 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

요한 OS의 지식 체계(54+ DB)를 AI 에이전트가 일관되게 활용하려면 계층화된 지침 구조가 필요했다. 하네스 강의·고석현·Connect AI 3소스 교차 검증.

## 결정 (Decision)

3층 구조 채택:

- **RULEBOOK**: 불변 원칙 (절대 규칙)
- **PROTOCOL**: 반복 절차 (워크플로우)
- **SKILL**: 실행 단위 (구체 액션)

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| 단일 CLAUDE.md | 심플 | 규모 커지면 관리 불가 | 54+ DB 규모에 부적합 |
| docs 폴더 플랫 구조 | 검색 쉬움 | 우선순위 불명확 | 계층 없으면 충돌 |
| Connect AI 브레인팩 | 커뮤니티 검증 | 개인 맥락 부족 | 요한 OS 특화 필요 |

## 결과 (Consequences)

- **장점:** AI가 참조 우선순위 명확히 인식, 프로토콜 8종 운영 중, Cursor docs/ 내보내기 가능
- **단점·트레이드오프:** 3층 동기화 유지 비용
- **후속 작업:** Phase 1 — 노션 3층 → Cursor docs 폴더 자동 변환

## 관련 결정·문서

- `memory/rules/agent-harness.md` — 본 프로젝트의 RULEBOOK 입구
- ADR-004: MCP 서버 아키텍처
