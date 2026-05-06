---
id: modern-ai-ch15-mcp-gateway-willison
date: 2026-05-06
domain: mcp
tags: [mcp, json-rpc, tool-poisoning, simon-willison, host-client-server, yohan-os, agent-ops, inbox-md_files]
related: [rag, layered-context, harness-engineering, single-source-of-truth, mcp, modern-ai-ch16-skills-packaging, modern-ai-ch11-harness-willison-aci, insight-summary-quality]
status: insight
---

# 현대AI개론 Ch.15 — MCP (인사이트)

## 목적

외부 연결·도구 스키마·보안 경계를 설계할 때 되새기는 규칙 모음이다. 숫자·제품 단계·브랜드 표기는 **항상** 원문(`15-MCP.md`)과 명세·출처를 우선한다.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/15-MCP.md`

## 요약

하네스만으로는 로컬 파일 중심 작업에는 충분하지만, GitHub·Slack·DB처럼 바깥 세계와 붙을 때는 사용자가 정보를 복사해 붙이는 **복붙 비서** 역할을 하게 된다. MCP(Model Context Protocol)는 이름 그대로 **모델의 컨텍스트를 외부 시스템과 잇는 규약**으로, JSON-RPC 2.0 위의 Host–Client–Server 삼자 구조와 여섯 프리미티브(Resources, Prompts, Tools, Sampling, Roots, Elicitation)로 표준화한다. 서버가 도구만 내주는 한 방향이 아니라 Sampling 등으로 **양방향·재귀적** 워크플로도 열린다.

실무에서는 세 가지가 반복해서 문제로 드러난다. 첫째, 연결만 해도 **도구 스키마가 통째로 컨텍스트에 상주**해 토큰을 잡아먹는다(원문의 뷔페 비유). 둘째, 도구 호출은 곧 임의 코드 실행에 가깝기 때문에 Tool Poisoning 같은 위험이 있고, Willison이 지적했듯 **확인 UX와 보안 사이의 긴장**이 있다. 셋째, MCP 서버 하나 만드는 비용이 커서, 원문은 **bash·스크립트로 먼저 시도하고 필요할 때 MCP**를 권한다.

그래서 MCP를 **만능 USB처럼 전 기능 미러**가 아니라 Shankar가 요약한 **보안 게이트웨이**로 쓰는 것이 옳다: 노출 도구는 소수로, 읽기·쓰기·실행은 단계별로 통제하고, 원격 MCP처럼 초안·민감한 것은 시점을 명시한다. **연결과 실행 범위(MCP)** 와 **행동 품질(Skills, 16장)** 은 분업 관계다.

## 원문 흐름 (## 순서 맵)

1. 복붙 세계 → 이름·어원 → LSP 비유 → 2024 공개·초기 도입사.
2. 기술 골격: 3자 구조, 6 프리미티브, MCP vs Skills 그림.
3. 토큰·보안·구현 복잡성 세 가지 난제.
4. 올바른 쓰임·게이트웨이 정의·Shankar 인용과 다음 장 예고.

## Yohan OS 적용 · 토큰 효율

- **Yohan OS MCP:** 도구 스키마는 최소만 노출하고 신뢰 경로로 한정한다. MCP를 남발하면 Ch.10에서 다룬 컨텍스트 선택·도구 출력 비중과 바로 충돌한다.
- **SoT:** 권위 있는 상태는 `memory/`에 두고, 외부 API 결과는 `memory/rules/`에 적어 둔 동기화 규칙으로만 반영한다.

## 원본 유지보수

- 그림 파일: `memory/inbox/06-mcp-skills.png` (본문에서는 `15-MCP.md` 기준 `../../../06-mcp-skills.png`).

## 처리 순서 (교재 vs 작업)

- **교재 순서:** … → 15 → 16 → 17.
- **작업 순서(완료):** Ch.18 → 11 → 10 → **15(본 문서)** → 16 → 17.

**위키 승격 (2026-04-16):** 엔티티 `mcp`·`harness-engineering` 등 병합. 세부는 `memory/wiki/log.md`.
