---
id: ADR-001
date: 2026-04-12
tags: [adr, db, supabase, postgresql, pgvector]
status: Accepted
related:
  - docs/adr/ADR-002-qdrant-vector-db.md
---

# ADR-001: Supabase(PostgreSQL)를 메인 DB로 선택

- **상태:** Accepted
- **날짜:** 2026-04-12 (회고성 기록: 2026-05-06)
- **작성자:** Yohan

## 맥락 (Context)

요한 OS 웹앱의 메인 데이터베이스가 필요했다. 주식 시세·재무제표·수급 데이터(AutoTrader), SoT DB 메타데이터, 유저 인증, 벡터 확장(pgvector) 등 다양한 요구사항을 하나의 DB로 커버해야 했다.

## 결정 (Decision)

Supabase (managed PostgreSQL)를 메인 DB로 채택.

## 대안 (Alternatives)

| 대안 | 장점 | 단점 | 기각 사유 |
|------|------|------|-----------|
| MongoDB | 스키마 유연 | JOIN 약함, 트랜잭션 제한 | 관계형 쿼리 필수 |
| SQLite | 로컬, 심플 | 동시 접근 제한, 원격 접근 불가 | 멀티 서비스 연동 불가 |
| PlanetScale | MySQL 호환 | 벡터 확장 미지원 | pgvector 필요 |

## 결과 (Consequences)

- **장점:** SQL JOIN 자유, Supabase Auth·API 무료 티어, pgvector로 벡터 검색 확장 가능, Row Level Security
- **단점·트레이드오프:** Supabase 의존성 (managed 서비스), 무료 티어 제한 (500MB)
- **후속 작업:** Qdrant와 병행 테스트 (벡터 전용 vs pgvector 내장) → ADR-002

## 관련 결정·문서

- ADR-002: Qdrant를 벡터 DB로 선택
