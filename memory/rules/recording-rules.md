---
id: recording-rules
date: 2026-05-06
tags: [rules, recording, adr, log, troubleshooting]
related:
  - memory/rules/agent-harness.md
  - docs/adr/TEMPLATE.md
status: active
---

# 기록 규칙 — ADR · 작업 로그 · 트러블슈팅

세션·결정·에러를 잃지 않기 위한 SoT 기록 규칙. **에이전트가 자동 실행**하고, 사람은 감각적으로만 검수한다.

> 출처: 2026-05-06 노션 가이드 "요한 OS 웹앱 — ADR 도입 실행 가이드"를 본 프로젝트 구조(`memory/decisions/`, `memory/logs/sessions/` 병행 운영)에 맞춰 적응.

## 0. 분담 한 줄 정리

| 종류 | 위치 | 용도 |
|------|------|------|
| **운영 결정 메모** | `memory/decisions/{date}-{slug}.md` | 세션 단위 결정·사양 합의. `append_decision` MCP 자동 생성. 회수율·검색 우선. |
| **ADR (아키텍처 결정)** | `docs/adr/ADR-{번호}-{slug}.md` | 기술·DB·아키텍처 선택처럼 **되돌리기 비용 큰 결정**. 회고성 가능. |
| **세션 작업 로그** | `memory/logs/sessions/session-{date}-{slot}.md` | 세션별 무엇을 했나·무엇을 바꿨나. |
| **트러블슈팅** | `docs/troubleshooting/{date}-{키워드}.md` | 에러 해결 완료 시 증상→원인→해결→교훈. |
| **안정 규칙** | `memory/rules/{name}.md` | 위 기록들에서 반복돼 패턴이 굳어진 것. |

## 1. ADR (Architecture Decision Record)

### 트리거 — 작성해야 하는 시점

- 새 DB·언어·프레임워크·외부 서비스를 도입·교체할 때
- 메모리 구조·하네스 구조·SoT 위치가 바뀔 때
- 1인 운영 원칙·비전과 부딪치는 트레이드오프가 발생할 때

운영 차원의 작은 결정(태그 색상, 함수 시그니처 등)은 `memory/decisions/`로 충분.

### 형식

`docs/adr/TEMPLATE.md` 참조. 핵심 섹션:

1. 상태 (Proposed → Accepted → Deprecated → Superseded)
2. 맥락 (Context)
3. 결정 (Decision)
4. 대안 (Alternatives) — 표로 장점·단점·기각 사유
5. 결과 (Consequences) — 장점·단점·후속 작업

### 파일명·메타

- 파일명: `ADR-{3자리 번호}-{kebab-case-제목}.md` (예: `ADR-008-postgres-rls-policy.md`)
- 번호는 `docs/adr/` 내 마지막 번호 +1.
- YAML 프론트매터: `id`, `date`, `tags`, `status`, `related` 필수.

### 운영 결정 메모와의 관계

같은 결정을 두 곳에 적지 않는다. 흐름:

1. 세션 중 결정이 나오면 `memory/decisions/`에 빠르게 기록.
2. 그 결정이 **아키텍처 수준**으로 굳어지면 `docs/adr/`에 정식화.
3. ADR 본문 하단 "관련 결정·문서"에 원본 `memory/decisions/` 파일을 링크.

## 2. 작업 로그

### 트리거

- 세션 종료 시
- 주요 기능·페이즈 완료 시

### 위치·파일명

- `memory/logs/sessions/session-{YYYY-MM-DD}-{HHMM 또는 키워드}.md`
- `docs/log/`는 만들지 않는다. (이미 `memory/logs/sessions/`가 그 역할.)

### 포맷 (요약)

```markdown
---
id: session-YYYY-MM-DD-키워드
date: YYYY-MM-DD
tags: [session-log, ...]
related: []
---

# {세션 제목 한 줄}

## 한 일
- ...

## 변경 파일
- `path/to/file.md` (added | modified)

## 결정·이슈
- 결정 → `memory/decisions/...` 또는 `docs/adr/...` 링크
- 미해결 이슈는 다음 세션 입구에 적기

## 다음 세션
- ...
```

기존 `memory/logs/sessions/README.md` 컨벤션이 있으면 그것을 우선.

## 3. 트러블슈팅 로그

### 트리거

- 에러를 **해결 완료**한 시점. 진행 중인 디버깅은 적지 않는다 (어차피 결론이 안 정해짐).

### 위치·파일명

- `docs/troubleshooting/{YYYY-MM-DD}-{에러-키워드}.md`
- 포맷은 `docs/troubleshooting/README.md` 참조.

### 규칙으로 승격

같은 사건이 두 번 이상 일어나면 → `memory/rules/{관련-규칙}.md`에 재발 방지 절차로 승격.

## 4. 세션 종료 체크리스트 (에이전트 자동 실행)

세션 종료 직전 자동으로 확인한다:

1. 새 기술·아키텍처 결정이 있었나? → 있으면 `docs/adr/` 작성했는지 확인.
2. 작업 로그를 `memory/logs/sessions/`에 남겼나? (큰 변경이 있었던 세션만)
3. 해결한 에러가 있나? → 있으면 `docs/troubleshooting/`에 기록했는지 확인.
4. 운영 차원의 결정이 있었으면 `memory/decisions/`에 `append_decision`으로 적었는지 확인.

체크리스트 미통과 항목이 있으면 사람에게 한 줄로 보고.

## 5. 준수율 높이는 팁 (Notion 가이드 발췌)

- 규칙은 짧고 구체적으로 — 트리거 조건을 명시.
- 세션 끝에 위 §4 체크리스트로 에이전트가 자기 점검.
- 사람은 "로그 빠진 거 없어?" 한마디만 — 가장 확실한 보험.
