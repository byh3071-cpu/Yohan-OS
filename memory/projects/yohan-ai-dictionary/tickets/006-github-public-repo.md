---
ticket_id: 006
title: GitHub 공개 repo push + README
phase: 4-MVP
priority: medium
status: done
created: 2026-04-15
closed: 2026-04-16
depends_on: [005]
---

## 목표
- `yohan-ai-dictionary/`를 독립 공개 GitHub repo로 푸시하고 README에 "왜 만들었는지" + 로컬 실행법을 적는다. Yohan OS 본체는 공개하지 않는다.

## 범위
- **하는 것:** `yohan-ai-dictionary/` 하위에 별도 `.git` 초기화 또는 `git subtree` 로 분리, GitHub 공개 repo 생성, 첫 push, README 작성.
- **안 하는 것:** Vercel 배포(Phase 3), GitHub Actions, 템플릿화.

## 제약 (vision.md 핵심 제약 반영)
- **비공개 데이터 유출 금지:**
  - `memory/`, `docs/`, `.claude/`, `.cursor/`, `.env`, `memory/decisions/` 절대 포함 안 됨.
  - `yohan-ai-dictionary/` 하위만 push.
- Yohan OS 본체 repo와 history가 섞이면 안 됨. 독립 repo로 만들 것.
- README는 한국어 우선, 영어 보조.

## 방법 제안 (요한님 선택)
- **A. 가장 단순:** `yohan-ai-dictionary/` 폴더 안에서 `git init` → 새 origin 연결 → push. (Yohan OS의 상위 `.git`과 별개)
- **B. git subtree:** `git subtree push --prefix=yohan-ai-dictionary ...`. 장기적으로 깔끔하지만 첫 세팅이 복잡.
- **추천:** A. Phase 1 단순성 우선.

## README 섹션
1. 프로젝트 소개 (1문단)
2. 왜 만들었는가 (vision.md 요약 3줄)
3. 로컬 실행법 (`npm install && npm run dev`)
4. 폴더 구조
5. 기여 방법 (Phase 3 이전까지는 "readonly")
6. 라이선스 (MIT)

## 완료 기준
- [x] GitHub `byh3071-cpu/yohan-ai-dictionary` (또는 원하는 이름) 공개 repo 생성
- [x] 첫 commit + push 성공
- [x] README 6개 섹션 작성
- [x] Yohan OS 본체에는 `yohan-ai-dictionary/.git/`가 체크인되지 않도록 `.gitignore` 확인
- [x] `current-phase.md` 업데이트 + Phase 1 완료 표시

## AI 리포트
- 공개 repo: https://github.com/byh3071-cpu/yohan-ai-dictionary — `current-phase.md` Phase 1 완료와 정합(2026-04-16).
