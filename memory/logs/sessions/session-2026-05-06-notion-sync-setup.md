---
id: session-2026-05-06-notion-sync-setup
date: 2026-05-06
tags: [session-log, notion-sync, mcp, hook, claude-code, automation]
related:
  - docs/adr/ADR-004-mcp-server-architecture.md
  - docs/adr/ADR-006-notion-as-sot-mirror.md
  - memory/rules/recording-rules.md
status: done
---

# Notion 자동 동기화 셋업 — Claude Code Stop hook + MCP `sync_to_notion`

기록 레이어(ADR·세션 로그·트러블슈팅)를 git 커밋만 하면 노션 두 DB로 자동 흘러가게 만들었다. ADR 체계 도입(2026-05-06 오전) 직후의 자연스러운 후속.

## 한 일

- **MCP 도구 `sync_to_notion` 추가** — `since` 옵션(기본 `today`, ISO 날짜 가능). git log로 변경 파일 수집 후 경로별 분기:
  - `docs/adr/*.md`, `docs/troubleshooting/*.md` → 지식 허브 DB (상태 `초안`, 카테고리 `🔧 시스템·아키텍처`).
  - `memory/logs/sessions/*.md` → EXECUTION LOG DB.
- **CLI**: `npm run sync:notion:records -- --since today [--json]`.
- **Stop hook**: `.claude/hooks/post-session.sh` — 변경이 있을 때만 호출, 실패해도 세션 종료 비차단.
- **멱등성**: 파일 경로 SHA-256 32자 → `SoT Key` rich_text 컬럼. 동일 키는 중복 페이지 생성 안 함.
- **본문 변환**: 마크다운 → Notion blocks (heading 1~3, paragraph, bulleted/numbered list, code) 최대 95블록.

## 변경 파일

- `src/notion/notion-records-env.ts` (added) — `NOTION_KNOWLEDGE_HUB_*` · `NOTION_EXECUTION_LOG_*` 환경 변수 로딩, status `notion_status` vs `select` 분기, category `select` vs `multi_select` 분기.
- `src/notion/sync-records.ts` (added) — git log 수집·분류·블록 변환·멱등 푸시.
- `src/notion-sync-records-cli.ts` (added) — `npm run sync:notion:records` 진입점.
- `src/index.ts` (modified) — MCP 도구 `sync_to_notion` 등록.
- `package.json` (modified) — `sync:notion:records` 스크립트.
- `.claude/hooks/post-session.sh` (added) — Stop hook 본체. `chmod +x` 적용.
- `.env.example` (added) — 노션·텔레그램·OpenAI 키 문서화 (실제 시크릿은 `.env`에만, gitignored).
- `.gitignore` (modified) — `!.env.example` 예외 추가(이전엔 `.env.*` 패턴이 `.env.example`까지 무시).
- `AGENTS.md` (modified) — §6 기록 레이어에 노션 동기화 한 줄 추가.

## 결정·이슈

- **노션 DB 스키마 가정**: 한국어 UI 기본값(`이름`·`상태`·`카테고리`·`SoT Key`). 실제 DB 컬럼명이 다르면 `.env`로 오버라이드. 상태 컬럼이 Status 타입이 아니면 `NOTION_KNOWLEDGE_HUB_STATUS_KIND=select`로 전환.
- **Stop hook 자동 등록**: `.claude/settings.json`의 `hooks.Stop`에 `bash .claude/hooks/post-session.sh` 등록은 별도. 사용자 결정 후 `update-config` 스킬로 처리할지, 직접 수동 등록할지 선택.
- **Windows 호환**: hook은 bash 스크립트라 git bash가 PATH에 있어야 함. PowerShell 환경 정책상 추후 `.ps1` 변형이 필요해지면 추가.
- **본문 매핑 한계**: 노션 페이지당 children 100 블록 한도라 95개로 잘림. 더 긴 문서가 필요하면 페이지 분할 또는 `synced_block` 도입.
- **블로킹 방지**: hook 본문 끝에 `exit 0` + `|| true` 이중 안전. 노션 토큰 부재 시 조용히 종료.

## 다음 세션

- 사용자가 노션 워크스페이스에서 두 DB 만들고 ID·컬럼명 확인 → `.env`에 채움 → `npm run sync:notion:records`로 1회 수동 실행해 ADR 7건 + 세션 로그 + 본 글 자체가 정상 푸시되는지 검증.
- Stop hook 자동 등록 결정.
- `update-config` 스킬로 settings.json `hooks.Stop` 등록 (사용자 승인 후).
