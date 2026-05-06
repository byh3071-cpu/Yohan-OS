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


| 변수                            | 의미                                                      |
| ----------------------------- | ------------------------------------------------------- |
| `YOHAN_OS_ROOT`               | 레포 루트 절대 경로. 미설정 시 **프로세스 `cwd`**를 루트로 본다.              |
| `NOTION_TOKEN`                | Notion Integration 토큰 (동기 구현 시).                        |
| `NOTION_DATABASE_ID`          | 동기 대상 DB ID.                                            |
| `NOTION_PAGE_ID`              | 페이지 기반 API 시 (선택).                                      |
| `NOTION_QUEUE_FILE`           | 노션 풀 큐 파일 경로 오버라이드. 기본은 `memory/inbox/notion-queue.md`. |
| `NOTION_TITLE_PROPERTY`       | 노션 DB 제목 열 이름 (기본 `Name`).                              |
| `NOTION_PROPERTY_SOT_KEY`     | 멱등 키 열 이름 (기본 `SoT Key`, **DB에 텍스트 열로 생성**).            |
| `NOTION_PROPERTY_SUMMARY`     | 요약 열 이름 (선택, 없으면 푸시 시 생략).                              |
| `NOTION_PROPERTY_SOURCE_PATH` | SoT 상대 경로 열 (선택).                                       |
| `NOTION_OCR_RESOURCE_DATABASE_ID` | 텔레그램 OCR **리소스** DB ID (`notion_push_ocr_pair` / `sync:notion:ocr`). |
| `NOTION_OCR_SUMMARY_DATABASE_ID`  | OCR **서머리** DB ID. |
| `NOTION_OCR_RESOURCE_PROP_*` 등 | 리소스·서머리 DB **열 이름**·기본값 오버라이드 — `notion-ocr-pipeline.md`. `상태`는 기본 **Notion Status**; Select 열이면 `NOTION_OCR_*_STATUS_KIND=select`. |
| `NOTION_KNOWLEDGE_HUB_DB_ID` / `NOTION_EXECUTION_LOG_DB_ID` | `sync_to_notion`이 푸시할 두 DB. ADR·트러블슈팅 → 지식 허브, 세션 로그 → EXECUTION LOG. |
| `NOTION_KNOWLEDGE_HUB_PROP_*` / `NOTION_EXECUTION_LOG_PROP_*` 등 | 두 DB **열 이름**·상태/카테고리 종류 오버라이드. 기본값은 한국어 UI(`이름`·`상태`·`카테고리`·`SoT Key`). 상태 컬럼이 Status 타입이 아니면 `NOTION_KNOWLEDGE_HUB_STATUS_KIND=select`. 전체 키는 `.env.example`. |
| `TELEGRAM_BOT_TOKEN`          | 텔레그램 봇 (`npm run bot`). @BotFather 발급 토큰.               |
| `TELEGRAM_CHAT_ID`            | (권장) 본인 채팅 ID만 처리. 비우면 모든 채팅 수신.                        |


**노션 풀 큐(SoT 병합 전):** `memory/inbox/notion-queue.md` — 규칙은 `memory/rules/notion-sync.md`. `get_context` 의 `notion_queue` 필드에 미리보기가 포함된다.

### 노션 동기 (푸시 / 풀→큐만)

