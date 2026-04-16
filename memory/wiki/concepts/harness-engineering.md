---
id: harness-engineering
type: concept
aliases: [하네스 엔지니어링, Context Engineering, 컨텍스트 엔지니어링]
created: 2026-04-12
updated: 2026-04-16
source_insights: [knowledge-base-strategy, exploration-vs-exploitation, vibe-coding-pipeline, root-ai-harness-engineering-youtube-intro, modern-ai-ch18-knowledge-management-karpathy-wiki, modern-ai-ch15-mcp-gateway-willison]
related_entities: [cursor, mcp]
related_concepts: [single-source-of-truth, exploration-vs-exploitation, layered-context, vibe-coding-pipeline, cursor-skills]
---

# 하네스 엔지니어링 (Harness Engineering)

## 정의 (1~2문장)
- AI 에이전트의 행동을 규칙·맥락·구조로 통제하면서도 유연성을 유지하는 엔지니어링 방법론. "바닥(비전·안전) + 그 위의 유연함"이 핵심.
- (업계 입문 설명) 제약·도구·피드백 루프·문서까지 포함한 **운영 환경 전체**를 하네스로 두고, 이를 설계·개선하는 것이 하네스 엔지니어링이라는 서술이 있다. [source: root-ai-harness-engineering-youtube-intro]

## Verified (소스 기반)
- `.cursorrules` 글로벌 통제: 프로젝트 루트에 절대 규칙 파일 생성하여 AI 행동 제한. [source: vibe-coding-pipeline]
- 기능 구현 전 docs/ 또는 memory/rules/ 등 필수 참조 규칙. [source: vibe-coding-pipeline]
- 에러 시 임의 수정 금지 → 원인·해결 방안 먼저 제시하는 규칙. [source: vibe-coding-pipeline]
- 실시간 동기화 + 하네스 자동화: MD 수정 → 자동 Vector DB 인덱싱으로 LLM 배경지식 동기화. [source: knowledge-base-strategy]
- 컨텍스트/하네스 엔지니어링으로 뼈대를 잡되 AI에게 독창성을 부여하는 4가지 방법론 (매개변수 라우팅, 멀티 에이전트, 구조화된 창의성, Cross-Domain RAG). [source: exploration-vs-exploitation]
- 검토자(Critic/Harness)가 비즈니스 로직·현실성·사용자 제약 기준으로 필터링. [source: exploration-vs-exploitation]
- 제3자 입문 영상 기준 비유: 모델은 CPU·하네스는 운영체제에 가깝다는 설명. [source: root-ai-harness-engineering-youtube-intro]
- 같은 영상 요약: 논의 축이 프롬프트(무엇을 말할까) → 컨텍스트(무엇을 보여줄까) → 하네스(어떤 환경에서 일할까)로 확장되고, 하네스가 상위 틀에 가깝다는 식으로 정리된다. [source: root-ai-harness-engineering-youtube-intro]
- 네 가지 축으로 묶는 설명: 컨텍스트 엔지니어링(레포·선별 로딩, 거대 단일 규칙 파일 한계·분리) · 아키텍처 제약(도구로 강제) · 피드백 루프(테스트·가이드/센서) · 엔트로피 관리(정리). [source: root-ai-harness-engineering-youtube-intro]
- 실천으로 제시되는 방향: 모델보다 환경·실패에서 구조 개선·규칙은 적게·린터·테스트로 강제·하네스도 진화 등(영상 요약). [source: root-ai-harness-engineering-youtube-intro]
- 컨텍스트 엔지니어링에 넣을 정보의 위치가 산재 저장소·타인 머릿속에만 있으면 AI는 활용할 수 없다는 서술. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- 2026년 전제로 지식 관리는 AI 활용의 전제 조건으로 제시된다. [source: modern-ai-ch18-knowledge-management-karpathy-wiki]
- **MCP**는 외부 도구·리소스 연결을 표준화하며, 하네스가 정한 **허용 범위·검증**과 맞물려야 한다는 맥락이 제시된다. [source: modern-ai-ch15-mcp-gateway-willison]
- 도구 스키마가 컨텍스트에 과도하게 상주하는 비용·**보안 게이트웨이**·노출 최소화는 MCP 운영 시 하네스 설계와 직결된다는 서술. [source: modern-ai-ch15-mcp-gateway-willison]

## Inferred (추론/연결) — TTL 30일
- Yohan OS의 agent-harness.md가 이 개념의 직접 구현체. memory/rules/ 전체가 하네스 레이어.
- created: 2026-04-16, expires: 2026-05-16

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [exploration-vs-exploitation](../../ingest/insights/exploration-vs-exploitation.md)
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)
- [root-ai-harness-engineering-youtube-intro](../../ingest/insights/root-ai-harness-engineering-youtube-intro.md)
- [modern-ai-ch18-knowledge-management-karpathy-wiki](../../ingest/insights/modern-ai-ch18-knowledge-management-karpathy-wiki.md)
- [modern-ai-ch15-mcp-gateway-willison](../../ingest/insights/modern-ai-ch15-mcp-gateway-willison.md)