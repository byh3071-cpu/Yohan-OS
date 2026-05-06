---
id: ADR-007
date: 2026-04-12
tags: [adr, llm-wiki, karpathy, knowledge-compounding]
status: Accepted
related:
  - docs/adr/ADR-002-qdrant-vector-db.md
  - docs/adr/ADR-006-notion-as-sot-mirror.md
---

# ADR-007: 카파시 LLM-Wiki 패턴 적용

- **상태:** Accepted
- **날짜:** 2026-04-12 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

안드레 카파시가 제안한 LLM-Wiki 모델 — AI가 검색만 하는 RAG를 넘어 md 위키 파일 자체를 직접 수정·병합·링크하여 지식을 복리 축적하는 구조. 요한 OS의 RESOURCE → SUMMARY 파이프라인과 방향이 일치.

## 결정 (Decision)

카파시 LLM-Wiki 패턴을 요한 OS에 적용. 단, 제미나이가 확장 해석한 "3구역(Inbox/Wiki/Rules)"은 카파시 원본이 아님을 명시하고, 요한 OS 고유의 구조로 변형.

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| RAG만 사용 | 구현 단순 | 지식 휘발, 위키 미성장 | 복리 축적 불가 |
| 수동 위키 관리 | 정확도 높음 | 시간 비용 막대 | 1인 기업에 비현실적 |
| 노션 AI만 활용 | 즉시 사용 | 파일 직접 편집 불가 | 코드 프로젝트 위키에 부적합 |

## 결과 (Consequences)

- **장점:** 시간이 갈수록 위키 자체가 정교해짐, EXECUTION LOG 패턴 → 프로토콜 자동 개선 가능
- **단점·트레이드오프:** 환각 리스크 (AI가 원본 훼손), 토큰 비용 증가
- **후속 작업:** Git 버전 관리 필수, Source Lock 검증 체계 추가, 옵시디언 볼트 동기화

## 관련 결정·문서

- ADR-002: Qdrant 벡터 DB
- ADR-006: 노션 = SoT 미러 + 입력 인터페이스
- `memory/wiki/` — 본 프로젝트의 위키 레이어 구현
