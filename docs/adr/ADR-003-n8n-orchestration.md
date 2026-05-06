---
id: ADR-003
date: 2026-04-15
tags: [adr, automation, n8n, orchestration]
status: Accepted
related:
  - docs/adr/ADR-004-mcp-server-architecture.md
---

# ADR-003: n8n을 자동화 오케스트레이터로 채택

- **상태:** Accepted
- **날짜:** 2026-04-15 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

요한 OS의 자동화 파이프라인 — RESOURCE 자동 적재, 뉴스레터 수집, 주간 회고 생성, LOG 브릿지 등 — 을 오케스트레이션할 도구가 필요했다.

## 결정 (Decision)

n8n (Docker 셀프호스트)을 자동화 오케스트레이터로 채택.

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| Make (Integromat) | GUI 직관적 | 유료, WF 수 제한 | 셀프호스트 불가, 비용 |
| Zapier | 생태계 넓음 | 고가, 커스텀 제한 | 1인 기업 비용 부담 |
| GitHub Actions | 무료 티어 | 트리거 제한, UI 없음 | 복잡한 WF 관리 어려움 |
| LangGraph 단독 | 에이전트 특화 | 범용 자동화 약함 | n8n + LangGraph 병행이 최적 |

## 결과 (Consequences)

- **장점:** 셀프호스트 무제한 WF, 비주얼 편집기, MCP 연동, 400+ 인테그레이션
- **단점·트레이드오프:** Docker 관리, 초기 학습 곡선
- **후속 작업:** n8n 강의 시리즈 학습 완료, 실 WF 구현 착수 예정

## 관련 결정·문서

- ADR-004: MCP 서버 아키텍처 (n8n과 MCP 연동)
