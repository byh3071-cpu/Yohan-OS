---
id: session-log
date: 2026-04-09
domain: harness
tags: [sessions, logs, harness, agent]
related: [agent-harness, dashboard-spec]
status: active
---

# 세션 로그 규칙

에이전트가 **실질적 작업을 한 세션 종료 시** `memory/logs/sessions/session-YYYY-MM-DD-HHMM.md`를 남긴다.

---

## 1. 언제 남기나

- 파일을 **1개 이상 변경/생성**한 세션 → 필수.
- 단순 질문·확인만 한 세션 → 생략 가능.

## 2. 포맷

```yaml
---
id: session-YYYY-MM-DD-HHMM
date: YYYY-MM-DD
duration_min: (대략 추정)
files_changed: (정수)
verdict: pass | revise | reject
tags: [작업 관련 태그]
---
```

```markdown
# 세션 요약

## 한 일
- (bullet 3~5개)

## 변경 파일
- `path/to/file.ts` — 이유

## 결정
- (이 세션에서 내린 결정, 없으면 "없음")

## 다음 세션에 전달
- (이어서 해야 할 것, 주의사항)
```

## 3. 제한

- 본문 **50줄 이내**. 세션 로그는 전체 기록이 아니라 요약이다.
- 코드 블록 삽입 금지 — 파일 경로만 남긴다.
- 시크릿·토큰 절대 포함 금지.

## 4. 활용처

- `GET /api/sessions` (v2 예정) → 대시보드 라이브 피드·브리핑
- 다음 세션 `get_context` 시 최근 세션 로그 참조 가능
