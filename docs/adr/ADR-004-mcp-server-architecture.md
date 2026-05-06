---
id: ADR-004
date: 2026-04-07
tags: [adr, mcp, architecture, sot]
status: Accepted
related:
  - docs/adr/ADR-005-harness-3-layer.md
  - docs/adr/ADR-006-notion-as-sot-mirror.md
---

# ADR-004: MCP(Model Context Protocol) 서버 아키텍처 채택

- **상태:** Accepted
- **날짜:** 2026-04-07 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

Cursor, Claude Desktop, n8n 등 다양한 AI 클라이언트가 요한 OS의 SoT(`memory/`) 데이터에 접근해야 했다. 각 클라이언트마다 별도 연동하면 유지보수 비용이 폭증.

## 결정 (Decision)

MCP(stdio) 서버를 단일 접점으로 구축. 도구: `get_context`, `append_decision`, `search_memory`, `plan_task` 등.

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| 직접 API 서버 (REST) | 자유도 높음 | 구축·유지보수 비용 | 1인 기업에 과한 인프라 |
| 각 클라이언트별 플러그인 | 즉시 사용 | 데이터 파편화, 중복 | SSoT 위반 |
| Notion API 직접 호출 | 즉시 가능 | 속도 느림, 구조 제한 | 코드 프로젝트에서 병목 |

## 결과 (Consequences)

- **장점:** 단일 접점으로 모든 AI 클라이언트 통합, JSON-RPC 표준, Cursor 공식 지원
- **단점·트레이드오프:** stdio 기반이라 원격 접근 시 supergateway 등 추가 레이어 필요
- **후속 작업:** n8n MCP 연동(28강·30강), 도구 확장 중

## 관련 결정·문서

- ADR-005: 하네스 3층 구조
- ADR-006: 노션 = SoT 미러 + 입력 인터페이스
