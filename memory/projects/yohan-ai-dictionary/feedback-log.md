---
id: yohan-ai-dictionary-feedback-log
date: 2026-04-16
tags: [dictionary, uat, phase1]
status: active
---

# Yohan AI Dictionary — Phase 1 검증 로그

## 티켓 005 시나리오 결과

| # | 시나리오 | 결과 | 메모 |
|---|----------|------|------|
| 1 | 홈 `/` Starlight 레이더 | PASS | `http://localhost:4321/` 로드, 히어로·섹션 정상 |
| 2 | 사이드바 10개 용어 | PASS | `/terms/` 및 각 용어 경로에서 사이드바 네비 확인 |
| 3 | 검색 → "하네스" → harness | **조건부** | `astro dev`에서는 Starlight가 검색 비활성 안내를 표시. **검색 UI 검증은 `npm run build` 후 `npm run preview`로 접속한 URL에서** 수행할 것. `127.0.0.1:4321` 루트는 환경에 따라 404일 수 있음 → **`localhost:4321` 사용 권장**. |
| 4 | 관련 용어 링크 점프 | PASS | `/terms/context-engineering/` 등 직접 탐색으로 링크·렌더 확인 |
| 5 | harness `source:` 프론트매터 | PASS | `memory/wiki/concepts/harness-engineering.md` 존재 |
| 6 | `npm run build` | PASS | 에러 없이 완료 (`dist/` 생성) |

## 불편·개선 메모 (3~5)

1. **검색은 dev가 아니라 preview 빌드에서 검증** — 티켓 시나리오 3은 로컬 워크플로를 `preview` 기준으로 적는 것이 정확함.
2. **`127.0.0.1` vs `localhost`** — preview가 `127.0.0.1`에만 바인딩되면 루트 404가 날 수 있음. 접속 URL을 문서에 명시하면 재현이 쉬움.
3. **홈 Phase 체크리스트** — 과거에 003·004가 미체크로 남아 있어 혼동 유발 → `index.mdx`에서 갱신함.
4. **Astro dev 포트** — 4321 사용 중이면 자동으로 4322 등으로 올라감. 문서/티켓에 "실제 포트는 터미널 확인" 한 줄 권장.

## 스크린샷

- 저장 경로: `memory/projects/yohan-ai-dictionary/screenshots/phase1.png` (AI 용어 목록 `/terms/` 뷰, 2026-04-16 캡처)
