---
id: cursor
type: entity
entity_type: tool
created: 2026-04-12
updated: 2026-04-12
source_insights: [knowledge-base-strategy, vibe-coding-pipeline, last30days-github-skill-why-how]
related_entities: [obsidian, claude-code, andrej-karpathy]
related_concepts: [vibe-coding-pipeline, harness-engineering, single-source-of-truth, layered-context]
---

# Cursor

## 정의 (1~2문장)
- AI 코딩 IDE. `.cursorrules`와 `@` 참조로 프로젝트 맥락을 LLM에 주입하여 바이브코딩 파이프라인의 핵심 실행 엔진 역할.

## Verified (소스 기반)
- `.cursorrules` 또는 전용 인덱싱 기능 활용 → 로컬 지식 베이스를 LLM 배경지식으로 즉시 동기화. [source: knowledge-base-strategy]
- 메타데이터·목차를 우선 읽게 하면 관련 노트 탐색이 쉬움. [source: knowledge-base-strategy]
- Cursor IDE 기본 LLM = Claude Sonnet (코딩 + 맥락 이해 최적). [source: vibe-coding-pipeline]
- `.cursorrules` 글로벌 통제 (Harnessing): 프로젝트 루트에 절대 규칙 파일 생성. [source: vibe-coding-pipeline]
- `Cmd+K` 또는 `@파일`/`@폴더`로 해당 작업에 필요한 최소 맥락만 주입 — 점진적 컨텍스트 주입. [source: vibe-coding-pipeline]
- Claude Code / 기타 CLI 스킬과 함께 리서치 도구로 활용 가능. [source: last30days-github-skill-why-how]

## Inferred (추론/연결) — TTL 30일
- Cursor + Claude Code 조합이 Yohan OS의 "교차 검증" 패턴(Cursor 개발 → Claude 검증, 또는 역)을 가능하게 함.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)
- [last30days-github-skill-why-how](../../ingest/insights/last30days-github-skill-why-how.md)