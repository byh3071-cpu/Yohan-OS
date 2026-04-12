---
id: harness-engineering
type: concept
aliases: [하네스 엔지니어링, Context Engineering, 컨텍스트 엔지니어링]
created: 2026-04-12
updated: 2026-04-12
source_insights: [knowledge-base-strategy, exploration-vs-exploitation, vibe-coding-pipeline]
related_entities: [cursor]
related_concepts: [single-source-of-truth, exploration-vs-exploitation, layered-context, vibe-coding-pipeline]
---

# 하네스 엔지니어링 (Harness Engineering)

## 정의 (1~2문장)
- AI 에이전트의 행동을 규칙·맥락·구조로 통제하면서도 유연성을 유지하는 엔지니어링 방법론. "바닥(비전·안전) + 그 위의 유연함"이 핵심.

## Verified (소스 기반)
- `.cursorrules` 글로벌 통제: 프로젝트 루트에 절대 규칙 파일 생성하여 AI 행동 제한. [source: vibe-coding-pipeline]
- 기능 구현 전 docs/ 또는 memory/rules/ 등 필수 참조 규칙. [source: vibe-coding-pipeline]
- 에러 시 임의 수정 금지 → 원인·해결 방안 먼저 제시하는 규칙. [source: vibe-coding-pipeline]
- 실시간 동기화 + 하네스 자동화: MD 수정 → 자동 Vector DB 인덱싱으로 LLM 배경지식 동기화. [source: knowledge-base-strategy]
- 컨텍스트/하네스 엔지니어링으로 뼈대를 잡되 AI에게 독창성을 부여하는 4가지 방법론 (매개변수 라우팅, 멀티 에이전트, 구조화된 창의성, Cross-Domain RAG). [source: exploration-vs-exploitation]
- 검토자(Critic/Harness)가 비즈니스 로직·현실성·사용자 제약 기준으로 필터링. [source: exploration-vs-exploitation]

## Inferred (추론/연결) — TTL 30일
- Yohan OS의 agent-harness.md가 이 개념의 직접 구현체. memory/rules/ 전체가 하네스 레이어.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [exploration-vs-exploitation](../../ingest/insights/exploration-vs-exploitation.md)
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)