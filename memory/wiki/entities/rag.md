---
id: rag
type: entity
entity_type: technology
created: 2026-04-12
updated: 2026-04-16
source_insights: [knowledge-base-strategy, exploration-vs-exploitation, modern-ai-ch18-knowledge-management-karpathy-wiki, modern-ai-ch17-rag-select-pipeline]
related_entities: [mcp]
related_concepts: [layered-context, exploration-vs-exploitation]
---

# RAG (Retrieval-Augmented Generation)

## 정의 (1~2문장)
- 외부 문서를 검색하여 LLM 응답에 근거를 제공하는 기술. Yohan OS에서는 2·3계층 동적 로드 방식으로 활용.

## Verified (소스 기반)
- 다층적 맥락 구조에서 2·3계층(Domain/Deep, Dynamic/Transient)을 RAG로 필요 시 동적 로드. [source: knowledge-base-strategy]
- MD 기반 파이프라인: `.md` 수정 → 자동 Vector DB 인덱싱으로 LLM 배경지식 동기화. [source: knowledge-base-strategy]
- Cross-Domain RAG: 단일 도메인만 참조하지 않고, 이종 범주 문서를 함께 검색하도록 RAG 파이프라인 구성 — 이질적 데이터를 엮어 논리적 도약 수행. [source: exploration-vs-exploitation]
- RAG 실패는 검색 실패·소스 무시·청킹 손실의 세 지점으로 정리되며, 지식이 구조화되지 않으면 악화된다는 서술. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- 같은 개념을 서로 다른 표기로 쓰면 벡터 검색 정확도가 떨어지고, 가공 계층에서 정규 이름 하나와 별칭 링크로 통일한다는 서술. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- 구조화된 지식이 RAG의 전처리 역할을 하며, 검색 품질의 상한은 검색 알고리즘이 아니라 지식 구조가 결정한다는 서술. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- **하이브리드 검색**(벡터+키워드 등)·**재순위**가 실무에서 쓰인다는 서술. [source: modern-ai-ch17-rag-select-pipeline]
- **에이전틱 RAG**(다회 검색·루프)와 필요한 근거만 고르는 **Select** 축이 논의된다. [source: modern-ai-ch17-rag-select-pipeline]

## Inferred (추론/연결) — TTL 30일
- LLM Wiki 패턴은 RAG의 "매번 재검색" 한계를 보완하는 상위 레이어. RAG가 query-time이라면 wiki는 compile-time 지식 축적.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [exploration-vs-exploitation](../../ingest/insights/exploration-vs-exploitation.md)
- [modern-ai-ch18-knowledge-management-karpathy-wiki](../../ingest/insights/modern-ai-ch18-knowledge-management-karpathy-wiki.md)
- [modern-ai-ch17-rag-select-pipeline](../../ingest/insights/modern-ai-ch17-rag-select-pipeline.md)