---

## id: modern-ai-ch11-harness-willison-aci
date: 2026-04-16
domain: harness-engineering
tags: [harness, simon-willison, aci, claude-code, agent-loop, toolformer, react, yohan-os, agent-ops, inbox-md_files]
related: [harness-engineering, root-ai-harness-engineering-youtube-intro, layered-context, exploration-vs-exploitation, cursor, claude-code, vibe-coding-pipeline]
status: insight

# 현대AI개론 Ch.11 — 하네스 (인사이트)

## 목적

- 에이전트·MCP·룰 설계 시 재사용할 **하네스·ACI·검증 루프** 규칙 묶음. 교재 인용·수치·브랜드 서술은 원문·출처 맥락 유의.

## 원본

- **로컬:** `memory/inbox/md_files/현대AI개론/11-하네스.md`
- **챕터 끝 Source:** Cherny/Orosz; Willison 2026-03-16 등(원문 블록 참조).

## 요약 (짧게)

- **한 줄:** 하네스는 LLM을 **보이지 않는 프롬프트**와 **호출 가능한 도구**로 확장하는 소프트웨어; **같은 모델**이라도 채팅봇 vs 에이전트는 **하네스 차이**(Willison 등 서술).
- **두 역할:** (1) 시스템·CLAUDE.md·도구 정의·대화 재전송 등 **숨은 컨텍스트 관리** (2) Read/Edit/Bash 등 **도구 실행 통로**.
- **무상태:** LLM은 턴마다 백지에 가깝고, **하네스가 매 턴 컨텍스트를 재구성**(토큰 캐시는 비용 완화일 뿐).
- **CLAUDE.md / AGENTS.md:** 추상적 좌우명보다 **빌드·테스트 명령, 스타일, 디렉터리·의존 방향, 커밋 규칙** 등 실행 가능 정보.
- **ACI:** 프롬프트보다 **도구 정의·파라미터·에러 행동** 최적화가 성과를 가름; **절대 경로** 등 포카요케 예시(교재 사례).
- **루프:** ReAct 계열 + 실전 표현 **Gather → Act → Verify → Repeat**; 검증 생략 시 “고쳤다” 허위 보고 위험.
- **검증 3단:** 규칙 기반(lint/test) → 시각(스크린샷 등) → LLM-as-Judge(비용·유연성).
- **Toolformer 서술:** 소형+도구가 대형 단독에 근접할 수 있다는 **도구의 역할** 강조(연구 인용은 원문).
- **신규 세팅 4단계:** CLAUDE.md → 도구 범위 → 권한 경계 → 검증 루프.
- **장기 실행:** git·progress 파일 등 **파일시스템이 메모리**; 실패 모드(동시 작업 과다, 조기 완료, 테스트 조작 금지 등).
- **서브에이전트:** 컨텍스트 분리·요약 반환; Orchestrator-Workers와 연결.
- **반패턴:** 워크플로우를 에이전트라 부름, **비즈니스 로직을 하네스 코드에 직접**, 테스트 삭제·수정 허용.
- **에이전틱 루프 스킬:** 성공 기준이 **기계 판정 가능**할 때 루프가 돈다; 프레임워크 과추상화 경계.
- **다음 장 연결:** 외부 연결 표준으로 **MCP** 예고.

## 핵심 논지 (원문 `##` 순서)

- **채팅 vs Claude Code:** 파일·실행·검증 불가 vs Glob/Grep/Read/Edit/Bash 루프 — **Product Overhang** 등 서술.
- **하네스 정의:** 보이지 않는 프롬프트 + 도구(Willison 인용 연도는 원문).
- **두 가지 기능:** 숨은 토큰(시스템·프로젝트 문서·도구 스펙·이력) 관리; 도구 호출 실행.
- **CLAUDE.md:** 나쁜 예(추상) vs 좋은 예(명령·구조·규칙 구체화); AGENTS.md 동일 원리.
- **ACI:** 도구 설계·문서화가 프롬프트보다 중요할 수 있음; 도구 정의가 **매 턴** 컨텍스트를 먹음 → **적게·정확히**.
- **에이전트 루프:** ReAct; Gather/Take action/Verify/Repeat; 버그 시나리오 표.
- **검증 3단계·브라우저 검증** 등 서술.
- **Toolformer:** 도구로 크기 격차 완화 사례(원문 수치).
- **신규 4단계·권한·YOLO·샌드박스** 경고.
- **Before/After:** 사람이 루프 vs 소프트웨어가 루프.
- **장기 실행:** Initializer/Coder, progress·git, 실패 모드 표, **테스트 조작 불가** 경고.
- **서브에이전트:** 유효/비유효 케이스, 장기에서 깨끗한 컨텍스트의 이점.
- **Claude Code 수치·철학:** 비즈니스 로직 최소화·모델 교체 내구성; on-distribution 스택.
- **반패턴·리트머스 테스트** 3가지.
- **에이전틱 루프 설계 스킬·후보 작업 표·API 직접 vs 프레임워크.**
- **경쟁 하네스 표:** 공통 뼈대 LLM+FS+도구+검증.
- **권한·안전:** 읽기/쓰기/파괴 단계, Willison 위험 3종.
- **MCP 예고.**

## Yohan OS 적용 · 토큰 효율

- `**memory/rules/`·`.cursorrules`·`AGENTS.md`:** Ch.11의 “좋은 CLAUDE.md”와 동일 — **실행 가능·검증 가능**한 지시(명령·경로·금지·예외).
- **MCP·도구:** 스키마·에러·경로를 **모델이 처음 보는 주니어** 가정으로 문서화; 불필요한 도구는 **컨텍스트 예산**만 잡아먹음.
- **루프:** Planner→구현→**Evaluator·테스트·lint**가 Gather-Verify에 대응; 테스트 삭제/완화로 통과시키기 **금지**는 하네스 정책과 정합.
- **장기 작업:** `active-project.yaml`·티켓·Git이 **세션 밖 메모리** 역할.
- **토큰:** 거대 단일 규칙보다 **계층·선별 로딩**(`layered-context`와 정합).

## 원문 대비 완전성

- 재검증: 원문 `11-하네스.md`의 `##` 제목을 위에서 아래로 읽으며 위 **핵심 논지**에 대응 확인. 표·수치·인용 연도는 **원문·출처** 우선.

## 원본 유지보수

- 그림: 워크플로우 vs 에이전트 — `memory/inbox/10-workflow-agent.png` (`11` 기준 `../../../10-workflow-agent.png`).

## S티어 순서 (현대AI개론 인박스)

- **교재 읽기 순서:** 10 → 11 → … → 15 → 16 → 17.
- **인박스 처리 순서:** Ch.18 → Ch.11 → Ch.10 → … 아래 목록의 ✓는 **작업 완료 순**이다.

1. **Ch.11 하네스** — 본 인사이트 (완료).
2. **Ch.10 컨텍스트 엔지니어링** — `modern-ai-ch10-context-engineering-karpathy.md` (완료).
3. **Ch.15 MCP** ✓ — `modern-ai-ch15-mcp-gateway-willison.md`
4. **Ch.16 Skills** ✓ — `modern-ai-ch16-skills-packaging.md`
5. **Ch.17 RAG** ✓ — `modern-ai-ch17-rag-select-pipeline.md`

**S티어 인박스 일련:** 처리 완료. 다음은 위키 ingest·Dictionary Phase 등 별도 우선순위.