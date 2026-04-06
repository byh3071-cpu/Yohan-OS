# Yohan OS (v0)

에이전트용 SoT(`memory/`) + MCP **stdio** 서버. 첫 목표: `**get_context`로 맥락 통일**.

## 빠른 시작

```bash
npm install
npm run build
```

## MCP `yohan-os`가 Error(빨간불)일 때

1. **Show Output** 을 눌러 로그 한 줄이라도 확인한다.
2. 레포 루트에서 `**npm install`** 후 `**npm run build`** — `dist/index.js`가 없으면 MCP가 뜨지 않는다.
3. 진단: `**npm run mcp:check`** → `MCP bundle OK` 가 나와야 한다.
4. `**cwd`** 가 이 레포 루트인지 확인 (`${workspaceFolder}` = Yohan OS 폴더).
5. 터미널에서 `node dist/index.js` 실행 시 **아무 출력 없이 멈춤**이면 정상(stdio 대기). **바로 에러와 함께 종료**하면 그 메시지가 원인.

## Cursor에서 MCP 연결

프로젝트에 `.cursor/mcp.json` 이 포함되어 있다. 워크스페이스를 **이 레포 루트**로 연 뒤:

1. `**npm install` 후 `npm run build`** — `dist/index.js`가 있어야 MCP가 뜬다 (`dist/`는 Git에 포함하지 않음).
2. Cursor **설정 → Tools & MCP**에서 `yohan-os`를 켠다.

수동 추가 시:

- **Command**: `node`
- **Args**: `dist/index.js` (레포 루트 기준)
- **Cwd**: `${workspaceFolder}` (= 이 레포 루트, `memory/` 탐색 기준)

## 환경 변수

레포 루트에 `**.env.example`** 을 참고해 `.env` 를 만들 수 있다. MCP는 `dotenv`로 `.env`를 읽는다(워크스페이스 루트에 둘 것).


| 변수                   | 의미                                                      |
| -------------------- | ------------------------------------------------------- |
| `YOHAN_OS_ROOT`      | 레포 루트 절대 경로. 미설정 시 **프로세스 `cwd`**를 루트로 본다.              |
| `NOTION_TOKEN`       | Notion Integration 토큰 (동기 구현 시).                        |
| `NOTION_DATABASE_ID` | 동기 대상 DB ID.                                            |
| `NOTION_PAGE_ID`     | 페이지 기반 API 시 (선택).                                      |
| `NOTION_QUEUE_FILE`  | 노션 풀 큐 파일 경로 오버라이드. 기본은 `memory/inbox/notion-queue.md`. |
| `TELEGRAM_BOT_TOKEN` | 텔레그램 봇 (`npm run bot`). @BotFather 발급 토큰. |
| `TELEGRAM_CHAT_ID`   | (권장) 본인 채팅 ID만 처리. 비우면 모든 채팅 수신. |

**노션 풀 큐(SoT 병합 전):** `memory/inbox/notion-queue.md` — 규칙은 `memory/rules/notion-sync.md`. `get_context` 의 `notion_queue` 필드에 미리보기가 포함된다.

## 텔레그램 봇 인박스 (폴링)

로컬에서 HTTP 서버 없이 **폴링**으로 메시지를 받는다 (`src/telegram-bot.ts`).

1. `.env`에 `TELEGRAM_BOT_TOKEN`, (권장) `TELEGRAM_CHAT_ID` 설정.
2. `npm run bot` — 종료는 `Ctrl+C`.

| 수신 내용 | 동작 |
|----------|------|
| `http(s)` URL 포함 | 기존 `ingest/url` (`ingestUrl`)로 `memory/ingest/url/` 저장 |
| URL 없는 텍스트만 | `memory/inbox/telegram-inbox.md`에 append |

스크립트는 `tsx`로 실행한다(NodeNext `*.js` import 규약과 동일하게 동작).

**409 Conflict / `terminated by other getUpdates`:** 동일 봇 토큰으로 **폴링은 한 곳에서만** 가능하다. 다른 터미널·백그라운드 `node`·다른 PC에서 같은 봇이 돌고 있으면 종료한다. 시작 시 웹훅은 자동으로 제거한다(`deleteWebHook`). **이 레포는 `memory/.telegram-bot.lock`을 `openSync(…, 'wx')`로 원자적으로 잡아** 동일 PC에서 봇이 두 번 뜨지 않게 한다 — 이미 떠 있으면 PID를 안내하고 종료한다.

**같은 답장이 두 번 오면:** 거의 항상 **봇 프로세스가 두 개** (Cursor 터미널 + PowerShell, 또는 숨은 `node`)이다. 작업 관리자에서 `node` 종료 후 `npm run bot` 한 번만 실행한다.