1. [My integrations](https://www.notion.so/my-integrations)에서 Integration 생성 → **토큰**을 `.env`의 `NOTION_TOKEN`에 넣는다.
2. 노션에서 해당 DB 페이지에 Integration을 **연결**(공유)한다.
3. DB에 열 추가: `**SoT Key`** (텍스트) — 멱등 키 저장용, **필수**. 선택: `Summary`, `Source Path` (텍스트).
4. `.env`: `NOTION_DATABASE_ID=` URL의 32자 hex(예: `…/33a9740ab07280cf8180cc8b19663fb5?…` → 앞 32자).

```bash
npm run sync:notion:push -- 20    # memory/decisions 최근 20개 → 노션 DB (같은 SoT Key 는 갱신)
npm run sync:notion:pull -- 50    # 노션 DB 행 → notion-queue.md 에 append 만 (이미 있는 page_id 는 스킵, SoT 자동 병합 없음)
npm run sync:notion:ocr -- path/to/ocr-payload.json   # OCR 리소스(+선택 서머리) 페이지 생성 — `notion-ocr-pipeline.md`
npm run sync:notion:ocr:telegram-batch -- memory/inbox/telegram-ocr-snapshot-20260408.md   # 인박스 스크린샷 블록 일괄 푸시
npm run sync:notion:records -- --since today           # 오늘 변경된 ADR·트러블슈팅·세션 로그 → 두 DB 자동 푸시
```

MCP: `notion_push_decisions`, `notion_push_ocr_pair`, `notion_pull_to_queue`, `sync_to_notion`. 클라이언트는 `@notionhq/client@2.2` (Notion API `databases.query`).

### 기록 레이어 자동 동기 (`sync_to_notion`)

ADR(`docs/adr/`)·트러블슈팅(`docs/troubleshooting/`)·세션 로그(`memory/logs/sessions/`)를 git 커밋만 하면 노션 두 DB로 자동 흘려보낸다.

- **분기**: `docs/adr/*.md`·`docs/troubleshooting/*.md` → **지식 허브 DB**(상태 `초안`, 카테고리 `🔧 시스템·아키텍처`). `memory/logs/sessions/*.md` → **EXECUTION LOG DB**.
- **CLI**: `npm run sync:notion:records -- --since today` (또는 ISO 날짜, 예: `--since 2026-05-01`). `--json` 추가 시 결과 JSON 출력.
- **자동 트리거**: `.claude/hooks/post-session.sh` Stop hook이 변경 있을 때만 호출. 실패해도 세션 종료 비차단.
- **멱등 키**: 파일 경로 SHA-256 32자 → `SoT Key` rich_text 컬럼. 동일 키는 페이지 갱신, 신규는 페이지 생성. **DB에 `SoT Key` 텍스트 열 필수**.
- **DB 스키마 가정**: 한국어 UI 기본(`이름`·`상태`·`카테고리`·`SoT Key`). 컬럼명이 다르면 `.env`로 오버라이드. 상태가 Status 타입이 아니면 `NOTION_KNOWLEDGE_HUB_STATUS_KIND=select`.
- **본문 매핑 한계**: 노션 페이지당 children **95블록**까지(노션 100 한도). 더 긴 문서가 필요하면 페이지 분할.

## 텔레그램 봇 인박스 (폴링)

로컬에서 HTTP 서버 없이 **폴링**으로 메시지를 받는다 (`src/telegram-bot.ts`).

1. `.env`에 `TELEGRAM_BOT_TOKEN`, (권장) `TELEGRAM_CHAT_ID` 설정.
2. `npm run bot` — 종료는 `Ctrl+C`.


| 수신 내용            | 동작                                                     |
| ---------------- | ------------------------------------------------------ |
| `http(s)` URL 포함 | 기존 `ingest/url` (`ingestUrl`)로 `memory/ingest/url/` 저장 |
| URL 없는 텍스트·사진(OCR) | `memory/inbox/telegram/YYYY-MM-DD.md`에 append (날짜는 Asia/Seoul). 과거 단일 파일 `telegram-inbox.md`는 레거시. |


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
  MEMORY.md                  # 활성 프로젝트·인프라·다음 후보 한눈 요약
  decisions/*.md             # 운영 결정 메모 (append_decision MCP)
  metrics/evaluations/*.md   # Evaluator 구조화 로그 (MCP log_evaluation)
  logs/sessions/*.md         # 세션 작업 로그 (한 일·변경 파일·결정·다음 세션)
  ingest/rss/geeknews/*.md
  ingest/url/*.md            # 단일 URL 인제스천
  rules/
    agent-harness.md
    pge-pipeline.md
    notion-sync.md
    recording-rules.md       # ADR·작업 로그·트러블슈팅 기록 규칙 단일 SoT
    evaluator-checklist.md
  inbox/
    notion-queue.md      # 노션 풀 → SoT 병합 전 큐
    telegram/            # 텔레그램 일별 인박스 YYYY-MM-DD.md (npm run bot)
    telegram-inbox.md    # 레거시 단일 인박스(과거 로그)
docs/
  adr/                       # 아키텍처 결정 기록 (ADR-001~ ; TEMPLATE.md)
  troubleshooting/           # 에러 해결 완료 기록 (증상→원인→해결→교훈)
```

기록 규칙 분담은 `memory/rules/recording-rules.md` 단일 파일이 SoT. ADR·트러블슈팅·세션 로그의 노션 자동 동기는 위 §노션 동기 참고(`sync_to_notion` MCP / `npm run sync:notion:records` / Stop hook).

## MCP 도구

| 도구 | 설명 |
| --- | --- |
| `get_context` | SoT 스냅샷 JSON (`profile`, `active_project`, 최근 `decisions`, `recent_ingest`, `notion_queue` 미리보기 등). |
| `append_decision` | `memory/decisions/`에 결정 로그 마크다운을 추가한다. |
| `log_evaluation` | Evaluator 구조화 로그. **필수 인자:** `verdict`, `task`, `files_changed`, `revise_count`, `quality_scores`(5키), `checklist`(8키). **선택:** `body`(프론트매터 아래 마크다운), `date`(YYYY-MM-DD·생략 시 **Asia/Seoul** 당일). 저장: `{memory_root}/metrics/evaluations/eval-{날짜}-{3자리순번}.md` — 프론트매터에 `id`, `date`, `type: evaluation`, 위 필드가 들어간다. 같은 날짜의 기존 `eval-*.md`를 보고 순번을 증가시킨다. **응답:** JSON `ok`, `id`, `path`, `date`, `seq`. (호출 타이밍·필드 의미: `evaluator-vision-gate.mdc`, `evaluator-checklist.md`.) |
| `ingest_geeknews_rss` | GeekNews RSS → `memory/ingest/rss/geeknews/`. 인자 `limit` (1–100, 기본 20). |
| `ingest_url` | 단일 http(s) URL → `memory/ingest/url/`. 인자 `url`. |
| `search_memory` | `memory/` 이하 `.md`/`.yaml`/`.txt` 부분 문자열 검색. 인자 `query`, 선택 `max_results`. |
| `plan_task` | 목표를 `plan.v0` JSON 스텁으로 감싼다 (Planner). |
| `notion_push_decisions` | `memory/decisions` 최근 항목 → 노션 DB (멱등 `SoT Key`). |
| `notion_push_ocr_pair` | OCR 리소스 DB(원문)+서머리 DB(정제본, relation). 인자·`.env`는 `memory/rules/notion-ocr-pipeline.md`. |
| `notion_pull_to_queue` | 노션 DB 행 → `memory/inbox/notion-queue.md`에 append 만. |
| `sync_to_notion` | git log 기준 변경된 `docs/adr/`·`docs/troubleshooting/`·`memory/logs/sessions/` 마크다운을 두 노션 DB로 자동 푸시 (멱등 `SoT Key`). 인자 `since` (기본 `today`, ISO 날짜 가능). `.claude/hooks/post-session.sh` Stop hook으로 자동 트리거. |

그 외 RSS 전용 MCP(`ingest_yozm_rss`, `ingest_aitimes_rss`, `ingest_themilk_rss`, `ingest_paulgraham_rss`, `ingest_samaltman_rss`, `ingest_karpathy_rss`)는 각각 대응 피드를 `memory/ingest/rss/{이름}/`에 저장한다. 인자는 공통으로 선택 `limit` (1–100, 기본 20).

## 문서

- 컨텍스트·하네스 체계: `docs/CONTEXT-AND-HARNESS-SYSTEM.md` · 에이전트 진입: `AGENTS.md`
- Claude·타 클라이언트 맥락 일괄 이관: `docs/CLAUDE-CONTEXT-BOOTSTRAP.md`
- 비전·요구: `docs/VISION-AND-REQUIREMENTS.md`
- 킥오프: `docs/IMPLEMENTATION-KICKOFF.md`
- 경쟁사 레퍼런스: `docs/competitive-reference/` (예: `membase-aristo.md`)

