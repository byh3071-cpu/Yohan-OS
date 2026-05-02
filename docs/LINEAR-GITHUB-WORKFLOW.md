---
id: linear-github-workflow
date: 2026-04-23
tags: [dashboard, linear, github, workflow, yohan-os]
---

# Linear + GitHub — 1인 워크플로

**저장소**: `byh3071-cpu/Yohan-OS` · **백로그 단일 소스**: [`DASHBOARD-TICKET-BACKLOG.md`](./DASHBOARD-TICKET-BACKLOG.md)

## 역할 나누기 (추천)

| 도구 | 역할 |
|------|------|
| **GitHub Issues** | 구현·PR과 붙이기 쉬움 → **실행 권한 있는 작업 티켓의 정본(SoT)** 으로 쓰기 |
| **Linear** | 같은 티켓을 **오늘 할 일·우선순위·사이클**용으로만 옮겨 적거나, GitHub와 **연동**해 미러 |

1인이면 둘 다 풀 세팅할 필요 없음. **GitHub만 써도 충분**하고, Linear는 “보드가 더 편하면” 추가하면 된다.

---

## GitHub — 이슈 일괄 생성

1. [GitHub CLI](https://cli.github.com/) 설치
2. 터미널: `gh auth login` (repo 권한)
3. 레포 루트에서:

```bash
npm run issues:dashboard:dry
npm run issues:dashboard
```

- 라벨 `dashboard-roadmap` 이 자동 생성·부착된다.
- 제목 형식: `[DB-101] …` (백로그 ID와 동일)

**이미 이슈가 있을 때**: 스크립트는 중복을 막지 않는다. 재실행 전 GitHub에서 같은 `[DB-*]` 제목 검색 후 필요하면 닫거나 스킵한다.

---

## Linear — 설정 (1인)

1. Linear 워크스페이스에서 **Team을 하나만** 둔다 (예: `Yohan OS`).
2. (선택) **Project** 하나: `Dashboard` — 백로그 이슈만 묶기.
3. Cursor **Linear 플러그인 / MCP** 연결 시 인증이 필요하면 도구 **`mcp_auth`** 로 로그인한다.
4. **이슈 만들기**
   - GitHub에서 만든 이슈와 맞추려면: Linear 이슈 설명에 GitHub 이슈 URL을 넣거나,
   - Linear **GitHub 통합**으로 리포지토리 연결 후 이슈·PR 링크를 자동 연결할 수 있다 (Linear 설정 → Integrations → GitHub).

**참고**: Cursor 세션에 따라 Linear MCP에 “이슈 생성” 도구가 안 보일 수 있다. 그 경우 Linear 웹에서 제목을 `[DB-101] …` 형식으로 **수동 생성**해도 워크플로는 동일하다.

---

## PR 규칙

- PR 제목 또는 본문에 **`DB-102`** 같은 ID를 넣어 GitHub 이슈와 연결: `Closes #123` 또는 `Refs #123`

---

## 요약

1. `npm run issues:dashboard` 로 GitHub에 9개 티켓 생성  
2. Linear는 팀 1개 + (선택) 프로젝트 + GitHub 연동으로 **같은 작업을 보드에서만 다시 보기**  
3. 구현 순서는 백로그 표의 **순서** 열 그대로
