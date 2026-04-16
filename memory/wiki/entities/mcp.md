---
id: mcp
type: entity
entity_type: technology
created: 2026-04-16
updated: 2026-04-16
source_insights: [modern-ai-ch15-mcp-gateway-willison]
related_entities: [cursor, claude-code, rag]
related_concepts: [harness-engineering, layered-context, single-source-of-truth]
---

# MCP (Model Context Protocol)

## 정의 (1~2문장)
- LLM 애플리케이션이 로컬·원격의 도구·리소스·프롬프트에 **표준 방식**으로 붙기 위한 개방형 프로토콜로 서술된다. JSON-RPC 2.0과 Host–Client–Server 구조로 정리된다.

## Verified (소스 기반)
- 이름은 Model·Context·Protocol의 약자로, 외부와 **컨텍스트 연결 규약**으로 이해된다. [source: modern-ai-ch15-mcp-gateway-willison]
- Resources, Prompts, Tools, Sampling, Roots, Elicitation 등 **프리미티브**로 기능이 나뉘며, 양방향·재귀적 구성이 가능하다는 서술이 있다. [source: modern-ai-ch15-mcp-gateway-willison]
- 연결만 해도 **도구 스키마가 통째로** 컨텍스트에 상주해 토큰을 많이 쓸 수 있다는 문제 제기가 있다. [source: modern-ai-ch15-mcp-gateway-willison]
- 도구 호출은 임의 코드 실행에 가까워 **Tool Poisoning** 등 보안 이슈와 확인 UX 사이의 긴장이 논의된다. [source: modern-ai-ch15-mcp-gateway-willison]
- **보안 게이트웨이**·노출 도구 **소수**·읽기/쓰기/실행 **단계별 통제**가 올바른 운용으로 제시된다. [source: modern-ai-ch15-mcp-gateway-willison]
- 하네스만으로는 로컬 FS 중심에 머물 수 있고, GitHub·Slack 등 외부는 **복붙 비서** 역전 구조가 되기 쉽다는 문제의식이 제기된다. [source: modern-ai-ch15-mcp-gateway-willison]

## Inferred (추론/연결) — TTL 30일
- Yohan OS MCP(`yohan-os`)는 `memory/` SoT와 직결되는 실행 경로로 볼 수 있음.
- created: 2026-04-16, expires: 2026-05-16

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [modern-ai-ch15-mcp-gateway-willison](../../ingest/insights/modern-ai-ch15-mcp-gateway-willison.md)
