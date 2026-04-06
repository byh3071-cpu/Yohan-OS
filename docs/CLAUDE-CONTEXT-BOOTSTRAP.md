# Claude(및 기타 AI)용 — Yohan OS 프로젝트 맥락 부트스트랩

> **용도:** 새 대화·새 클라이언트에서 이 프로젝트의 **기획·이유·비전·병목·해결·현재 구현**을 빠짐없이 이해시키기 위한 단일 문서.  
> **유지:** 비전·우선순위가 바뀌면 `docs/VISION-AND-REQUIREMENTS.md`를 갱신하고, 본 문서의 §8·§9만 따라잡으면 된다.  
> **SoT:** 에이전트 런타임의 최종 진실은 **`memory/`** + 이 레포 Git; 노션은 미러·큐·뷰(규칙: `memory/rules/notion-sync.md`).

---

## 1. 프로젝트 한 줄

**개인 지식·지침·프로젝트를 수집·변환·저장·검색하고**, Cursor·Claude 등 **어떤 AI 툴을 써도 동일한 맥락·지침이 주입**되도록 **MCP 단일 접점**을 둔 **개인용 OS급 단일 앱**을 만든다.  
장기 AX·업무 자동화를 지향하되, **현재 우선순위는 개인 병목 해결**.

---

## 2. 기획 의도와 그 이유 (요약)

| 결정 | 이유 |
|------|------|
| **SoT = `memory/` + Git (로컬 우선)** | 툴마다 흩어진 “대화 메모”가 아니라 **재사용 가능한 구조화 정보**(프로필·금지·활성 프로젝트·결정·용어)를 한 축에 모음. |
| **대화 로그 전체 동기는 비목표(후순위)** | 비용·노이즈 대비 효용이 낮음. **스냅샷·결정·규격화된 산출물**이 먼저. |
| **MCP(stdio) `get_context` 등** | Cursor·Claude·(추후) ChatGPT·Gemini가 **같은 JSON 스냅샷**을 읽게 해 “플랫폼에 갇힌 맥락” 병목을 줄임. |
| **P/G/E (Planner → Generator → Evaluator)** | 복잡 작업에서 **반영 전 검증**; SoT 오염·비전 이탈 방지. |
| **노션은 필수 아님, SoT 우선** | 노션 AI만으로 쌍방 동기가 “정답”이 아님. 충돌 시 **자체 SoT가 최종**; 노션은 미러·입력 큐. |
| **v0는 Node+TS+MCP+파일 SoT** | Cursor/Claude MCP 생태계 호환, 단일 레포에서 빌드·운영 단순. |
| **프롬프트 → 컨텍스트 → 하네스 엔지니어링** | 산업 흐름과 정렬; “맥락 주입”과 “절차·검증”을 분리해 설계 (`docs/CONTEXT-AND-HARNESS-SYSTEM.md`). |

---

## 3. 성공 정의 (비전 문서 기준)

### 3.1 기술적 성공 (핵심)

- **“어떤 툴을 켜도 동일한 `get_context`(맥락 패키지)가 주입된다.”**

### 3.2 연속성 (보조)

- **“요청 출처와 무관하게 목표·제약·최근 결정이 빠지지 않고, P/G/E 하네스 안에서 SoT에 반영된다.”**

---

## 4. 핵심 병목과 해결 방향

### 병목 1 — 공유되지 않는 메모리·맥락

- **문제:** 플랫폼별 대화·선호·스택 정보가 **분산**.
- **해결:** `profile.yaml`, `active-project.yaml`, `decisions/`, `rules/` 등을 **`memory/` SoT**에 두고, MCP로 **동일 스냅샷** 제공. 인제스트로 외부 정보를 **규격 MD**로 누적.

### 병목 2 — 오케스트레이션

- **문제:** 복잡 요청 시 **역할·분해·라우팅** 어려움.
- **해결:** **P/G/E** 파이프라인; 초기에는 `plan_task` 스텁·태그 수준 → 데이터·하네스 축적 후 멀티에이전트·라우터 고도화.

### “전 세계적” 보편 병목과의 관계

- 동일 **`get_context`**는 “플랫폼에 갇힌 맥락”이라는 **보편 병목**을 겨냥한 조건.

