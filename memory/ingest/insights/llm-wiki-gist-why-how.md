---

id: llm-wiki-gist-why-how
date: 2026-04-08
domain: knowledge-management
tags: [github, gist, llm, wiki, obsidian]
related: [knowledge-base-strategy, karpathy-obsidian-para-workflow]
status: draft

# archive_tier: standard   # 선택: light | standard | long_term — `archiving-appraisal-feynman.md`

---

# llm-wiki (Karpathy gist) — 왜 쓰는지 · 어떻게 쓰는지

## 원본·긴 문서

- **Gist:** [karpathy/llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- **인제스트:** `memory/ingest/url/url-d84d4e72bd6545e5.md` — 아키텍처 3계층, ingest/query/lint 운영 루프, index/log 개념은 원문 기준으로 본다.

## 한 줄로 하는 일

- 문서를 매번 RAG로 재검색하는 대신, LLM이 지속적으로 갱신하는 마크다운 위키를 중간 계층으로 두어 지식을 누적시키는 운영 패턴 제안서다.

## 파인만 3단

### 쉬운 설명

- 질문할 때마다 자료를 처음부터 다시 찾는 방식 대신, 한 번 읽은 내용을 LLM이 위키 페이지로 정리하고 계속 업데이트해 “쌓이는 지식 베이스”로 쓰자는 아이디어다.

### 실생활(또는 내 일) 예시

- **내 일:** `memory/ingest/`* 원문을 소스 레이어로 두고, `memory/ingest/insights/`*를 누적 위키 레이어로 관리하면 세션이 바뀌어도 맥락 복구가 빨라지고 중복 정리 비용이 줄어든다.

### 궁금한 점

- 자동 편집 비중을 높일수록 잘못된 요약·링크 오염이 누적될 수 있어, 어떤 단계에서 사람 검토를 강제할지(ingest 단위/주간 lint 단위) 운영 규칙이 필요하다.

## 왜 쓰는지

- **상황 1:** 자료가 쌓일수록 “찾는 시간”이 “생각 시간”보다 길어지는 지식 작업에서 구조가 무너질 때.
- **상황 2:** 같은 질문을 여러 번 하며 매번 비슷한 문서 조합을 다시 읽는 비효율을 줄이고 싶을 때.
- **상황 3:** 개인/팀 노트에서 cross-reference·index·log 유지가 사람 손으로 감당 안 될 때.
- **안 맞을 때:** 소스 수가 적고 일회성 메모 위주라면, 위키 구조·로그 규칙까지 갖추는 비용이 더 클 수 있다.

## 실무에서 어떻게 쓰이는지

- **들어가는 것:** 원문 소스 폴더(immutable), 위키 폴더(markdown), 운영 스키마 문서(AGENTS/CLAUDE류).
- **하는 행동:** 소스 1건 ingest → 위키 페이지/링크 갱신 → 질의 응답 결과도 재저장 → 주기적 lint로 모순·고아 페이지 점검.
- **나오는 것:** 검색 가능한 주제 위키, 업데이트 이력(log), 누적된 합성 결과물.
- **버전:** 인제스트 `ingested_at` 2026-04-06 기준 gist라, 구현 세부는 “패턴 제안” 수준으로 해석하고 로컬 규칙으로 구체화해야 한다.

## 트레이드오프·전제

- 유지비용을 LLM이 낮춰주더라도, 소스 품질 관리와 검증 체계가 없으면 “정리된 오류”가 장기 축적될 수 있다.

## Yohan OS 안 위치

- **인제스트:** `url-d84d4e72bd6545e5.md` — 원문 스냅샷.
- **이 파일:** 패턴 채택 전 판단 카드.

## 다음 액션 (검증용)

- 현재 `memory/` 구조에서 ingest/query/lint 루프를 최소 규칙 1세트로 가정해, 주간 점검 항목(모순·고아·중복)만 따로 체크리스트로 뽑아 본다.