---

## id: cursor-skills
type: concept
aliases: [Cursor Skills, SKILL.md, 에이전트 스킬]
created: 2026-04-16
updated: 2026-04-16
source_insights: [modern-ai-ch16-skills-packaging]
related_entities: [cursor, mcp]
related_concepts: [harness-engineering, vibe-coding-pipeline, layered-context]

# Cursor / Agent Skills (SKILL.md)

## 정의 (1~2문장)

- MCP가 **접근·행동 범위**를 열어 주는 층이라면, Skills는 **어떻게 잘 수행할지** 절차·노하우를 마크다운 패키지(`SKILL.md` 등)로 묶는 층으로 대비된다.

## Verified (소스 기반)

- `SKILL.md` + YAML 구조, agentskills.io 등 생태가 원문에서 언급된다. [source: modern-ai-ch16-skills-packaging]
- 프론트매터의 `**description`** 이 자동 매칭·발견에 중요하다는 서술이 있다. [source: modern-ai-ch16-skills-packaging]
- **Progressive Disclosure** 로 토큰을 아끼는 방향이, MCP 전체 스키마가 상주하는 비용 문제와 대비된다. [source: modern-ai-ch16-skills-packaging]
- 과적·MCP 미러링·자동 호출 남용이 안티패턴으로 정리된다. [source: modern-ai-ch16-skills-packaging]
- 프롬프트 → 컨텍스트 엔지니어링 → 하네스 → MCP → Skills 의 **5계층 척추** 그림이 제시된다. [source: modern-ai-ch16-skills-packaging]
- `.cursor/skills/` 에 프로젝트 스킬을 두는 패턴이 Yohan OS와 정합된다는 서술. [source: modern-ai-ch16-skills-packaging]

## Inferred (추론/연결) — TTL 30일

- 검증 루프(Evaluator)·하네스 규칙과 스킬의 "절차 문서화"가 맞물릴 수 있음.
- created: 2026-04-16, expires: 2026-05-16

## Owner Notes

- (Yohan이 직접 작성)

## 관련 소스

- [modern-ai-ch16-skills-packaging](../../ingest/insights/modern-ai-ch16-skills-packaging.md)