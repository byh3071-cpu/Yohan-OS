---

## id: vibe-coding-pipeline

date: 2026-04-07
domain: ai-engineering
tags: [vibe-coding, SoT, cursor, pipeline, context-engineering]
related: [knowledge-base-strategy, exploration-vs-exploitation, yohan-os-mcp, cursor, layered-context, single-source-of-truth, harness-engineering]
status: insight

# 바이브 코딩 — 초개인화 경량 파이프라인 (SoT 앱) 구축

## 타당성 및 장점

- **단일 환경 맥락 일치:** Cursor 내에서 `.md` 즉시 참조(`@`) → 브라우저–에디터 오갈 필요 없음, 컨텍스트 유실 방지.
- **자연어 시스템 설계:** 구조화된 MD + 프롬프트만으로 아키텍처·비즈니스 로직 구현.
- **빠른 이터레이션:** 코드 직접 수정 대신 프롬프트·참조 문서 수정 → AI가 코드 재작성 → 개발 속도 극대화.

## 핵심 구조 설계

### 1. 코어 엔진

- Cursor IDE 기본 LLM = Claude Sonnet (코딩 + 맥락 이해 최적).

### 2. SoT 디렉터리 구조화

- 초기: Vector DB 대신 경량 MD 파일 트리 기반.
- **Yohan OS 예시(실제 레포):**
  - `memory/rules/` — 하네스·동기 규칙
  - `docs/` — 비전·부트스트랩·킥오프
  - `memory/inbox/` — 노션 큐·임시 입력
  - (아이디어 스크랩은 `memory/` 하위 sandbox 폴더 등으로 운영 가능)

### 3. `.cursorrules` 글로벌 통제 (Harnessing)

- 프로젝트 루트에 절대 규칙 파일 생성.
- **예시 규칙:**
  - 기능 구현 전 `docs/VISION-AND-REQUIREMENTS.md` 또는 `memory/rules/agent-harness.md` 등 필수 참조.
  - 불필요한 주석 생략.
  - 에러 시 임의 수정 금지 → 원인·해결 방안 먼저 제시.

### 4. 점진적 컨텍스트 주입

- 전체 `.md` 일괄 주입 → Attention 분산 → 할루시네이션 유발.
- `Cmd+K` 또는 `@파일`/`@폴더`로 해당 작업에 필요한 최소 맥락만 주입.

## 주의사항 (Fact Check)

### 컨텍스트 윈도우 한계

- SoT 방대 시 대비: 핵심 문서 압축한 목차(Index) 문서 + 메타데이터 별도 유지.
- AI가 목차 우선 읽기 → 필요한 세부 문서 자체 탐색.

### 바이브 코딩 맹점

- 자연어 지시에 논리 구멍 → AI가 임의 코드/로직으로 충전.
- 지시어는 감각적이어도, 요구사항(입력값·출력값·예외 조건)은 수학 공식처럼 명확히 문서화 필수.