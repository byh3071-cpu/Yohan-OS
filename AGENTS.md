# Yohan OS — 에이전트 진입점

이 레포에서 작업하는 **모든 에이전트**(Cursor 포함)는 아래 순서를 따른다.

## 0. 1인 운영 원칙

이 프로젝트는 **Yohan 1명 + AI 에이전트**로 운영된다. 모든 규칙·절차는 아래 전제 위에 있다.

1. **코드보다 규칙·맥락 정비에 시간 쓴다** — 에이전트가 잘 돌게 환경을 만드는 게 본업
2. **진입 문서는 짧게, 세부는 분리** — 관리 가능한 수준 유지
3. **대화에서 결정 나면 즉시 SoT에 기록** — 나중은 없다
4. **경계는 5개 이하로 적고 강하게** — 많으면 안 지킴
5. **Evaluator를 믿고, 사람 눈은 감각에만** — 전수검사는 1인에게 불가능
6. **거창한 정리 대신 세션당 1개씩** — 0 < 1
7. **새 도구 도입 전 "에이전트가 읽을 수 있나?" 자문** — 못 읽으면 가치 없음

## 1. 작업 순서

1. **구조 이해 (선택, 1회):** `[docs/CONTEXT-AND-HARNESS-SYSTEM.md](docs/CONTEXT-AND-HARNESS-SYSTEM.md)` — 컨텍스트 vs 하네스, 파이프라인 다이어그램. **대시보드 작업 시:** `[docs/DASHBOARD-SPEC.md](docs/DASHBOARD-SPEC.md)` — 전체 스펙·로드맵·디자인·기술 스택. **하네스 = 통제만이 아니라 바닥(비전·안전) + 그 위의 유연함**은 동 문서 **§1.1** 참고. Claude 등 **타 클라이언트에 프로젝트 전체 맥락 붙일 때**는 `[docs/CLAUDE-CONTEXT-BOOTSTRAP.md](docs/CLAUDE-CONTEXT-BOOTSTRAP.md)` 전체를 첨부하거나 첫 턴에 붙여 넣기.
2. **필수 하네스:** `[memory/rules/agent-harness.md](memory/rules/agent-harness.md)` — 세션 시작 `get_context`, SoT, P/G/E, 결정 로그.
3. **Cursor:** `.cursor/rules/` — 세션 시작·Evaluator 형식 등 워크스페이스 규칙. 요약 스킬: `.cursor/skills/yohan-os-workflow/SKILL.md`.

4. **Wiki:** `memory/wiki/` — 지식 레이어. 명세: `[docs/WIKI-SPEC-v2.md](docs/WIKI-SPEC-v2.md)` | 규칙: `memory/rules/wiki-ops.md` | 스킬: `.cursor/skills/wiki-ops/SKILL.md`.

MCP `yohan-os` 사용 시 레포 루트가 `cwd`이고 `dist/index.js`가 빌드되어 있어야 한다. `[README.md](README.md)` 트러블슈팅 참고.