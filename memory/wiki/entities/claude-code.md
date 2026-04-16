---
id: claude-code
type: entity
entity_type: tool
created: 2026-04-12
updated: 2026-04-16
source_insights: [last30days-github-skill-why-how]
related_entities: [cursor, mcp]
related_concepts: [vibe-coding-pipeline, harness-engineering]
---

# Claude Code

## 정의 (1~2문장)
- Anthropic의 CLI 기반 AI 코딩 도구. Cursor와 함께 Yohan OS의 실행 엔진으로, MCP를 통해 memory/ 맥락을 직접 읽고 작업 수행.

## Verified (소스 기반)
- Claude Code / 기타 CLI 스킬로 리서치·브리핑 자동화 가능. [source: last30days-github-skill-why-how]

## Inferred (추론/연결) — TTL 30일
- Cursor(IDE) + Claude Code(CLI) 이중 체계로, 개발은 Cursor에서 수행하고 검증·자동화·배치 작업은 Claude Code에서 수행하는 역할 분담이 가능.
- MCP `yohan-os`를 통해 memory/ 전체를 get_context로 읽는 구조는 Claude Code가 세션 간 맥락을 유지하는 핵심 메커니즘.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [last30days-github-skill-why-how](../../ingest/insights/last30days-github-skill-why-how.md)