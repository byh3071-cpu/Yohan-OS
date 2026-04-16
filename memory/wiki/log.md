---
id: wiki-log
updated: 2026-04-16
---

# Wiki Change Log (append-only)

## 2026-04-12

- **INIT** Phase 1 완료: `memory/wiki/` 구조 생성 (entities/, concepts/, answers/, index.md, log.md).
- **Phase 2** insights 31개 스캔. draft 20개 스킵, insight 11개 처리. 엔티티 5 + 컨셉 7 추출 → 사용자 확인 완료.

## 2026-04-13

- **Phase 3** Entity 5개 생성: andrej-karpathy, obsidian, cursor, rag, claude-code.
- **Phase 3** Concept 7개 생성: para-method, exploration-vs-exploitation, layered-context, single-source-of-truth, second-brain, vibe-coding-pipeline, harness-engineering.
- **Phase 3** index.md 갱신 (5/80 entities, 7/50 concepts, 12 Inferred).
- **Phase 4** insights 7개 프론트매터에 역링크(wiki id) 추가.
- **Phase 5** `memory/rules/wiki-ops.md` 생성. `.cursor/skills/wiki-ops/SKILL.md` 배치 완료. `AGENTS.md` wiki 경로 등록. Evaluator: **pass**.
- **QA** 전수 검증 수행. 이슈 2건 수정: cursor.md 양방향 참조 누락(andrej-karpathy 추가), exploration-vs-exploitation insight 역링크 보완. Concept 7개 전항 PASS.

## 2026-04-16

- **Insight → Wiki:** `root-ai-harness-engineering-youtube-intro` 승격(`status: insight`) 후 `concepts/harness-engineering.md`에 Verified 병합·`source_insights`·관련 소스 링크 갱신.
- **Insight → Wiki:** `modern-ai-ch18-knowledge-management-karpathy-wiki` 승격. Verified·`source_insights`·관련 소스: `harness-engineering`, `second-brain`, `rag`, `single-source-of-truth`, `layered-context`, `andrej-karpathy`, `para-method`. `index.md` 통계 Inferred 12→15 재집계.

## 2026-04-16 (Ch.15–17)

- **Insight → Wiki:** `modern-ai-ch15-mcp-gateway-willison` — 신규 엔티티 `mcp.md`. `harness-engineering`·`cursor`·`claude-code` 양방향 `related_*` 갱신.
- **Insight → Wiki:** `modern-ai-ch16-skills-packaging` — 신규 컨셉 `cursor-skills.md`. `harness-engineering`·`vibe-coding-pipeline` `related_concepts` 갱신.
- **Insight → Wiki:** `modern-ai-ch17-rag-select-pipeline` — `entities/rag.md`, `concepts/layered-context.md` Verified 병합·`source_insights`·관련 소스.
- `index.md` 엔티티 5→6, 컨셉 7→8, Inferred 불릿 합계 갱신(대략 15→17).