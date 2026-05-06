---
id: ADR-006
date: 2026-04-13
tags: [adr, notion, sot, knowledge-base]
status: Accepted
related:
  - docs/adr/ADR-004-mcp-server-architecture.md
  - docs/adr/ADR-007-karpathy-llm-wiki.md
---

# ADR-006: 노션을 SoT 미러 + 입력 인터페이스로 유지

- **상태:** Accepted
- **날짜:** 2026-04-13 (회고성 기록: 2026-05-06)
- **작성자:** Yohan (3자 교차 검증: 제미나이 → 노션AI → Opus)

## 맥락 (Context)

제미나이가 "노션을 코어에서 폐기하라"고 권고. 그러나 RESOURCE·SUMMARY·취향 DB·RULEBOOK·EXECUTION LOG 등 정교한 인프라가 이미 노션 위에 완성된 상태.

## 결정 (Decision)

노션을 메인 지식 SoT + 입력 인터페이스로 유지. **Git = 코드 SoT, 노션 = 지식 SoT** (미러가 아닌 정본).

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| 노션 완전 폐기 | Lock-in 해소 | 54+ DB 인프라 전체 재구축 필요 | 비현실적 |
| 옵시디언으로 전면 이전 | 로컬, md 호환 | DB 기능 없음, API 없음 | 구조화된 데이터 관리 불가 |
| Git만 SoT | 개발자 표준 | 비개발자 입력 어려움 | 바이브코더 워크플로우에 부적합 |

## 결과 (Consequences)

- **장점:** 기존 인프라 100% 활용, 노션 AI(노뚝이) 직접 DB 접근, 비개발자 친화적
- **단점·트레이드오프:** 노션 API 속도 제한, md 내보내기 포맷 이슈
- **후속 작업:** 옵시디언은 보조 뷰어로 병행 (6~7월 도입 예정)

## 관련 결정·문서

- ADR-004: MCP 서버 아키텍처 (노션과 코드 사이 단일 접점)
- ADR-007: 카파시 LLM-Wiki 패턴
