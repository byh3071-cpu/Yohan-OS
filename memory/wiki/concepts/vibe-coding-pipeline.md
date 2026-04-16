---
id: vibe-coding-pipeline
type: concept
aliases: [바이브코딩 파이프라인, Vibe Coding, 바이브 코딩]
created: 2026-04-12
updated: 2026-04-12
source_insights: [vibe-coding-pipeline, vibe-coding-planning-importance]
related_entities: [cursor, claude-code]
related_concepts: [harness-engineering, single-source-of-truth, cursor-skills]
---

# 바이브코딩 파이프라인 (Vibe Coding Pipeline)

## 정의 (1~2문장)
- 자연어 지시와 구조화된 마크다운 문서로 AI가 코드를 생성·수정하는 개발 방식. SoT 기반 맥락 주입 + 하네스 통제로 품질을 유지.

## Verified (소스 기반)
- 단일 환경 맥락 일치: Cursor 내에서 `.md` 즉시 참조 → 브라우저–에디터 오갈 필요 없음. [source: vibe-coding-pipeline]
- 자연어 시스템 설계: 구조화된 MD + 프롬프트만으로 아키텍처·비즈니스 로직 구현. [source: vibe-coding-pipeline]
- 빠른 이터레이션: 프롬프트·참조 문서 수정 → AI가 코드 재작성 → 개발 속도 극대화. [source: vibe-coding-pipeline]
- 바이브 코딩 맹점: 자연어 지시에 논리 구멍 → AI가 임의 코드/로직으로 충전. 요구사항은 명확히 문서화 필수. [source: vibe-coding-pipeline]
- 무엇을 만들지·완료 조건이 문서에 없으면 AI가 구멍을 임의로 메움 — 속도만 빨라지는 함정. [source: vibe-coding-planning-importance]
- 입력·출력·예외·비범위를 한 장에 적어 두면 반복 호출해도 결과가 흔들리지 않음. [source: vibe-coding-planning-importance]
- 우선순위와 트레이드오프는 사람이 기획으로 고정해야 되돌리기 비용이 줄어듦. [source: vibe-coding-planning-importance]

## Inferred (추론/연결) — TTL 30일
- 바이브코딩의 "기획 부재 → AI 임의 충전" 문제는 PROJECT-PIPELINE-SPEC의 Vision Lock으로 구조적 해결 가능.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)
- [vibe-coding-planning-importance](../../ingest/insights/vibe-coding-planning-importance.md)