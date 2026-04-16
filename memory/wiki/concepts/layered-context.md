---
id: layered-context
type: concept
aliases: [다층적 맥락 구조, Layered Context, 점진적 컨텍스트 주입]
created: 2026-04-12
updated: 2026-04-16
source_insights: [knowledge-base-strategy, vibe-coding-pipeline, modern-ai-ch18-knowledge-management-karpathy-wiki, modern-ai-ch17-rag-select-pipeline]
related_entities: [cursor]
related_concepts: [single-source-of-truth, harness-engineering, exploration-vs-exploitation]
---

# Layered Context (다층적 맥락 구조)

## 정의 (1~2문장)
- 맥락을 계층별로 분리하여 필요한 시점에 필요한 깊이만 LLM에 주입하는 구조. 컨텍스트 윈도우 한계와 Attention 분산을 구조적으로 해결.

## Verified (소스 기반)
- 1계층 (Static/Core): 불변 — 철학, 가치관, 원칙. System Prompt 상시 주입. [source: knowledge-base-strategy]
- 2계층 (Domain/Deep): 전문 지식. RAG로 필요 시 동적 로드. [source: knowledge-base-strategy]
- 3계층 (Dynamic/Transient): 현재 프로젝트 상태 — 개발 로그, 금주 업무 특이사항. RAG로 동적 로드. [source: knowledge-base-strategy]
- 전체 `.md` 일괄 주입 → Attention 분산 → 할루시네이션 유발. [source: vibe-coding-pipeline]
- `@파일`/`@폴더`로 해당 작업에 필요한 최소 맥락만 주입하는 점진적 컨텍스트 주입 방식. [source: vibe-coding-pipeline]
- SoT 방대 시 대비: 핵심 문서 압축한 목차(Index) 문서 + 메타데이터 별도 유지 → AI가 목차 우선 읽기. [source: vibe-coding-pipeline]
- 지식이 잘 구조화되어 있으면 필요한 정보만 넣을 수 있어 불필요 토큰·KV-Cache 비용을 줄인다는 서술. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- RAG와 **LC(대규모 컨텍스트)** 비교·비용·**Self-Route·하이브리드** 전략이 논의된다. [source: modern-ai-ch17-rag-select-pipeline]
- **에이전틱 RAG** 맥락에서 필요한 청크·문서만 고르는 **Select** 축이 강조된다는 서술. [source: modern-ai-ch17-rag-select-pipeline]

## Inferred (추론/연결) — TTL 30일
- Yohan OS에서 1계층 = agent-harness.md, 2계층 = memory/rules/ + wiki/, 3계층 = memory/inbox/ + active-project로 대응 가능.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)
- [modern-ai-ch18-knowledge-management-karpathy-wiki](../../ingest/insights/modern-ai-ch18-knowledge-management-karpathy-wiki.md)
- [modern-ai-ch17-rag-select-pipeline](../../ingest/insights/modern-ai-ch17-rag-select-pipeline.md)