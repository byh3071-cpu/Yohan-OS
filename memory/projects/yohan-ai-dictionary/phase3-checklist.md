---
id: yohan-ai-dictionary-phase3-checklist
date: 2026-05-02
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [phase3, deploy, checklist]
related: [yohan-ai-dictionary, yohan-ai-dictionary-current-phase]
status: active
---

# Phase 3 실행 체크리스트 (사전 뷰어 코드 레포에서 수행)

코드는 **Yohan OS 레포 밖** 별도 클론(`yohan-ai-dictionary`)에서 진행한다. 여기는 순서만 정리한다.

## P3-1 공개 준비

- [ ] `.env`·`memory/decisions/`·개인 키가 **공개 브랜치에 없음** 재확인 (`vision.md` 비범위 준수).
- [ ] `npm run build` 무오류, `npm run preview`로 검색·내부 링크 스모크 테스트.

## P3-2 Vercel 배포

- [ ] GitHub에 공개 repo 푸시(또는 기존 원격 연결).
- [ ] [Vercel](https://vercel.com)에서 해당 repo Import → Framework **Astro** 자동 인식 확인.
- [ ] Build command 기본 `astro build`, Output `dist` 확인.
- [ ] 배포 URL로 모바일·데스크톱 동작 확인.

## P3-3 GitHub 템플릿화

- [ ] Repo **Settings → Template repository** 활성화.
- [ ] README에 “Use this template”, 로컬 실행 3줄, Starlight 문서 경로 안내.
- [ ] `LICENSE` MIT 유지 여부 확인.

## P3-4 공개 글·학습 로그 (비전: 3편 또는 동등)

- [ ] 글 1: 왜 Starlight + md로 사전을 만들었는지(비전·제약).
- [ ] 글 2: `source:`와 `memory/wiki` 정합 운영법.
- [ ] 글 3: 템플릿으로 복제 후 첫 빌드까지 타임라인.

## P3-5 지속

- [ ] 월 1회 `npm run build`.
- [ ] 용어–`memory/wiki` 문장 드리프트 시 한 건씩 동기화.

완료 후 `current-phase.md`에서 Phase 3를 종료로 표시하고 피드백 루프(실사용 1주)로 넘긴다.
