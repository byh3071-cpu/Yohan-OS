---
id: knowledge-base-strategy
date: 2026-04-07
domain: ai-engineering
tags: [knowledge-base, atomic-notes, RAG, layered-context, harness, vector-db]
related: [exploration-vs-exploitation, vibe-coding-pipeline, yohan-os-mcp]
reference: Andrej Karpathy
status: insight
---

# 지식 베이스 핵심 전략 — 「제2의 뇌」 설계

- **Karpathy 관점:** 지식 베이스 = 단순 기록이 아닌, 정보 간 연결이 새 의미를 생성하는 구조.
- AI 에이전트에게 맥락 제공 시 유연성 극대화 + 최신 상태 유지 전략.

## 1. 원자적 노트(Atomic Notes) + 그래프 구조

- 지식을 최소 단위로 분절 → AI가 자유롭게 재조합(Re-combination) 가능.
- 수백 페이지 PDF보다 「에스프레소 추출 이론」, 「프롬프트 제어 로직」 같은 파편 노트가 효과적.
- 연결망: 백링크로 이종 도메인 간 연결 명시.
  - 예: 「루틴 관리의 심리학」 ↔ 「Haruchi(루틴 게임)」 → AI가 심리학 근거를 자동 참조.

## 2. 다층적 맥락 구조 (Layered Context)

- **1계층 (Static/Core):** 불변 — 철학, 가치관, 원칙 (미사여구 배제, 팩트 우선).
- **2계층 (Domain/Deep):** 전문 지식 — 커피 브루잉 데이터, AI 엔지니어링.
- **3계층 (Dynamic/Transient):** 현재 프로젝트 상태 — 개발 로그, 금주 업무 특이사항.
- **동기화:** 1계층 = System Prompt 상시 주입 / **2·3계층** = RAG로 필요 시 동적 로드.

## 3. 실시간 동기화 + 하네스 자동화

- **MD 기반 파이프라인:** `.md` 수정 → 자동 Vector DB 인덱싱(도구·스크립트로 연동).
- `.cursorrules` 또는 전용 인덱싱 기능 활용 → 로컬 지식 베이스를 LLM 배경지식으로 즉시 동기화.
- Git 기반 버전 관리: 「어제까지 진척」 vs 「오늘 변경점」 명확 구분 → 낡은 정보 매몰 방지.

## 4. 낯선 연결의 의도적 배치

- 지식 베이스 안에 가교(Bridge) 노트 생성.
  - 예: 「바리스타 서비스 루틴」 + 「AI 에이전트 워크플로우」 → 「시스템 최적화」 키워드로 연결.
- 효과: 카페 자동화 OS 개선 요청 시 서비스 현장 맥락까지 자동 반영.

## Next Step: Cursor × 지식 베이스 동기화 팁

### 1. 메타데이터

- 모든 `.md` 상단에 YAML(`tags`, `related`, `date` 등) 기입.
- Cursor에서 메타데이터·목차를 우선 읽게 하면 관련 노트 탐색이 쉬움.

### 2. Sandbox 디렉터리

- 구조화 프로젝트 폴더 외에 제약 없는 아이디어 배설 공간 별도 운영.
- 지시: 「해답 = Project 폴더 참조 / 아이디어 = Sandbox 파편 결합」.
- 구조적 통제 + 창의적 유연성 동시 확보.