---

## 5. 기능·아키텍처 요구 (비전 문서 원문 합의 요약)

### 5.1 수집·변환 (Ingestion)

- **입력:** 유튜브, RSS, 인스타·스레드(링크·스크린샷), 스크린샷, GitHub 등.
- **처리:** 사용자 정의 **MD 규격** + 메타데이터.
- **현실:** RSS·유튜브(자막/메타)·GitHub 우선; 인스타·스레드는 API 한계 → **공개 URL 시도 / 스크린샷+OCR / 링크 큐**.

### 5.2 유니버셜 메모리 (Hybrid)

- 텍스트 + **벡터·지식그래프·메타온톨로지** 단계적 도입: 풀텍스트 검색 → 벡터 → 엔티티 링크 → 그래프.

### 5.3 오케스트레이션

- 룰북·스킬·프로젝트·태스크; **구조화(MCP·스키마)를 Skills보다 선행**.

### 5.4 MCP 통합

- `get_context`, `append_decision`, `search_memory`, `plan_task` 등 — 설계 시 확장.

### 5.5 단일 앱(OS)

- 장기 목표: 인제스천·메모리·룰·태스크 **독립 UI 앱**까지. v0는 **CLI + MCP**로 비전 검증.

### 5.6 SoT·노션·옵시디언·GitHub

- **SoT:** 자체 앱+저장소; 에이전트가 믿는 **최종본 한 축**.
- **노션:** 기획·DB UI; SoT 우선, 풀 큐 `memory/inbox/notion-queue.md`.
- **옵시디언:** 필수 아님.
- **GitHub:** 코드·PR 맥락 중심이면 조기 연동 가치.

### 5.7 사용자 워크플로 (합의)

- 발견 → **스크린샷 또는 링크** → **정제·검증** → 규격 MD → SoT → (선택) 노션 푸시.  
- **정제 성공 기준:** 스크린샷을 다시 안 열고 **카드만으로 업무 가능**; 출처·링크·경로는 가능하면 항상 유지.

### 5.8 클라이언트 우선순위

1. Cursor 2. Claude 3. Antigravity(보조) — 기타는 동일 MCP로 확장.

- **Antigravity 보조 사용 시(비전 §9.1):** 한도 후 **속도·정확도 저하·자동 삭제** 등 이상 동작 가능 → **읽기 위주 MCP**, draft/scratch만 쓰기, SoT 쓰기·삭제 도구는 제한·확인 단계, 세션 후 **SoT로 내보내기** 권장.

### 5.9 보안·금지 원칙 (요약)

- 제3자 무제한 학습 판매 구조 금지; 확인 없이 비밀·대금·삭제·퍼블리시 금지; 출처 없는 “최신” 단정 금지; 무규칙 쌍방 덮어쓰기 금지; 백업 없이 단일 복사본만 금지; **정확도 100%** 무분별 약속 금지(Evaluator·출처·인간 승인으로 근접).

### 5.10 로드맵 우선순위 (비전 §14 요약)

상위: SoT+Git → MCP `get_context`/`append_decision` → profile·금지·활성 프로젝트 → 인제스트 MD v0 → P/G/E → 인제스트 어댑터 → 시크릿 분리·백업·검색·노션 규칙 → 벡터·그래프 → 고급 오케스트레이션·UI.

### 5.11 P/G/E 역할 (비전 §15)

- **Planner:** 목표·제약·태스크·`context_refs`.
- **Generator:** MD·패치 + 출처·신뢰도 메타.
- **Evaluator:** SoT·플랜 대조 pass/revise/reject; pass 전 **SoT 영구 반영 금지(또는 draft만)** 원칙.

---

## 6. 현재 구현 상태 (v0 — README·코드 기준)

**스택:** Node 20+, TypeScript, MCP stdio (`@modelcontextprotocol/sdk`), SoT YAML, Zod 4.

**SoT 경로:** `{레포루트}/memory/` (`cwd` 또는 `YOHAN_OS_ROOT`).

**MCP 도구 (구현됨):**

