# Agent Harness — 세션·작업 규칙 (Yohan OS v0)

이 파일은 **에이전트(Cursor 등)**가 이 레포에서 일할 때 따라야 할 **최소 하네스**다. 비전 전체는 `docs/VISION-AND-REQUIREMENTS.md`를 본다. **컨텍스트·하네스 엔지니어링을 레포 구조에 어떻게 매핑했는지**는 `docs/CONTEXT-AND-HARNESS-SYSTEM.md`를 본다. **하네스는 비전·안전·안정의 바닥이지 창의성을 없애기 위한 족쇄가 아니라는 점**은 동 문서 **§1.1**에 정리되어 있다.

> **팁:** 같은 맥락을 여러 문서에 옮길 때는 `docs/CONTEXT-AND-HARNESS-SYSTEM.md`만 먼저 고치고, `AGENTS.md` 등 진입점은 **다음 턴**이나 **사용자 범위 확인** 후에 손본다(한 턴에 다파일이면 `.cursor/rules/evaluator-vision-gate.mdc` 강제 revise와 맞물리기 쉽다).

---

## 1. 세션 시작 (필수)

1. **MCP 도구 `get_context`를 호출**해 SoT 스냅샷을 읽는다. (연결되어 있지 않으면 사용자에게 MCP·`cwd` 설정을 안내한다.)
2. 응답에 포함된 `**profile`**·`**active_project`**·`**recent_decisions`**를 작업 맥락에 반영한다.
3. `**memory/profile.yaml`의 `must_not`** 를 위반하는 제안·변경을 하지 않는다.

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


| 파일                                        | 역할                                              |
| ----------------------------------------- | ----------------------------------------------- |
| `docs/CONTEXT-AND-HARNESS-SYSTEM.md`      | 컨텍스트 vs 하네스, 파이프라인·산출물 인덱스                      |
| `docs/VISION-AND-REQUIREMENTS.md`         | 비전·요구 통합                                        |
| `memory/rules/pge-pipeline.md`            | Planner→Generator→Evaluator 도구 매핑               |
| `memory/rules/evaluator-checklist.md`     | Evaluator 대조 항목·`log_evaluation` 호출 안내          |
| `.cursor/rules/evaluator-vision-gate.mdc` | Cursor에서 Evaluator 응답 형식·`log_evaluation` 매핑 강제 |
| `memory/metrics/evaluations/`             | Evaluator 구조화 로그 (`MCP log_evaluation`)         |


