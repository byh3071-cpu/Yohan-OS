---

## id: agent-harness

date: 2026-04-09
domain: harness
tags: [harness, agent, session, rules]
related: [pge-pipeline, evaluator-checklist, decision-trigger]
status: active

# Agent Harness — 세션·작업 규칙 (Yohan OS v0)

이 파일은 **에이전트(Cursor 등)**가 이 레포에서 일할 때 따라야 할 **최소 하네스**다. 비전 전체는 `docs/VISION-AND-REQUIREMENTS.md`를 본다. **컨텍스트·하네스 엔지니어링을 레포 구조에 어떻게 매핑했는지**는 `docs/CONTEXT-AND-HARNESS-SYSTEM.md`를 본다. **하네스는 비전·안전·안정의 바닥이지 창의성을 없애기 위한 족쇄가 아니라는 점**은 동 문서 **§1.1**에 정리되어 있다.

> **팁:** 같은 맥락을 여러 문서에 옮길 때는 `docs/CONTEXT-AND-HARNESS-SYSTEM.md`만 먼저 고치고, `AGENTS.md` 등 진입점은 **다음 턴**이나 **사용자 범위 확인** 후에 손본다(한 턴에 다파일이면 `.cursor/rules/evaluator-vision-gate.mdc` 강제 revise와 맞물리기 쉽다).

---

## 0. 1인 운영 전제

이 프로젝트는 **Yohan 1명 + AI 에이전트**로 운영된다. 팀 리뷰·전담 QA·다수 병렬 PR 같은 팀 패턴은 없으며, 아래 전제가 모든 규칙 위에 있다.

- **사람 시간이 최대 병목** — 에이전트 Evaluator `pass`는 빠르게 훑고, `revise`/`reject`만 집중 확인한다.
- **경계는 적고 강하게** — `must_not` + SoT 우선 + Evaluator 게이트 등 소수 불변식만 기계적으로 지킨다.
- **대화 속 결정은 즉시 SoT에** — `append_decision`을 미루면 1인 환경에서는 그대로 유실된다.
- **세션당 정리 1건** — 대규모 리팩터보다 소규모 상시 정리가 현실적이다.
- **도구 추가 > 프롬프트 튜닝** — `.cursorrules` 문구를 다듬는 것보다 **MCP 도구 1개 추가**가 에이전트 성능에 더 효과적이다. 새 기능이 필요하면 규칙 문서 수정보다 도구 구현을 먼저 검토한다. (참고: AutoAgent 분석 — `memory/decisions/2026-04-09-1520-autoagent-*.md`)

---

## 1. 세션 시작 (필수)

1. **MCP 도구 `get_context`를 호출**해 SoT 스냅샷을 읽는다. (연결되어 있지 않으면 사용자에게 MCP·`cwd` 설정을 안내한다.)
2. 응답에 포함된 `**profile`**·`**active_project`**·`**recent_decisions`**를 작업 맥락에 반영한다.
3. `**memory/profile.yaml`의 `must_not`** 를 위반하는 제안·변경을 하지 않는다.

### 1.1 우선 맥락 (wiki·교재 인사이트) — 적용 즉시

아래는 **에이전트·MCP·RAG·스킬·Select·하네스** 축이 필요할 때 **최소 단위로** `@` 주입할 SoT다. 한 세션에 전부 넣지 않는다 — Attention 분산 방지(`.cursorrules` §8·`layered-context`와 동일).


| 우선순위 | 경로                                            | 용도                              |
| ---- | --------------------------------------------- | ------------------------------- |
| 1    | `memory/wiki/entities/mcp.md`                 | MCP 구조·게이트웨이·도구 최소화             |
| 2    | `memory/wiki/concepts/cursor-skills.md`       | SKILL.md·Progressive Disclosure |
| 3    | `memory/wiki/entities/rag.md`                 | RAG 실패 유형·하이브리드·에이전틱            |
| 4    | `memory/wiki/concepts/layered-context.md`     | Select·LC·토큰·KV-Cache           |
| 5    | `memory/wiki/concepts/harness-engineering.md` | 하네스·경계·검증                       |


- **교재 압축 인사이트:** `memory/ingest/insights/modern-ai-ch*.md` — 수치·연도·제품 단정은 `**memory/inbox/md_files/현대AI개론/` 원문**과 대조.
- **사전 뷰어(용어 통일):** `yohan-ai-dictionary/` 로컬 빌드·`src/content/docs/terms/` — 4개 겹치 용어는 `memory/wiki/`가 원천(`source:`).

---

## 2. 저장소·경로

