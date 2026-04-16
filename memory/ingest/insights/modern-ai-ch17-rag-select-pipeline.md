---
id: modern-ai-ch17-rag-select-pipeline
date: 2026-04-16
domain: rag
tags: [rag, retrieval, chunking, hybrid-search, rerank, agentic-rag, lance-martin, lewis-2020, inbox-md_files, yohan-os]
related: [rag, layered-context, single-source-of-truth, mcp, cursor-skills, modern-ai-ch10-context-engineering-karpathy, modern-ai-ch18-knowledge-management-karpathy-wiki]
status: insight
---

# 현대AI개론 Ch.17 — RAG (인사이트)

## 목적

- **검색·청킹·생성 실패**를 동시에 볼 때의 규칙. `memory/wiki/entities/rag.md`·Ch.10 Select 축과 연결.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/17-RAG.md`

## 요약 (짧게)

- **기원:** 컷오프·환각 → Lewis 등 RAG 파이프라인(NeurIPS 2020 인용은 원문).
- **실패 1 검색:** 잘못된 문서면 전체 오염 — 벡터≠의미 항상 일치 아님.
- **실패 2 생성:** 소스 무시·사전학습 우선(충실성 환각 변종).
- **실패 3 청킹:** 문맥 분리·표/코드 취약.
- **LC vs RAG:** Li 등 — 비용·Self-Route 하이브리드(원문).
- **하이브리드+재순위:** 벡터+BM25 등 실무 표준 서술.
- **에이전틱 RAG:** 다회 검색·루프; Martin **Select 축**으로의 흡수 인용.
- **쓸 때/말 때:** 비용·정확도·도메인에 따른 선택 표.
- **다음:** 지식 **구조화**(18장)로 연결.

## 핵심 논지 (원문 `##` 순서)

- 구조적 결함·검색 실패·무시·청킹·LC 비교·그림·하이브리드·에이전틱·용도 표·다음 장 예고.

## Yohan OS 적용 · 토큰 효율

- **wiki·ingest·RAG:** Ch.18과 같이 **구조가 검색 상한**; 용어 통일·개념 단위 문서.
- **Select:** 필요한 청크·문서만 — 긴 통째 주입 지양.

## 원문 대비 완전성

- 원문 `##` 순서와 대조.

## 원본 유지보수

- 그림: `memory/inbox/14-rag.png` (`17` 기준 `../../../14-rag.png`).

## S티어 순서

- **교재 순서:** … → 17 → (Part 다음은 18 지식 관리 등).
- **처리 순서 ✓:** Ch.18·11·10·15·16·**17(본 문서)** — **S티어 인박스 일련 처리 완료.**

**위키 승격 완료 (2026-04-16):** `entities/rag.md`·`concepts/layered-context.md` Verified 병합. `memory/wiki/log.md` 참조.
