---
id: dashboard-quick-actions
date: 2026-04-09
domain: dashboard
tags: [dashboard, guide, quick-actions, ui]
related: [dashboard-spec]
status: active
---

# 웹 대시보드 빠른 실행 가이드

로컬 대시보드(`dashboard/`) 사이드바·커맨드 팔레트에서 **같은 액션 키**로 실행된다. 이 문서는 각 버튼이 **무엇을 하는지**, **v1에서 실제로 도는지**만 정리한다.

---

## 1. 왜 `memory/rules/`에 넣었나

- **SoT에 남긴다** — 대시보드 동작과 레포 스크립트가 바뀔 때 같이 고칠 문서다.
- **대시보드 라이브러리에 보인다** — `rules` 카테고리에서 바로 열어볼 수 있다.
- `docs/DASHBOARD-SPEC.md`는 전체 스펙·로드맵용, **버튼별 설명은 이 파일이 단일 참조**다.

---

## 2. 액션별 설명

| action key | 한글 라벨(예시) | 역할 | v1 동작 |
|------------|----------------|------|--------|
| `ingest:url` | URL 인제스트 | 클립보드/CLI 인자 없이 기본 URL 인제스트 CLI 실행 | 루트에서 `npx tsx src/ingest-url-cli.ts` |
| `ingest:all` | RSS 수집 | 등록된 RSS 전체 수집 | `npm run ingest:all` |
| `sync:notion:push` | 노션 푸시 | SoT → 노션 반영 | `npm run sync:notion:push` |
| `sync:notion:pull` | 노션 풀 | 노션 → 큐/동기 | `npm run sync:notion:pull` |
| `report:weekly` | 주간 리포트 | 배치 로그 기반 주간 건강 리포트 | `npm run report:weekly` |
| `check:drift` | 드리프트 점검 | 규칙·문서 링크 등 드리프트 점검 | `npm run check:drift` |
| `search:memory` | 메모리 검색 | memory/ 검색 CLI | `npm run search:memory` |
| `automation:batch` | 배치 실행 | 자동화 배치 한 번 실행 | `npm run automation:batch` |
| `build` | MCP 빌드 | TypeScript 빌드(MCP 번들) | `npm run build` |
| `git:sync` | Git 동기화 | `git pull && git push` | PowerShell에서 순차 실행 |
| `bot:status` | 봇 상태 | 텔레그램 봇은 별도 프로세스 | **MCP 번들 점검**으로 대체: `npm run mcp:check` (봇 PID는 v2 예정) |
| `new:decision` | 새 결정 | 결정 노트 생성 | v1: 안내 메시지만 (v2에서 폼·템플릿) |
| `new:insight` | 새 인사이트 | 인사이트 노트 생성 | v1: 안내 메시지만 |
| `ocr:upload` | OCR 업로드 | 이미지 OCR 파이프 | v1: 안내 메시지만 |
| `view:changelog` | 체인지로그 | Git 기반 변경 요약 뷰 | v1: 안내 메시지만 |
| `view:evaluator` | 평가 로그 | Evaluator 로그 뷰 | v1: 안내 메시지만 |

---

## 3. 주의

- 빠른 실행은 서버에서 **허용된 액션만** 실행한다 (`dashboard/src/app/api/run/route.ts`의 `ALLOWED_ACTIONS`).
- 일부 CLI는 `.env`·노션 키·네트워크가 없으면 실패한다 — 토스트/응답의 stderr를 본다.
- **Git 동기화**는 충돌·인증 문제 시 실패할 수 있다.

---

## 4. 관련 파일

- 액션 허용 목록·명령 매핑: `dashboard/src/app/api/run/route.ts`
- 사이드바 버튼 정의: `dashboard/src/components/sidebar.tsx`
- 커맨드 팔레트(일부 액션만): `dashboard/src/components/command-palette.tsx`
- 전체 UI 스펙: `docs/DASHBOARD-SPEC.md`
