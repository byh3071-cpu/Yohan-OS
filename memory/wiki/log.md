---
id: wiki-log
updated: 2026-04-13
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