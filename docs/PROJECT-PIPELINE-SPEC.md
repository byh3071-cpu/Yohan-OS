---
id: project-pipeline-spec
date: 2026-04-12
domain: project-management
tags: [pipeline, vibe-coding, design, ticket, vision-lock, harness]
related: [wiki-spec-v2, dashboard-spec, agent-harness]
status: draft
---

# 프로젝트 파이프라인 + 디자인 시스템 명세

> **목적:** 바이브코딩 프로젝트에서 기획 의도를 끝까지 유지하고,
> AI스러운 디자인을 구조적으로 차단하는 시스템.
> **전제:** 하네스 엔지니어링 + 티켓 기반 개발 (2026-04-09 강의 참고)

---

## 0. 최종 목적지

```
Yohan OS = "생각하면 완성되는" 개인 운영 체제

지식 레이어: memory/wiki/ (WIKI-SPEC-v2)
    → 배운 것이 쌓이고 연결된다

프로젝트 레이어: memory/projects/ (이 문서)
    → 만들 것이 기획대로 완성된다

디자인 레이어: memory/design/ (이 문서 §4)
    → 결과물이 나만의 시각 언어를 가진다

실행 엔진: MCP + Claude Code + Cursor
    → 어떤 도구든 같은 맥락으로 작동한다
```

**완성의 정의:** 새 프로젝트를 시작할 때, vision.md 한 장 쓰면 → AI가 티켓 분해 → 단계별 실행 → 디자인 토큰 자동 적용 → MVP → 피드백 반영 → 최종 완성. 처음 기획 의도가 마지막 커밋까지 유지.

---

## 1. Vision Lock — 기획 의도 유지 구조

### 1.1 프로젝트 폴더 구조

```
memory/projects/{project-id}/
├── vision.md              ← 불변. 왜 만드는지, 핵심 제약, 성공 정의.
├── design-decisions/      ← append-only. 합의된 설계 결정.
├── tickets/               ← 티켓 기반 개발 (§2)
├── current-phase.md       ← 자동 갱신. 지금 어디 단계인지.
├── feedback-log.md        ← 검증/피드백 기록
└── retrospective.md       ← 프로젝트 종료 후 회고
```

### 1.2 vision.md 규격

```markdown
---
id: {project-id}
created: YYYY-MM-DD
status: active  # active | paused | completed
---

# {프로젝트 이름}

## 왜 만드는가 (1~2문장)
- (이 프로젝트가 존재하는 이유. 변하면 안 됨.)

## 성공 정의 (측정 가능하게)
- (뭐가 되면 "됐다"인지.)

## 핵심 제약 (절대 타협 안 하는 것)
- (예: "AI스러운 디자인 금지", "월 비용 $50 이하")

## 사용자 (누구를 위한 것인가)
-

## 기술 스택
-

## 단계 (Phase)
1. 기획 → 2. 설계 → 3. 구현 → 4. MVP → 5. 피드백 → 6. 완성
```

### 1.3 Vision Lock 강제 방식

- **Hooks 수준:** 매 세션 시작 시 Claude Code가 `memory/projects/{active}/vision.md`를 읽는다.
- **Evaluator 체크:** "이 작업이 vision.md의 성공 정의와 핵심 제약에 부합하는가?" → 불일치 시 revise.
- **Phase 체크:** current-phase.md가 "구현" 단계인데 "기획" 논의를 다시 하려 하면 경고.

---

## 2. 티켓 기반 개발 (하네스 엔지니어링 적용)

### 2.1 원칙

- **컨텍스트를 티켓 단위로 분리** — AI가 세션 바뀌어도 티켓만 읽으면 맥락 복구.
- **기능 단위는 작을수록 좋다** — AI가 이해하기 쉬움.
- **휴먼-인-더-루프** — 개발/QA는 AI, 최종 검증/배포는 사람.

### 2.2 티켓 규격

```
memory/projects/{project-id}/tickets/{NNN}-{title}.md
```

```markdown
---
ticket_id: 001
title: 사용자 로그인 화면 구현
phase: 3-구현
priority: high
status: open  # open | in-progress | review | done
created: YYYY-MM-DD
depends_on: []
---

## 목표
- (이 티켓이 완료되면 뭐가 되는지)

## 범위
- (정확히 뭘 만들고, 뭘 안 만드는지)

## 제약
- vision.md 핵심 제약 중 이 티켓에 해당하는 것
- 디자인: memory/design/tokens.md 참조

## 완료 기준
- [ ] (체크리스트)

## AI 리포트
- (Claude Code/Cursor 실행 후 자동 작성)
```

### 2.3 프로세스

```
1. vision.md 작성 (사람)
2. 단계별 티켓 생성 (AI + 사람 확인)
3. 티켓 → Claude Code/Cursor에 복사 → 자동 개발
4. AI 리포트 확인 (사람)
5. 교차 검증: Cursor 개발 → Claude 검증 (또는 역)
6. PR 머지 (사람 — 최종 책임)
7. current-phase.md 갱신
```

---

## 3. 바이브코딩 파이프라인

### 3.1 전체 흐름

```
[기획] vision.md 작성
   ↓
[설계] 피그마에서 디자인 → 캡처본 AI에 전달
   ↓
[구현] AI가 90% 구현 → 잔여 10% Dev모드 값 추출 → AI 수정
   ↓
[MVP] 배포 → 핵심 기능만 작동 확인
   ↓
[피드백] 사용자 피드백 → feedback-log.md 기록
   ↓
[완성] 피드백 반영 → 최종 배포 → retrospective.md 작성
```

