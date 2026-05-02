---
ticket_id: 007
title: Vercel 1차 배포 (공개 도메인)
phase: 3-Deploy
priority: high
status: open
created: 2026-05-02
depends_on: [006]
---

## 목표

- `yohan-ai-dictionary` 공개 repo(`https://github.com/byh3071-cpu/yohan-ai-dictionary`)를 Vercel에 연결해 **공개 URL 1차 배포**를 만든다.
- vision.md Phase 3 정의의 첫 마일스톤. 커스텀 도메인·템플릿화·블로그는 후속 티켓.

## 범위

- **하는 것**
  - Vercel 프로젝트를 yohan-ai-dictionary public repo에 연결.
  - Astro 빌드 프리셋, output dir = `dist`, install/build 커맨드는 기본값.
  - `main` 브랜치 push 시 자동 배포(프로덕션 URL).
  - 배포 URL을 `current-phase.md`·`active-project.yaml`에 기록.
- **안 하는 것 (후속 티켓)**
  - 008: GitHub 템플릿화 (`Use this template` 버튼).
  - 009: 빌드/학습 블로그 3편.
  - 커스텀 도메인 연결 (008 이후 또는 별도).
  - GitHub Actions 별도 빌드 검증 (Vercel 빌드로 충분).

## 제약 (vision.md 핵심 제약)

- **AI스러운 디자인 금지** — Starlight 기본 테마 그대로. 배포 후 디자인 토큰 손대지 않음.
- **비공개 데이터 유출 금지** — yohan-ai-dictionary public repo만 Vercel에 연결. Yohan OS 본체(`memory/`, `docs/`, `.cursor/`, `.claude/`, `.env`)는 절대 포함 안 됨. 005·006 티켓 시점 가드가 그대로 유효한지 첫 배포 직후 1회 확인.
- 빌드 산출물은 `dist`만 사용 (이미 `verify:dist` 확인 통과).

## 사전 조건 (이미 충족)

- [x] `yohan-ai-dictionary` 별도 공개 repo로 push됨 (티켓 006).
- [x] `npm run build && npm run preview` 17용어 검색·내부 링크 정상 (2026-05-02 회귀 확인).
- [x] Yohan OS `.gitignore`에 `yohan-ai-dictionary/` 제외 (이전 커밋).

## 작업 단계

1. Vercel 대시보드에서 New Project → GitHub `byh3071-cpu/yohan-ai-dictionary` import.
2. Framework preset: **Astro**, root: `/`, build command 기본, output: `dist`.
3. 첫 배포 트리거 → 빌드 로그 확인 (오류 시 `package.json` engines·Node 버전 점검).
4. 배포 URL 응답 확인:
   - 첫 페이지 렌더 OK
   - 17용어 사이드바 노출
   - 검색 입력 → Pagefind 결과
   - 내부 `## 관련 용어` 링크 점프
5. `memory/projects/yohan-ai-dictionary/current-phase.md` Phase 3 진척도 갱신 + URL.
6. `memory/active-project.yaml` notes에 한 줄 추가.

## 완료 기준

- [ ] Vercel 프로젝트 생성·main 자동 배포 활성.
- [ ] 공개 URL 200, 17용어 정상 렌더·검색·링크 점프.
- [ ] `current-phase.md`에 URL·Phase 3 1차 배포 ✅ 표기.
- [ ] `active-project.yaml` notes 갱신.
- [ ] 비공개 데이터 비포함 재확인 (배포 산출물에 `memory/` 흔적 없음).

## 후속

- **008** GitHub 템플릿화 — repo Settings → Template 토글 + README "이 템플릿으로 시작하기" 섹션.
- **009** 빌드/학습 블로그 3편 — Phase 3 vision.md 정의 충족.
