---
id: session-2026-05-06-adr-sync-complete
date: 2026-05-06
verdict: pass
tags: [adr, notion-sync, blog, readme, recording-rules, frontmatter, hook]
related:
  - docs/adr/ADR-004-mcp-server-architecture.md
  - docs/adr/ADR-006-notion-as-sot-mirror.md
  - memory/rules/recording-rules.md
  - memory/logs/sessions/session-2026-05-06-1311.md
  - memory/logs/sessions/session-2026-05-06-notion-sync-setup.md
status: done
---

# ADR 체계 도입 + Git→Notion 동기화 검증 완료

오전 ADR 도입 → Notion 동기 셋업 → 블로그 시리즈 작성으로 이어진 흐름의 마무리. 노션 검증까지 끝나면서 "기록을 git 커밋만 하면 노션 두 DB로 자동 흐른다"는 파이프라인이 처음으로 끝단까지 동작.

## 한 일

- **ADR 체계 도입 (적응형 B)** — `docs/adr/` 신설 + `memory/decisions/`와 병행. 아키텍처급은 ADR, 운영 메모는 decisions/. 회고성 ADR-001~007 동시 작성. 노션 가이드의 `docs/log/`·루트 `CLAUDE.md` 신설은 이중 SoT 회피로 기각.
- **Git→Notion 동기화 구현·검증** — MCP 도구 `sync_to_notion` + CLI `npm run sync:notion:records` + Stop hook `.claude/hooks/post-session.sh`. SHA-256 32자(`SoT Key`)로 멱등.
- **블로그 3편 시리즈 완성** — `memory/projects/yohan-ai-dictionary/blog-drafts/` 1/3·2/3·3/3 (3/3은 두 파일).
- **README 3차 패치** — sync_to_notion 섹션·환경변수·SoT 레이아웃 추가. 백틱 깨짐 1회 발생 후 복구.
- **자동 포매터 방어** — `docs/DASHBOARD-TICKET-BACKLOG.md` frontmatter가 `## id:` 헤딩으로 변환된 사고 1차 발생 → `.prettierignore`로 md 제외하고 frontmatter 복구. 동일 패턴 backlog md에서 재발 → 별도 커밋으로 재차 정리.
- **`.gitignore`·`.claude/` 정리** — `.env.example` 노출, `.claude/` 무시 등.

## 검증

`npm run sync:notion:records -- --since today --json` 최종:

- synced: ADR 7건 created (지식 허브 DB · 카테고리 `🔧 시스템·아키텍처` · 상태 `초안`)
- skipped: 세션 로그 2건 (이전 세션에서 푸시한 페이지를 SoT Key로 재인식)
- errors: 0
- by_kind: `{adr: 7, "session-log": 0, troubleshooting: 0}`

검증 도중 잡힌 3단 디버그:

1. `--since 2026-05-06` → git log 빈 결과 → ISO 날짜 파싱 버그 식별
2. `--since today` 재시도 → `NOTION_KNOWLEDGE_HUB_DB_ID`가 DB가 아닌 페이지 ID로 등록돼 있어 query 실패 → 정정
3. DB 정정 후 `상태 is expected to be select` → `.env`에 `NOTION_KNOWLEDGE_HUB_STATUS_KIND=select` 추가 (DB의 `상태` 컬럼이 노션 Status 타입이 아닌 일반 Select라서)

## 변경 파일 (오늘 커밋 기준)

- ADR/기록 규칙: `ac64894`, `34b7dfb` (template + 7개 + recording-rules)
- MEMORY: `0fc61b0` (MEMORY.md 초기화)
- 블로그 시리즈: `c11ff1e` (1/3) · `2a31e9d` (2/3) · `5413d0e`/`2531047` (3/3, 두 파일)
- README: `ebc7b6e` (sync_to_notion 반영) · `9ac5abd` (SoT 레이아웃) · `d23b0cc` (백틱 복구)
- 자동 포매터 방어: `6cb2eda` (md 제외 + frontmatter 복구) · `e17273e` (backlog 재정리)
- 메타·기타: `15a32dc` (.claude/ gitignore + CLAUDE.md stub)
- Git→Notion 코드: `cc30843` (직전 세션 구현분)

## 결정·이슈

- 노션 DB 컬럼 타입은 환경변수로 흡수 (Status vs Select). DB 스키마 변경보다 코드의 `*_STATUS_KIND` / `*_CATEGORY_KIND` env가 운영상 더 가벼움.
- 자동 포매터 누수가 같은 패턴(`---` frontmatter → `## id:` 헤딩, `[]()` → `` `[]()` ``)으로 두 번 재발. `.prettierignore`만으로는 부족할 수 있음 — Cursor 측 마크다운 포매터 후크가 의심됨. 재발 시 즉시 커밋으로 격리하고 원인 추적.
- DB ID는 항상 **데이터베이스 풀 페이지 뷰의 URL에서** 가져올 것. 인라인 DB의 부모 페이지 URL을 쓰면 페이지 ID가 박힘.

## 잔여 (다음 세션)

- **since 버그 1줄 패치**: `src/notion/sync-records.ts:293`
  - 현: `const sinceArg = since === "today" || !since ? "midnight" : since;`
  - `YYYY-MM-DD` 형태에 ` 00:00` 자동 부착해 `git log --since=...` 빈 결과 회피.
- (선택) 자동 포매터 누수 모니터 — 재발 시 Cursor 측 설정 점검.
- (선택) 작업 트리에 Cursor 동시 작업분 다수 modified/untracked 잔존 — 다음 세션 시작 시 `git status`로 충돌 여부 우선 확인.