### 3.2 각 단계별 AI 역할 vs 사람 역할

| 단계 | 사람 (판단자) | AI (실행자) |
|------|-------------|-----------|
| 기획 | vision.md 작성, 왜/뭘 결정 | 티켓 분해 제안 |
| 설계 | 피그마에서 디자인, 심미적 판단 | 디자인 토큰 기반 코드 생성 |
| 구현 | 티켓 발행, 코드 리뷰 | 티켓 기반 자동 개발 |
| MVP | 배포 결정, 사용성 판단 | 빌드/테스트 자동화 |
| 피드백 | 피드백 수집/해석 | 피드백 → 티켓 변환 |
| 완성 | 최종 승인 | 배포 스크립트 실행 |

---

## 4. 디자인 시스템 — AI스러운 디자인 차단

### 4.1 폴더 구조

```
memory/design/
├── tokens.md          ← 색상, 간격, 타이포, 모서리 등
├── principles.md      ← 반(反)AI 디자인 원칙
└── references/        ← 좋다고 느낀 디자인 스크린샷
```

### 4.2 tokens.md 초안 (대시보드 스펙 기반)

```markdown
# Yohan Design Tokens

## 색상
- bg-dark: #0f172a (슬레이트 다크)
- bg-light: #f8fafc
- accent-primary: 인디고 (#6366f1)
- accent-secondary: 바이올렛 (#8b5cf6)
- text-primary: #e2e8f0 (다크) / #1e293b (라이트)
- border: #334155 (다크) / #e2e8f0 (라이트)

## 타이포그래피
- heading: Pretendard Bold
- body: Pretendard Regular
- mono: JetBrains Mono

## 간격
- base: 4px
- section-gap: 24px
- card-padding: 16px

## 모서리
- card: 8px (둥글되 과하지 않게)
- button: 6px
- input: 6px

## 금지
- 그라데이션 배경 금지 (포인트 텍스트에만 허용)
- 글래스모피즘 금지
- 과도한 그림자 금지
- shadcn 기본값 그대로 사용 금지 — 반드시 tokens 적용
```

### 4.3 principles.md 초안

```markdown
# Yohan Design Principles

1. **정보 밀도 > 장식** — 빈 공간 싫음. 정보가 눈에 꽂히되 읽기 편한 구조.
2. **노션 느낌 + 미니멀 + 대시보드** — 마크다운 형식 적재적소 정렬.
3. **AI가 만든 티 나면 실패** — 둥근 카드+그라데이션+기본 컬러 조합 = 금지.
4. **2차 가공 가능 구조** — 콘텐츠화해서 전달·판매까지 고려.
5. **시각 학습자 최적화** — 도식, 차트, 마인드맵 적극 활용.
6. **다크/라이트 양립** — 둘 다 완성도 있게.
```

### 4.4 디자인 워크플로우 (피그마 연동)

```
1. 피그마에서 화면별 디자인 (사람)
2. 디자인 캡처 → AI에 전달 (90% 구현)
3. 잘 안 된 10% → 피그마 Dev모드 값 추출 → AI에 수정 요청
4. 최종 확인 (사람)
```

Figma MCP 도입 시 (향후): Claude가 피그마에서 직접 디자인 토큰을 읽어와 코드 반영까지 자동화 가능.

---

## 5. MCP 생태계 연동 (현재 + 향후)

### 5.1 현재

```
Claude ←MCP→ Yohan OS (memory/ — get_context)
```

### 5.2 향후 확장 (필요 시 순차 도입)

```
Claude ←MCP→ Figma (디자인 토큰 읽기)
Claude ←MCP→ GitHub (이슈/PR 자동화)
Claude ←MCP→ Notion (양방향 동기화 — 이미 일부 구현)
Claude ←MCP→ Cinema 4D (3D 씬 — 단순 반복/세팅 용도)
```

Cinema 4D MCP: 복잡한 작업은 한계 있지만 단순 반복, 씬 세팅, 정리 용도로 시간 절약. 디자인 에셋(3D 오브젝트, 렌더링) 필요 시 검토.

### 5.3 자체 LLM/클라우드 — 현재 우선순위 아님

MCP를 통해 어떤 LLM이든 같은 맥락을 읽게 하는 구조 = 사실상 "자체 LLM"과 같은 효과를 LLM 종속 없이 달성. 자체 호스팅은 비용 대비 효과가 맞을 때 검토.

단, 로컬 LLM 참고사항 (네트워크 강의): **학습 데이터 품질 > 파라미터 크기.** wiki의 Verified 데이터가 잘 정제되어 있으면, 향후 로컬 LLM fine-tuning 시 소스로 활용 가능.

---

## 6. 실행 우선순위

```
[지금] WIKI-SPEC-v2 실행 → wiki 레이어 구축
[다음] 이 문서의 §1~2 적용 → 다음 프로젝트에 vision.md + 티켓 기반 시범 적용
[그 다음] §4 디자인 토큰/원칙 파일 생성 → 대시보드 v2에 적용
[나중] §5.2 MCP 확장 → 필요한 것부터 순차 도입
```

---

*이 문서는 `docs/PROJECT-PIPELINE-SPEC.md`에 저장.*