---

## id: modern-ai-ch10-context-engineering-karpathy
date: 2026-04-16
domain: context-engineering
tags: [karpathy, context-engineering, lance-martin, write-select-compress-isolate, layered-context, jit-context, yohan-os, agent-ops, inbox-md_files]
related: [layered-context, harness-engineering, rag, single-source-of-truth, modern-ai-ch11-harness-willison-aci, modern-ai-ch18-knowledge-management-karpathy-wiki]
status: insight

# 현대AI개론 Ch.10 — 컨텍스트 엔지니어링 (인사이트)

## 목적

- **윈도우 전체(형식·순서·예산)** 설계 규칙. 프롬프트 문구만이 아닌 **정보 건축**을 에이전트·SoT에 반영할 때 사용.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/10-컨텍스트-엔지니어링.md`
- **챕터 끝 Source:** Karpathy, Chase, Martin, Chroma 등(원문 블록).

## 요약 (짧게)

- **정의:** 추론 시점에 모델이 보는 **토큰 집합 전체**를 큐레이션·유지(Karpathy 등 서술). *just the right* + *for the next step*.
- **많이 넣기 ≠ 좋음:** 논리 일관·대용량에서 성능 붕괴 관찰(Chroma 등 — 수치는 원문).
- **동적:** 스텝마다 넣을 정보가 바뀜; 이전에 필요했던 정보가 다음엔 노이즈.
- **프롬프트 vs CE:** Chase 정리 — 프롬프트는 부분집합, CE는 **정보 건축**·포함 관계.
- **윈도우 구성 5요소:** 시스템·도구 정의·검색 문서·대화·**도구 출력(대부분 비중)** — 원문 강조.
- **4축 (Martin):** Write · Select · Compress · Isolate — 신호/잡음·유한 윈도우.
- **압축 순서:** 도구 출력 → 오래된 턴 → 검색 문서; 시스템 프롬프트는 압축 시 기본 행동 위험.
- **JIT 컨텍스트:** 식별자만 들고 런타임 적재; LC vs RAG 이분법 반박·**검색 전략** 변수.
- **70~80% 법칙·KV-Cache·프리픽스 캐싱:** 안정 블록을 앞에, 변동을 뒤에.
- **한계:** 수동 4축은 장기 세션에 한계 → **다음 장 하네스**로 연결.

## 핵심 논지 (원문 `##` 순서)

- 정보 건축·Chroma·동적 컨텍스트·이미지(5영역).
- 프롬프트 vs CE 비교 표.
- 윈도우 실제 구성·도구 출력 비중·노이즈 누적.
- 4축 상세·Cognition vs Anthropic 논쟁(공유 vs 격리).
- 압축 우선순위·KVTC 언급.
- JIT·RAG/LC·Self-Route.
- CLAUDE.md 실전·절대 경로 등.
- 100개 파일 4축 적용 표.
- 70~80%·KV·프리픽스 캐싱.
- “진짜 엔지니어링”·Anthropic 최소 고신호 집합·Chase 정의.
- 한계(수동) → 하네스 예고.

## Yohan OS 적용 · 토큰 효율

- `**@`·wiki 선별·ingest 분리:** Select + Write(규칙은 파일·윈도우 밖)와 정합.
- **긴 도구 출력·인제스트:** Compress·요약·필요 시 Isolate(서브작업).
- **세션 예산:** 한 번에 전부 주입 금지; `layered-context`·Ch.18과 연결.
- **프리픽스:** 반복되는 `memory/rules/`·시스템층을 **앞쪽·안정**에 두는 설계가 비용에 유리.

## 원문 대비 완전성

- 원문 `10-컨텍스트-엔지니어링.md`의 `##` 순서와 위 불릿 대조로 재검증. 연구 수치·제품명은 원문·출처 우선.

## 원본 유지보수

- 그림: `memory/inbox/02-context-window.png` (`10` 기준 `../../../02-context-window.png`).

## S티어 순서

- **교재 읽기 순서(챕터 번호):** 10 → 11 → … → 15 → 16 → 17 (10장 끝에서 다음이 11 하네스).
- **인박스 처리 순서(작업 ✓):** 우선순위에 따라 Ch.18 → Ch.11 → Ch.10을 먼저 다룸. 위 ✓ 표시는 **처리한 순서**이며 챕터 번호 순과 다를 수 있다. 위키·`related`는 **챕터 id·원문 경로** 기준으로 맞춘다.

1. Ch.18 지식 관리 ✓ · **Ch.11 하네스** ✓ · **Ch.10 컨텍스트 엔지니어링** ✓ (본 인사이트)
2. **Ch.15 MCP** ✓ — `modern-ai-ch15-mcp-gateway-willison.md`
3. **Ch.16 Skills** ✓ — `modern-ai-ch16-skills-packaging.md`
4. **Ch.17 RAG** ✓ — `modern-ai-ch17-rag-select-pipeline.md`

**S티어 인박스 일련:** 위 항목 처리 완료. 추가 승격은 위키·프로젝트 우선순위에 따름.