## 인제스천 v0 — GeekNews RSS

- **피드 (고정)**: `https://news.hada.io/rss/news`
- **저장 위치**: `memory/ingest/rss/geeknews/*.md`
- **프론트매터 스키마**: `schema_version: ingest.v0`, `kind: rss`, `source_name: geeknews`, `source_url`, `title`, `published`, `ingested_at` 등
- **중복**: 동일 원문 URL은 파일명 해시(`gn-…`)로 건너뜀.

### CLI

```bash
npm run ingest:geeknews -- 20
```

인자 생략 시 기본 20개 항목. (내부적으로 `tsx src/ingest-geeknews-cli.ts` 실행, **네트워크 필요**.)

### MCP 도구

- `**ingest_geeknews_rss`**: 선택 인자 `limit` (1–100, 기본 20).

## 인제스천 v1 — 단일 URL (유튜브·일반 페이지)

- **저장**: `memory/ingest/url/url-{해시}.md`
- **스키마**: `ingest.v0`, `kind: url`, `subtype`: `youtube` | `article`
- **유튜브**: oEmbed + 가능 시 자막 (`youtube-transcript`)
- **그 외**: Readability 본문 추출
- **중복**: 동일 URL(정규화) 스킵

### CLI

```bash
npm run ingest:url -- "https://example.com/article"
npm run ingest:url -- "https://www.youtube.com/watch?v=..."
```

### MCP

- `**ingest_url**`: 인자 `url`

## get_context — `recent_ingest` · `notion_queue`

- **recent_ingest**: RSS·URL 인제스트 중 **최근 수정 시각 기준 12개**, 제목·`source_url`·`kind` 등만 (본문 없음).
- **notion_queue**: `memory/inbox/notion-queue.md` 경로·존재 여부·본문 미리보기(길면 잘림). 노션 풀 결과는 **이 큐에만** 쌓고, SoT 병합은 규칙대로 별도 수행.

## 2순위 — 검색·플랜 (P/G/E)

- `**search_memory`**: `memory/` 이하 `.md`/`.yaml`/`.txt` 부분 문자열 검색 (대소문자 무시).
- `**plan_task`**: 목표를 `**plan.v0` JSON** 스텁으로 감싼다 (Planner). 이어서 에이전트가 실행(Generator)·말미 Evaluator.
- 흐름 문서: `memory/rules/pge-pipeline.md`

### CLI

```bash
npm run search:memory -- "검색어" 50
npm run plan:task -- "이번에 달성할 목표 한 문장"
```

## 하네스·Evaluator

- **세션·작업 규칙**: `memory/rules/agent-harness.md`
- **P/G/E**: `memory/rules/pge-pipeline.md`
- **노션 동기(양방향·SoT 우선)**: `memory/rules/notion-sync.md`
- **비전 대조**: `.cursor/rules/evaluator-vision-gate.mdc` + `memory/rules/evaluator-checklist.md` (기준: `docs/VISION-AND-REQUIREMENTS.md`)

## SoT 레이아웃

```
memory/
  profile.yaml
  active-project.yaml
  decisions/*.md
  ingest/rss/geeknews/*.md
  ingest/url/*.md            # 단일 URL 인제스천
  rules/
    agent-harness.md
    pge-pipeline.md
    notion-sync.md
    evaluator-checklist.md
  inbox/
    notion-queue.md      # 노션 풀 → SoT 병합 전 큐
    telegram-inbox.md    # 텔레그램 텍스트-only (npm run bot)
```

## MCP 도구

- `**get_context**`: SoT 스냅샷 JSON (`recent_ingest` 포함)
- `**append_decision**`: `decisions/`에 결정 로그
- `**ingest_geeknews_rss**`: GeekNews RSS
- `**ingest_url**`: 단일 URL
- `**search_memory**`: `memory/` 텍스트 검색
- `**plan_task**`: `plan.v0` 플랜 스텁 (Planner)

## 문서

- 컨텍스트·하네스 체계: `docs/CONTEXT-AND-HARNESS-SYSTEM.md` · 에이전트 진입: `AGENTS.md`
- Claude·타 클라이언트 맥락 일괄 이관: `docs/CLAUDE-CONTEXT-BOOTSTRAP.md`
- 비전·요구: `docs/VISION-AND-REQUIREMENTS.md`
- 킥오프: `docs/IMPLEMENTATION-KICKOFF.md`
- 경쟁사 레퍼런스: `docs/competitive-reference/` (예: `membase-aristo.md`)

