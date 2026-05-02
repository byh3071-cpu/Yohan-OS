---
id: yohan-ai-dictionary
date: 2026-04-16
domain: yohan-ai-dictionary
tags: [dictionary, vision, roadmap]
related: [yohan-ai-dictionary-current-phase, phase3-checklist]
created: 2026-04-15
updated: 2026-04-16
status: active
---

# Yohan AI Dictionary — 나만의 AI 사전 뷰어

## 왜 만드는가
- 나만의 Verified AI 용어 사전을 **로컬 검색 + 문서 간 점프**로 즉시 참조해, 구글링 반복에서 해방되고 복리형 지식 베이스를 만든다.
- PROJECT-PIPELINE-SPEC + memory/wiki/ 철학의 **첫 공개 실증 앱**으로 포트폴리오/수익화 경로를 연다.

## 현재 상태 (2026-04-16)

- **Phase 1** ✅ — 로컬 Starlight, 초기 10 용어, 티켓 001~006·빌드·프리뷰 검증 완료.
- **Phase 2** ✅ — `phase2-term-candidates-notion-2026-04.md` 순서대로 용어 **7개** 추가(agent, mcp, embedding, ssot, ingest-pipeline, client-ai, schema). 총 **17** 용어. `source:`·상호 `## 관련 용어`·`npm run build` 반영.
- **memory/wiki** — Ch.15–18 인사이트 병합으로 MCP·RAG·스킬 축이 SoT에 정렬됨; 사전 `source:`와 정합 유지가 다음 유지보수 핵심.

## 성공 정의 (측정 가능) — 갱신

- ~~Phase 1: `localhost:4321`에서 10개 용어 md 검색·링크 점프 작동~~ ✅
- ~~Phase 2: 용어 대량 확장 + wiki 정합 `source:`~~ ✅ (17개·교재·위키 발췌 반영)
- **Phase 3 (다음):** Vercel 배포 + GitHub 템플릿화 + 빌드/학습 블로그 3편(또는 동등한 공개·복제 가능 패키지)
- **지속:** 월 1회 `npm run build` · 용어–`memory/wiki` 문장 드리프트 시 한 건씩 동기화

## 핵심 제약 (절대 타협 X)
- **SoT 단일화**: 4개 겹치는 용어(harness-engineering, vibe-coding-pipeline, rag, layered-context)는 `memory/wiki/`가 원천. 사전뷰어 md는 반드시 `source:` 프론트매터로 원천 링크.
- **AI스러운 디자인 금지**: Starlight 기본 테마 유지 + 최소 커스텀. 장식 X, 타이포·간격 중심.
- **비공개 데이터 유출 금지**: `memory/decisions/`, 개인 노션 키, `.env` 등은 공개 repo에 절대 포함 안 됨.

## 사용자
- **1차**: 요한 본인 (매일 10~20분 구글링 대체)
- **2차**: 바이브코딩/AI 학습자 (GitHub 템플릿 + 크몽/Gumroad 고객)

## 기술 스택
- Astro Starlight (MIT) / Node v24 / npm
- 데이터: md 파일 (`yohan-ai-dictionary/src/content/docs/`)
- 원천: `memory/wiki/concepts/*.md`, `memory/wiki/entities/*.md`
- 배포: GitHub 공개 repo → Vercel (**Phase 3**)

## 단계 (Phase) — 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| 기획·설계·MVP | 티켓 001~006 | ✅ |
| Phase 2 용어 | 후보 7개 + 역링크 | ✅ |
| Phase 3 | 배포·템플릿·블로그 | 대기 |
| 피드백 루프 | 실사용 한 주 → 불편 리스트 | 권장 |

## 비범위 (당장 안 하는 것)
- Phase 3 이전 **공개 도메인 배포**
- 디자인 토큰 대규모 커스텀
- 용어 자동 수집 스크립트(원하면 Phase 3 이후)
