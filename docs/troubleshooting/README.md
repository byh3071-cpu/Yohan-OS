---
id: troubleshooting-readme
date: 2026-05-06
tags: [troubleshooting, index]
status: active
---

# docs/troubleshooting/

에러 해결 과정 기록. 한 사건 = 한 파일.

## 파일명 규칙

`{YYYY-MM-DD}-{에러-키워드}.md`

예: `2026-04-10-dashboard-eaddrinuse-4000.md`

## 포맷

```markdown
---
id: ts-YYYY-MM-DD-키워드
date: YYYY-MM-DD
tags: [troubleshooting, ...]
related: []
---

# {증상 한 줄}

## 증상
{무엇이 어떻게 일어났나}

## 원인
{왜 일어났나 — 검증된 가설만}

## 해결
{무엇을 해서 어떻게 풀렸나 — 명령어·diff 포함}

## 교훈
{다음에 같은 사건을 어떻게 막을지}
```

## 기록 규칙

- 에러 해결 **완료 시점**에 작성. 진행 중인 디버깅은 메모리만 쓰고 끝나면 정리.
- 운영 차원의 재발 방지 규칙으로 굳어지면 `memory/rules/`에 별도 규칙 문서로 승격.
- 기록 규칙 전체: [`memory/rules/recording-rules.md`](../../memory/rules/recording-rules.md)
