---
ticket_id: 002
title: 용어 md 프론트매터 규격 + 폴더 구조 확정
phase: 3-구현
priority: high
status: done
created: 2026-04-15
closed: 2026-04-16
depends_on: [001]
---

## 목표
- 사전뷰어 md 파일들이 따를 **프론트매터 표준**과 폴더 배치 규칙을 확정해 Starlight 콘텐츠 콜렉션으로 동작하게 한다.

## 범위
- **하는 것:** `yohan-ai-dictionary/src/content.config.ts` 또는 `content/config.ts` 스키마 확장, 프론트매터 필드 정의, README 메모.
- **안 하는 것:** 실제 용어 내용 작성(003 티켓), 디자인 토큰.

## 제약
- Starlight 기본 schema(`docsSchema`)를 상속해 확장할 것.
- `source:` 필드는 **선택적**. 원천이 `memory/wiki/`에 있는 용어만 기입.
- vision.md 핵심 제약: "SoT 단일화" 반드시 반영.

## 프론트매터 규격 (결정)
```yaml
---
title: 하네스엔지니어링             # 필수. 용어 이름.
description: 한 줄 요약              # Starlight 기본 필드. 검색 미리보기.
status: draft | review | stable | deprecated
created: 2026-04-15
updated: 2026-04-15
source: memory/wiki/concepts/harness-engineering.md   # 선택. 원천 있을 때만.
tags: [context-engineering, harness]                  # 선택.
---
```

## 완료 기준
- [x] `yohan-ai-dictionary/src/content.config.ts` (또는 동등 파일) 에 status/source/created/updated 필드 추가
- [x] 테스트용 더미 md 1개로 스키마 검증 (빌드 에러 없음)
- [x] `yohan-ai-dictionary/README.md`에 프론트매터 규격 요약 1문단

## AI 리포트
- Phase 1 종료 SoT와 정합. 스키마·README 반영 완료(2026-04-16).
