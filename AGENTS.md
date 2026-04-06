# Yohan OS — 에이전트 진입점

이 레포에서 작업하는 **모든 에이전트**(Cursor 포함)는 아래 순서를 따른다.

1. **구조 이해 (선택, 1회):** `[docs/CONTEXT-AND-HARNESS-SYSTEM.md](docs/CONTEXT-AND-HARNESS-SYSTEM.md)` — 컨텍스트 vs 하네스, 파이프라인 다이어그램. Claude 등 **타 클라이언트에 프로젝트 전체 맥락 붙일 때**는 `[docs/CLAUDE-CONTEXT-BOOTSTRAP.md](docs/CLAUDE-CONTEXT-BOOTSTRAP.md)` 전체를 첨부하거나 첫 턴에 붙여 넣기.
2. **필수 하네스:** `[memory/rules/agent-harness.md](memory/rules/agent-harness.md)` — 세션 시작 `get_context`, SoT, P/G/E, 결정 로그.
3. **Cursor:** `.cursor/rules/` — 세션 시작·Evaluator 형식 등 워크스페이스 규칙. 요약 스킬: `.cursor/skills/yohan-os-workflow/SKILL.md`.

MCP `yohan-os` 사용 시 레포 루트가 `cwd`이고 `dist/index.js`가 빌드되어 있어야 한다. `[README.md](README.md)` 트러블슈팅 참고.