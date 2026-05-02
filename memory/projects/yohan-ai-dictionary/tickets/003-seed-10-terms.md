---
ticket_id: 003
title: 용어 10개 시드 작성
phase: 3-구현
priority: high
status: done
created: 2026-04-15
closed: 2026-04-16
depends_on: [002]
---

## 목표
- 10개 핵심 용어 md 파일을 `yohan-ai-dictionary/src/content/docs/`에 배치한다. 이 중 4개는 `memory/wiki/`가 원천이므로 `source:` 태그 필수.

## 범위
- **하는 것:** 아래 10개 용어 md 작성 (정의 + 2~3문단 + `[[링크]]` 2~4개).
- **안 하는 것:** Phase 2 대상 용어 20개 추가, 이미지 삽입, Mermaid 다이어그램.

## 용어 목록 및 원천 매핑

| # | 용어 | 파일명 | 원천 | source 태그 |
|---|---|---|---|---|
| 1 | 하네스엔지니어링 | `harness-engineering.md` | `memory/wiki/concepts/harness-engineering.md` | ✅ |
| 2 | 바이브코딩 | `vibe-coding.md` | `memory/wiki/concepts/vibe-coding-pipeline.md` | ✅ |
| 3 | 컨텍스트엔지니어링 | `context-engineering.md` | `memory/wiki/concepts/layered-context.md` | ✅ |
| 4 | RAG | `rag.md` | `memory/wiki/entities/rag.md` | ✅ |
| 5 | LLM | `llm.md` | (신규) → 동시에 memory/wiki/ 에도 생성 권장 | — |
| 6 | 토큰 | `token.md` | (신규) | — |
| 7 | 프롬프트 | `prompt.md` | (신규) | — |
| 8 | 파인튜닝 | `fine-tuning.md` | (신규) | — |
| 9 | 할루시네이션 | `hallucination.md` | (신규) | — |
| 10 | API | `api.md` | (신규) | — |

## 제약
- **vision.md 핵심 제약:** 4개 겹치는 용어는 `source:` 필수. 원천 변경 시 사전뷰어 md도 갱신.
- **AI스러운 디자인 금지:** 본문에 이모지/장식 금지. Markdown 표/코드블록/인용은 OK.
- **길이:** 정의 1~2문장 → 본문 2~3문단 → `## 관련 용어` 섹션에 `[[링크]]` 2~4개.

## 완료 기준
- [x] `src/content/docs/` 하위에 10개 md 파일 존재
- [x] 4개 파일에 `source:` 프론트매터 기입
- [x] 각 파일당 `[[...]]` 링크 2~4개
- [x] `npm run dev`로 각 페이지 렌더 확인 (최소 3개 샘플링)
- [x] 검색창에서 "하네스" 검색 → harness-engineering.md 결과 노출 확인

## AI 리포트
- Phase 1 종료 SoT·`feedback-log.md`와 정합. 10개 시드 완료(2026-04-16).
