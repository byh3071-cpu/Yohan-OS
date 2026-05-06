---
id: ADR-002
date: 2026-04-30
tags: [adr, vector-db, qdrant, rag]
status: Accepted
related:
  - docs/adr/ADR-001-supabase-postgresql.md
  - docs/adr/ADR-007-karpathy-llm-wiki.md
---

# ADR-002: Qdrant를 벡터 DB로 선택

- **상태:** Accepted
- **날짜:** 2026-04-30 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

요한 OS 54+ DB의 지식을 벡터화하여 RAG 검색을 구현해야 했다. Supabase pgvector와 전용 벡터 DB 중 선택이 필요했다.

## 결정 (Decision)

Qdrant (Docker 셀프호스트)를 1차 벡터 DB로 채택. Supabase pgvector는 보조·병행 테스트용으로 유지.

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| Supabase pgvector | DB 통합, SQL 직접 제어 | 벡터 전용 최적화 부족 | 대규모 컬렉션 성능 우려 |
| Pinecone | 관리형, 스케일 | 유료, 클라우드 의존 | 비용 + 셀프호스트 선호 |
| ChromaDB | 심플, 로컬 | 프로덕션 안정성 부족 | Docker 운영 시 Qdrant 우위 |

## 결과 (Consequences)

- **장점:** 벡터 검색 전용 최적화, Docker 로컬 무료 구동, REST API, 컬렉션별 분리 관리
- **단점·트레이드오프:** Docker 컨테이너 관리 필요, Supabase와 별도 인프라
- **후속 작업:** n8n 39강 RAG 실습 완료(05-03), 인제스트 파이프라인 구축 예정

## 관련 결정·문서

- ADR-001: Supabase PostgreSQL
- ADR-007: 카파시 LLM-Wiki 패턴
