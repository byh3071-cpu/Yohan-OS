---
id: wiki-ops
date: 2026-04-12
domain: knowledge-management
tags: [wiki, ops]
related: [archiving-appraisal-feynman, wiki-spec-v2]
status: active
---

# Wiki 운영 규칙

## 위치
- 위키: memory/wiki/ | 명세: docs/WIKI-SPEC-v2.md | 스킬: .cursor/skills/wiki-ops/SKILL.md

## 트리거
- 새 insights (standard+ & status:insight) → /wiki-ingest
- 주간 리뷰 → /wiki-lint
- 지식 질문 → /wiki-query → (선택) /wiki-answer

## 불변 규칙
- insights 본문 수정 금지 (프론트매터 related만 추가).
- Verified 문장은 [source:] 태그 필수.
- Inferred TTL 30일 초과 → expired.
- Cap 초과 시 병합 후보 제시 → 사용자 Yes/No.
- 엔티티/컨셉 삭제 전 사용자 확인 필수.

## 내재화
- 주 1회 MVI. Level 1(30초) 필수, Level 2~3 선택.
- /wiki-query 후 "한 줄 생각?" 프롬프트 → Owner Notes.

## 감사
- 분기 1회 랜덤 5건 수동 대조 (15분).