1. 에이전트 SoT 루트는 `**memory/`** 이다. 레포 루트는 MCP `cwd` 또는 환경 변수 `**YOHAN_OS_ROOT`** 로 결정된다.
2. **비밀번호·API 키·토큰**은 SoT 마크다운·YAML·커밋에 **평문으로 넣지 않는다**. 필요하면 `.env`·OS 시크릿·예시만 문서화한다.
3. **노션·다른 툴이 “최종 진실”이 되게 설계 변경을 제안하지 않는다.** 사람용 미러·입력은 가능하나, **런타임 진실은 `memory/`**다. 노션과 양방향을 쓸 때는 `**memory/rules/notion-sync.md`** (SoT 항상 우선)를 따른다.

---

## 3. 작업 흐름 (P → G → E)

상세: `memory/rules/pge-pipeline.md`.

1. **Planner**: 복잡한 요청이면 MCP `**plan_task`** 로 `plan.v0` JSON을 받거나, 관련 자료를 `**search_memory`** 로 찾는다. (가벼운 요청은 생략 가능.)
2. **Generator**: 플랜·요청에 따라 코드·문서를 실제로 수정한다.
3. **Evaluator**: `.cursor/rules/evaluator-vision-gate.mdc` 및 `memory/rules/evaluator-checklist.md`에 따라 응답 말미에 **판정**을 적는다. **실질 산출물(코드/문서/설정 변경)이 있는 턴은 항상 수행**한다. MCP가 있으면 텍스트 Evaluator 블록 **직후** `**log_evaluation`** 으로 구조화 로그를 남긴다. **경로:** SoT 기준 `**memory/metrics/evaluations/`** (실제 절대 경로는 `get_context`의 `memory_root` + `/metrics/evaluations/`). **파일명:** `eval-YYYY-MM-DD-NNN.md` (`NNN`은 그 날짜의 다음 순번, 3자리 0패딩). 인자·필드 의미는 MCP 도구 설명·`evaluator-checklist.md` **구조화 로그**·`evaluator-vision-gate.mdc`를 본다.

---

## 4. 결정 로그

1. **아키텍처·스택·비전과 충돌할 수 있는 선택**을 했거나, **사용자와 합의한 “이렇게 하기로”**가 있으면 MCP `**append_decision`** 으로 `memory/decisions/`에 남긴다. (제목·summary 필수 권장.)
2. 반복되는 선호·스타일은 `**memory/profile.yaml**` 또는 `**active-project.yaml**` 갱신을 검토한다. `active-project.yaml`은 최소 **주 1회** 목표·브랜치·메모를 업데이트한다.
3. **Evaluator 판정 메트릭**은 `**log_evaluation`** 으로만 구조화 저장한다 (`append_decision`과 역할이 다름). 디렉터리: `**memory/metrics/evaluations/`** — 파일 한 건당 `**eval-{날짜}-{순번}.md`** 하나.

---

## 5. 멀티 PC·백업

1. `memory/`는 **Git으로 버전 관리**하는 것을 전제로 한다. 다른 PC에서 작업하면 **풀/푸시**로 맥락이 갈라지지 않게 한다.
2. MCP `cwd`가 레포 루트가 아니면 **잘못된 SoT**를 읽을 수 있으므로, 설정이 바뀌면 `**get_context` 결과의 `memory_root`**로 확인한다.

---

## 6. 다른 AI 툴과의 관계

1. **동일 MCP**·**동일 `memory/`**를 쓰는 한 **같은 하네스**가 적용된다고 가정한다.
2. MCP 없는 툴에서는 이 파일과 `**evaluator-checklist.md`** 내용을 **사용자 지침에 붙여** 동일하게 운용한다.

---

## 7. 참조 파일


| 파일                                            | 역할                                                                                                                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/CONTEXT-AND-HARNESS-SYSTEM.md`          | 컨텍스트 vs 하네스, 파이프라인·산출물 인덱스                                                                                                                                                        |
| `docs/VISION-AND-REQUIREMENTS.md`             | 비전·요구 통합                                                                                                                                                                          |
| `memory/rules/pge-pipeline.md`                | Planner→Generator→Evaluator 도구 매핑                                                                                                                                                 |
| `memory/rules/evaluator-checklist.md`         | Evaluator 대조 항목·`log_evaluation` 호출 안내                                                                                                                                            |
| `memory/rules/dashboard-runtime-stability.md` | 대시보드 로컬 실행/장애 복구 표준 (Node 폭증, tailwind resolve, EADDRINUSE)                                                                                                                       |
| `.cursor/rules/evaluator-vision-gate.mdc`     | Cursor에서 Evaluator 응답 형식·`log_evaluation` 매핑 강제                                                                                                                                   |
| `memory/metrics/evaluations/`                 | Evaluator 구조화 로그 (`MCP log_evaluation`)                                                                                                                                           |
| 외부 (개념 정렬)                                    | [OpenAI — Harness Engineering (ko-KR)](https://openai.com/ko-KR/index/harness-engineering/) — 에이전트 우선 환경·피드백 루프·짧은 `AGENTS.md` 등; 로컬: `memory/ingest/url/url-5c5e7aedc9912aae.md` |
