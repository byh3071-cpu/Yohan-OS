---
id: modern-ai-ch15-mcp-gateway-willison
date: 2026-04-16
domain: mcp
tags: [mcp, json-rpc, tool-poisoning, simon-willison, host-client-server, yohan-os, agent-ops, inbox-md_files]
related: [rag, layered-context, harness-engineering, single-source-of-truth, mcp, modern-ai-ch16-skills-packaging, modern-ai-ch11-harness-willison-aci]
status: insight
---

# 현대AI개론 Ch.15 — MCP (인사이트)

## 목적

- **외부 연결·도구 스키마·보안 게이트**를 설계할 때 재사용할 규칙. 교재의 브랜드·수치·연도는 원문·출처 우선.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/15-MCP.md`

## 요약 (짧게)

- **문제의식:** 하네스만으로는 로컬 FS 중심; GitHub·Slack·DB 등은 **복붙 비서** 역전 구조(원문 서술).
- **이름:** Model + Context + Protocol → 외부와 컨텍스트 연결 규약.
- **구조:** JSON-RPC 2.0, **Host–Client–Server**, 6 프리미티브(Resources, Prompts, Tools, Sampling, Roots, Elicitation) — 양방향·재귀 가능.
- **문제 1:** 연결만으로 **도구 스키마가 통째로** 상주 → 토큰 과소비(뷔페 비유).
- **문제 2:** 도구=임의 코드 실행 — **Tool Poisoning** 등; 확인 UX vs 보안 딜레마(Willison 등).
- **문제 3:** 서버 구현 **복잡** — bash+스크립트 먼저(원문 조언).
- **올바른 쓰음:** **보안 게이트웨이**·노출 도구 **소수**·읽기/쓰기/실행 단계별 통제; 원격 MCP 드래프트 등 시점 민감.
- **다음 장:** 행동 **품질**은 Skills(16장).

## 핵심 논지 (원문 `##` 순서)

- 복붙 세계·어원·LSP 비유·2024 공개·초기 도입사.
- 기술 구조·6 프리미티브·그림(MCP vs Skills 분리).
- 토큰·보안·복잡성 3문제.
- 올바른 쓰는 법·게이트웨이 정의·Shankar 인용.

## Yohan OS 적용 · 토큰 효율

- **Yohan OS MCP:** 스키마 최소화·신뢰 경로만; 불필요 MCP 남발은 Ch.10 **Select**·도구 출력 비중과 충돌.
- **SoT:** `memory/`는 로컬 권위; 외부 API는 **명시적 동기화 규칙**(`memory/rules/`).

## 원문 대비 완전성

- 원문 `##` 순서와 대조. 수치·제품 단계는 **원문** 우선.

## 원본 유지보수

- 그림: `memory/inbox/06-mcp-skills.png` (`15` 기준 `../../../06-mcp-skills.png`).

## S티어 순서

- **교재 순서:** … → 15 → 16 → 17.
- **처리 순서 ✓:** Ch.18 → 11 → 10 → **15(본 문서)** → 16 → 17 — 후속 인사이트 작성 완료.

**위키 승격 완료 (2026-04-16):** 엔티티 `mcp`·`harness-engineering` 등 병합. `memory/wiki/log.md` 참조.