- `get_context` — profile, active-project, 최근 decisions, recent_ingest(12), notion_queue 미리보기 등 JSON 스냅샷.
- `append_decision` — `memory/decisions/`에 결정 로그.
- `ingest_geeknews_rss` — GeekNews RSS → `memory/ingest/rss/geeknews/`.
- `ingest_url` — 단일 URL(유튜브·기사) → `memory/ingest/url/`.
- `search_memory` — memory 이하 부분 문자열 검색.
- `plan_task` — `plan.v0` JSON 스텁 (Planner).

**하네스 문서:** `memory/rules/agent-harness.md`, `pge-pipeline.md`, `evaluator-checklist.md`(§E 차별성), `notion-sync.md`.  
**Cursor:** `.cursor/rules/session-start-get-context.mdc`, `evaluator-vision-gate.mdc`; 스킬 `.cursor/skills/yohan-os-workflow/SKILL.md`.  
**에이전트 진입:** `AGENTS.md`.

**킥오프 확정:** `docs/IMPLEMENTATION-KICKOFF.md` — v0는 인제스천·벡터·노션 동기 **다음 마일스톤**(문서 시점); 실제로 RSS·URL 인제스트와 검색·플랜은 이미 README에 반영됨.

---

## 7. 운영 지침 (Claude가 이 레포에서 일할 때)

1. **가능하면 MCP `get_context`를 먼저 호출**해 SoT 스냅샷을 읽는다 (연결 불가 시 `memory/rules/agent-harness.md` + README MCP 점검 안내).
2. **`memory/profile.yaml`의 `must_not`·`differentiation`**을 존중한다.
3. **비전 대조**는 `docs/VISION-AND-REQUIREMENTS.md` + `memory/rules/evaluator-checklist.md`.
4. **아키텍처·비전 충돌 결정**은 `append_decision`으로 남긴다.
5. **노션은 SoT를 덮지 않는다** — 동기 규칙은 `notion-sync.md`.

---

## 8. `memory/profile.yaml` 스냅샷 (갱신 시 본 섹션을 목차만 두고 “파일 직접 참조”로 대체 가능)

- **display_name:** Yohan  
- **timezone:** Asia/Seoul  
- **stack:** TypeScript, Cursor, Notion(노트), MCP `yohan-os`  
- **ai_clients:** primary Cursor+Claude, secondary Antigravity, occasional Gemini/ChatGPT  
- **preferences:** spaces 2, concise comments  
- **must_not:** 시크릿 SoT 평문 금지; 확인 없이 프로덕 배포·삭제·대금 금지  
- **communication:** direct, ko  
- **differentiation:** voice; priority_order (safety → vision → clarity → novelty_when_useful); creative_margin; innovation_signals — **상세는 저장소의 `memory/profile.yaml` 최신본이 정본**

---

## 9. `memory/active-project.yaml` 스냅샷 (v0)

- **id:** yohan-os-mcp  
- **name:** Yohan OS — SoT + MCP v0  
- **goal:** `get_context`로 맥락 통일, `append_decision`으로 결정 로그 축적  
- **notes:** Cursor에서 MCP 연결 후 `get_context`로 동일 맥락 확인

---

## 10. 관련 파일 경로 (빠짐없이 찾기)

| 내용 | 경로 |
|------|------|
| 비전·요구 전체 | `docs/VISION-AND-REQUIREMENTS.md` |
| v0 스택·MCP 범위 | `docs/IMPLEMENTATION-KICKOFF.md` |
| 컨텍스트·하네스 지도 | `docs/CONTEXT-AND-HARNESS-SYSTEM.md` |
| 본 부트스트랩 | `docs/CLAUDE-CONTEXT-BOOTSTRAP.md` |
| 빌드·MCP·CLI | `README.md` |
| 에이전트 목차 | `AGENTS.md` |
| 프로필·금지·차별성 | `memory/profile.yaml` |
| 활성 프로젝트 | `memory/active-project.yaml` |
| 결정 로그 | `memory/decisions/*.md` |
| 하네스·동기·평가 | `memory/rules/*.md` |

---

*이 문서는 비전 문서·README·프로필을 통합한 부트스트랩이며, 세부 수치·정책의 정본은 항상 `docs/VISION-AND-REQUIREMENTS.md` 및 `memory/`를 따른다.*
