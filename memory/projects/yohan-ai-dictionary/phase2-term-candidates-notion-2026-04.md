---
id: yohan-ai-dictionary-phase2-term-candidates-notion-2026-04
date: 2026-04-16
domain: yohan-ai-dictionary
tags: [dictionary, phase2, backlog, notion, executed]
related: [yohan-ai-dictionary]
status: archived
completed: 2026-04-16
source: 노션 AI (Opus 4.6) 제안 — 연결 밀도·학습 우선순위 기준
---

# Phase 2 용어 후보 7개 (노션 AI 정렬)

기존 10개와 **연결이 많이 생기는 순**으로 정렬.

| # | 용어 | 기존 10개와 연결 | 노션·소스 메모 |
|---|------|------------------|----------------|
| 1 | 에이전트 (Agent) | LLM, 프롬프트, RAG, 바이브코딩, 컨텍스트엔지니어링 | A2A 페이지에서 파생 가능 |
| 2 | MCP | API, LLM, 에이전트, 하네스엔지니어링, 컨텍스트엔지니어링 | `memory/wiki` 원천 있음 |
| 3 | 임베딩 (Embedding) | RAG, LLM, 토큰, 파인튜닝 | RAG 페이지에서 파생 |
| 4 | SSoT | 하네스엔지니어링, 컨텍스트엔지니어링, 스키마 | 여러 페이지에서 반복 언급 |
| 5 | 인제스트 파이프라인 | RAG, API, 컨텍스트엔지니어링 | AI 사전에 있음 |
| 6 | 클라이언트 AI | LLM, 컨텍스트엔지니어링, 하네스엔지니어링, 에이전트 | AI 사전에 있음 |
| 7 | 스키마 (Schema) | 하네스엔지니어링, SSoT, 인제스트 파이프라인 | AI 사전에 있음 |

## 왜 이 7개인가

- **에이전트 + MCP** — n8n·자동화 학습 축과 맞닿음. 기존 5개 이상과 연결.
- **임베딩** — RAG·토큰·파인튜닝·LLM과 동시 연결. RAG 설명 완성도에 필요.
- **SSoT + 스키마 + 인제스트** — Yohan OS 운영 어휘, 하네스와 직결.
- **클라이언트 AI** — 장기 비전 핵심 용어.

## 연결 밀도 (참고 수치)

- 현재: 10개 × 이론상 ~45연결
- 추가 후(17개): ~136연결 규모로 증가(노션 AI 추정)

## 작성 전략 (노션 AI)

- **5·6·7번** — 노션 AI 사전에 페이지 있음 → `source:` 붙이고 이식이 빠름.
- **1~4번** — 신규 작성이나 **기존 지식 허브·wiki**에서 발췌.

## 실행 완료 (2026-04-16)

- **사전:** `yohan-ai-dictionary/src/content/docs/terms/` — 위 표 1→7 순서대로 반영(agent, mcp, embedding, ssot, ingest-pipeline, client-ai, schema). `source:`·`## 관련 용어` 상호 링크·Phase 1 용어 역링크 보강.
- **SoT:** `current-phase.md`, 상위 `memory/active-project.yaml` — Phase 2 용어 7개 완료로 갱신.
- **검증:** `npm run build`(Starlight·`dist/` 생성 확인).

## 유지보수 (필요 시)

- 사전·`memory/wiki` 문구 드리프트 시 동기화.
- 다음 배치(Phase 3) 후보는 별도 노트에 적는다.
