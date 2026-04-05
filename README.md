# Yohan OS (v0)

에이전트용 SoT(`memory/`) + MCP **stdio** 서버. 첫 목표: `**get_context`로 맥락 통일**.

## 빠른 시작

```bash
npm install
npm run build
```

## Cursor에서 MCP 연결

프로젝트에 **`.cursor/mcp.json`** 이 포함되어 있다. 워크스페이스를 **이 레포 루트**로 연 뒤:

1. **`npm install` 후 `npm run build`** — `dist/index.js`가 있어야 MCP가 뜬다 (`dist/`는 Git에 포함하지 않음).
2. Cursor **설정 → MCP**에서 서버 목록에 `yohan-os`가 보이는지 확인하거나, 필요 시 **설정에서 MCP 구성 파일 경로**가 이 프로젝트를 가리키는지 확인한다.

수동 추가 시:

- **Command**: `node`
- **Args**: `dist/index.js` (레포 루트 기준)
- **Cwd**: `${workspaceFolder}` (= 이 레포 루트, `memory/` 탐색 기준)

## 환경 변수


| 변수              | 의미                                         |
| --------------- | ------------------------------------------ |
| `YOHAN_OS_ROOT` | 레포 루트 절대 경로. 미설정 시 **프로세스 `cwd`**를 루트로 본다. |


## 하네스·Evaluator

- **세션·작업 규칙**: `memory/rules/agent-harness.md` — 시작 시 `get_context`, P→G→E, 결정 로그, 멀티 PC.
- **비전 대조(Evaluator)**: `.cursor/rules/evaluator-vision-gate.mdc` + `memory/rules/evaluator-checklist.md` (대조 기준: `docs/VISION-AND-REQUIREMENTS.md`).

## SoT 레이아웃

```
memory/
  profile.yaml          # 프로필·선호·must_not
  active-project.yaml   # 현재 프로젝트 한 줄 맥락
  decisions/*.md        # 결정 로그 (append_decision)
  rules/
    agent-harness.md        # 세션·작업 하네스
    evaluator-checklist.md    # Evaluator 대조 항목
```

## MCP 도구

- `**get_context**`: 위 파일들을 읽어 JSON 한 덩어리로 반환.
- `**append_decision**`: `decisions/`에 마크다운 파일 추가 (`title`, 선택 `summary`, `body`).

## 문서

- 비전·요구: `docs/VISION-AND-REQUIREMENTS.md`
- 킥오프(스택·범위·경로): `docs/IMPLEMENTATION-KICKOFF.md`

