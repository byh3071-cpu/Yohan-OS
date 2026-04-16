---
id: modern-ai-ch16-skills-packaging
date: 2026-04-16
domain: agent-skills
tags: [skills, skill-md, progressive-disclosure, agentskills, mcp-complement, yohan-os, cursor-skills, inbox-md_files]
related: [harness-engineering, layered-context, rag, cursor-skills, modern-ai-ch15-mcp-gateway-willison, modern-ai-ch17-rag-select-pipeline, vibe-coding-pipeline]
status: insight
---

# 현대AI개론 Ch.16 — Skills (인사이트)

## 목적

- **전문 절차를 마크다운 패키지로** 재사용할 때의 규칙. `.cursor/skills`·프로젝트 스킬과 정합.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/16-Skills.md`

## 요약 (짧게)

- **빈자리:** MCP는 **접근(행동 범위)**; Skills는 **어떻게 잘할지(행동 품질)** — 병원 장비 vs 진료 프로토콜 비유.
- **실체:** `SKILL.md` + YAML; agentskills.io(원문). Willison “MCP보다 클 수 있다” 서술.
- **프론트매터:** `description`이 자동 매칭의 심장; `disable-model-invocation`·`allowed-tools`·`context: fork`·`agent` 등(시점은 원문).
- **안티패턴:** 과적, MCP 미러링, 자동 호출 남용.
- **토큰:** Progressive Disclosure 3단계 — MCP 전체 스키마 상주와 대비.
- **비교:** CLAUDE.md vs MCP vs Skills 표; **분업** 표.
- **보안:** 스킬 셸 주입·`disableSkillShellExecution` 등(원문 시점).
- **5계층 척추 그림:** 프롬프트→CE→하네스→MCP→Skills.

## 핵심 논지 (원문 `##` 순서)

- MCP 빈자리·탄생·SKILL.md 해부·좋은/나쁜 스킬·자동 매칭·토큰 경제·3-way 비교·MCP 분업·Before/After·context fork/agent·생태계·디렉터리 우선순위·5계층.

## Yohan OS 적용 · 토큰 효율

- **`.cursor/skills/`:** 한 스킬 = 한 워크플로; `description`에 사용자 어휘·동의어.
- **도구 최소·검증 단계 포함** — Ch.11 검증 루프와 정합.

## 원문 대비 완전성

- 원문 `##` 순서와 대조. 제품 플래그·날짜는 **원문** 우선.

## 원본 유지보수

- 그림: `memory/inbox/03-spine.png` (`16` 기준 `../../../03-spine.png`).

## S티어 순서

- **교재 순서:** … → 16 → 17.
- **처리 순서 ✓:** … → 15 → **16(본 문서)** → 17 — 후속 인사이트 작성 완료.

**위키 승격 완료 (2026-04-16):** 컨셉 `cursor-skills`·관련 `related_*` 갱신. `memory/wiki/log.md` 참조.
