---
id: root-ai-harness-engineering-youtube-intro
date: 2026-04-16
domain: ai-engineering
tags: [harness-engineering, context-engineering, youtube, ai-agent, openai]
related: [harness-engineering, layered-context, llm-wiki-gist-why-how]
status: insight
---

# 이동훈 루트AI — 하네스 엔지니어링 입문 영상 (요약 인사이트)

## 원본

- **YouTube:** [하네스 엔지니어링 15분 만에 이해시켜드립니다](https://www.youtube.com/watch?v=MFZX1I_REyg)
- **인제스트·대본:** `memory/ingest/url/url-e8152e49a8014fcf.md` (자막 자동 실패 → 수동 STT)
- **채널:** 이동훈의 루트AI — **제3자 요약**이며, 수치·인용은 영상·원문과 대조해 검증 필요.

## 한 줄

- 강한 모델만으로는 부족하고, **에이전트를 감싼 운영 환경(제약·도구·피드백·문서)인 하네스**를 설계·개선하는 것이 **하네스 엔지니어링**이다.

## Verified (영상 요약 — 세부 수치·인용은 원문 대조 권장)

- **정의:** 하네스 = 제약·도구·피드백 루프·문서를 포함한 **에이전트 운영 환경 전체**. 하네스 엔지니어링 = 그걸 **체계적으로 설계·개선**; 실수 시 프롬프트만 고치지 말고 **시스템을 바꿔 재발 방지**.
- **비유:** 모델 = CPU, 하네스 = **운영체제**.
- **배경 서사:** OpenAI **100만 줄**·**사람 직접 코드 0줄** 실험, **랭체인** 같은 **같은 모델·하네스만 개선** 사례, **2026-02 미쉘 하시모토** 글·용어 확산 등은 **영상 내 서술** — 논문·공식 발표와 **1:1 대조는 미완**.
- **진화 3단:** 프롬프트(뭐라 말할까) → 컨텍스트(뭐를 보여줄까) → 하네스(**어떤 환경에서 일할까**). 하네스가 앞 둘을 **포함**하는 바깥 틀.
- **네 기둥 (영상):** (1) 컨텍스트 엔지니어링 — 레포에 기계 읽을 정보, 선별 로딩; **거대 단일 agent.md** 실패담 → **지도·분리·주소** (2) 아키텍처 제약 — **도구로 강제** (3) 피드백 루프 — 테스트·가이드/센서 (4) 엔트로피 관리 — 정리 주기.
- **실천 원칙 (영상):** 환경부터 / 실패에서 구조 개선 / 규칙은 적게 / **린터·테스트**로 강제 / 하네스도 진화.

## Yohan OS에의 연결 (내 일)

- `memory/rules/agent-harness.md`, `.cursorrules`, MCP `get_context`·`log_evaluation` = 이미 **하네스의 일부**를 코드·규칙으로 두고 있음.

## Wiki 반영

- `memory/wiki/concepts/harness-engineering.md`에 Verified 요지 병합·`source_insights` 갱신 완료 (2026-04-16).
