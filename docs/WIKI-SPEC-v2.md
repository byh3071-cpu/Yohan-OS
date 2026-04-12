---
id: wiki-spec-v2
date: 2026-04-12
domain: knowledge-management
tags: [wiki, llm-wiki, entity, concept, internalization, spec]
related: [llm-wiki-gist-why-how, knowledge-base-strategy, archiving-appraisal-feynman]
status: active
---

# LLM Wiki 레이어 — 설계·구현 명세 v2

> **이 문서는 Claude Code가 읽고 실행하기 위한 명세서다.**
> 실행: `docs/WIKI-SPEC-v2.md 읽고 순서대로 실행해줘`

---

## 0. 왜 이 구조인가 — 3대 차별점

1. **Compile-time 지식 vs Query-time 지식 분리.** ingest 시점에 구조화(compile), query 시점에 합성, answer로 재저장하는 순환 구조. RAG의 일회성 검색과 근본적으로 다르다.
2. **insights(원본) → wiki(합성) → Owner Notes(내재화) 3계층.** 저장-검색 2단계가 아닌, 사람이 직접 설명한 기록이 3번째 계층. 저장소가 아니라 **학습 시스템**.
3. **기존 Yohan OS 완전 호환.** memory/, PGE, evaluator, automation-batch 위에 레이어를 얹은 것. 학습 비용 0, 마이그레이션 0.

---

## 0.1 핵심 원칙

1. **기존 파이프라인 건드리지 않는다** — ingest/, rules/, 스크립트 그대로.
2. **wiki/는 파생 레이어** — insights가 원본, wiki는 합성물.
3. **SoT 우선** — agent-harness.md §2 유지.
4. **1인 운영** — 자동화 우선, 수동은 주간 Feynman만.
5. **CLAUDE.md = 지도** — wiki 관련 내용은 경로만 등록. 상세는 이 문서와 SKILL.md에.
6. **컨텍스트 절약** — 필요한 순간에 필요한 것만 로드.

---

## 1. 폴더 구조

```
memory/wiki/
├── entities/          # 인물, 기업, 기술, 도구
├── concepts/          # 패턴, 프레임워크, 원칙
├── answers/           # /wiki-query 결과 저장 (피드백 루프)
├── index.md           # 전체 목록 + 통계 + Cap 현황
└── log.md             # 변경 이력 (append-only)
```

> tacit/ 폴더는 만들지 않는다. 암묵지 캡처는 Owner Notes + /wiki-query 후 한 줄 프롬프트로 대체.

---

## 2. 파일 규격

### 2.1 entities/ — `{kebab-case}.md`

```yaml
---
id: andrej-karpathy
type: entity
entity_type: person  # person | company | technology | tool | other
created: 2026-04-12
updated: 2026-04-12
source_insights: [llm-wiki-gist-why-how, karpathy-obsidian-para-workflow]
related_entities: [openai]
related_concepts: [llm-wiki-pattern, second-brain]
---
```

본문 구조:
```markdown
# Andrej Karpathy

## 정의 (1~2문장)
- (source_insights 범위 내에서만 작성)

## Verified (소스 기반)
- 내용. [source: llm-wiki-gist-why-how]
- 내용. [source: karpathy-obsidian-para-workflow]

## Inferred (추론/연결) — TTL 30일
- LLM이 소스 간 연결해서 도출한 내용. 명시적으로 추론임을 표기.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성 — 주간 Feynman 또는 /wiki-query 후 캡처)

## 관련 소스
- [llm-wiki-gist-why-how](../ingest/insights/llm-wiki-gist-why-how.md)
```

### 2.2 concepts/ — `{kebab-case}.md`

entities와 동일 구조. `entity_type` 대신 `type: concept`. `aliases:` 필드 추가 (한글/영문 별칭).

### 2.3 answers/ — `{YYYY-MM-DD}-{question}.md`

```yaml
---
id: 2026-04-12-wiki-vs-rag
type: answer
created: 2026-04-12
question: "LLM Wiki와 RAG의 차이점은?"
source_wiki_pages: [llm-wiki-pattern, information-compression]
confidence: high  # high(3+소스) | medium(1~2) | low(추론 포함)
---
```

### 2.4 index.md

통계 + 전체 목록 + **Cap 현황**:
```
엔티티: 42/80 | 컨셉: 23/50 | 미검증(Inferred): 7개 | 고아: 0
```

---

## 3. 추출 규칙

### 3.1 엔티티 추출

| entity_type | 기준 | 예시 |
|-------------|------|------|
| person | 실명 인물 | Karpathy, Paul Graham, 김정현(넷가이버) |
| company | 기업·조직 | OpenAI, Anthropic, Cisco, Block |
| technology | 기술·프로토콜 | RAG, MCP, VLAN, AIOps, IBN |
| tool | 도구·서비스 | Obsidian, Claude Code, Cursor, Figma, Packet Tracer |

**추출 조건: 2개 이상 소스에서 등장.** 1회 등장은 Phase 2에서 사용자 판단.

### 3.2 컨셉 추출

패턴(LLM Wiki Pattern, Feynman Technique), 프레임워크(Exploration vs Exploitation, Layered Context), 원칙(SSoT, Compile-time vs Query-time), 시스템(Second Brain, Information Compression), **실무 워크플로우(바이브코딩 파이프라인, 티켓 기반 개발, 하네스 엔지니어링)**.

### 3.3 Source Lock 규칙 (할루시네이션 방지)

**모든 Verified 문장에 `[source: {insight-id}]` 태그 필수.** 태그 없는 문장은 /wiki-lint에서 자동 경고.

### 3.4 교차 참조

- 양방향 필수 (A→B이면 B→A).
- source_insights: 해당 엔티티/컨셉이 등장하는 모든 insights id.

---

## 4. 할루시네이션 방어 체계

### 4.1 생성 시점: Source Lock

모든 Verified 문장에 `[source: insight-id]` 강제. SKILL.md에 하드코딩.

### 4.2 검증 시점: /wiki-lint Fact-Check

lint 실행 시 원본 insights를 **실제로 열어서** wiki 문장과 대조. 방식: 원본 텍스트를 그대로 붙이고 "이 원본에 아래 문장의 근거가 있는가? Yes/No만 답해"로 제한. 추론 여지 제거.

### 4.3 구조적 방어: Verified / Inferred 분리

- **Verified**: 소스 기반. [source:] 태그 필수.
- **Inferred**: 추론/연결. **TTL 30일.** 30일 안에 승격 안 되면 `status: expired` → /wiki-query 검색 대상 제외.
- **승격 방식**: /wiki-query 결과에 Inferred가 포함될 때만 "Verified로 올릴까요?" → 사용 시점 검증. 능동 검토 X.

### 4.4 수동 샘플 감사

**분기 1회, 랜덤 5개 wiki 페이지를 원본과 직접 대조.** 15분. 1인 운영 현실에 맞춘 최소 감사.

---

## 5. Cap 규칙 (과잉 추출 방지)

```
entities: 최대 80개
concepts: 최대 50개
answers: 30일 미참조 → archive 후보
```

Cap 도달 시 lint가 **병합 후보 쌍 제시**: `related_concepts` 80%+ 겹치거나 `source_insights` 포함 관계. 사람은 Yes/No만 결정. 숫자는 분기 리뷰 때 조정 가능.

---

## 6. 내재화 루프

### 6.1 주간 사이클

1. AI가 이번 주 신규/갱신 wiki 중 Standard+ 티어 5개 선별.
2. Yohan이 3개 선택 (판단 행위).
3. **MVI (Minimum Viable Internalization)**:

```
Level 1 (30초): 제목만 보고 "이게 뭐였지?" 떠올리기
Level 2 (3분): 한 줄 설명 적기
Level 3 (15분): Feynman 3단 전체
```

매주 Level 1 필수, Level 2~3은 여유 있을 때. **0 < 1 원칙.**

### 6.2 암묵지 캡처 (뇌 → wiki)

별도 폴더 없음. 두 가지 경로:
- **/wiki-query 후 자동 프롬프트**: "이 답변에 대해 네 생각이나 경험이 있으면 한 줄만?" → Owner Notes 저장.
- **Feynman 설명 자체가 암묵지의 명시화.** Owner Notes 섹션이 tacit 역할 겸임.

### 6.3 Owner Notes 규격

```markdown
## Owner Notes
- **설명 시도 (2026-04-12):** (직접 작성한 설명)
- **나와의 연결점:** (현재 프로젝트에 어떻게 적용되는지)
- **다음 리마인드:** 2026-04-26
- **MVI Level:** 3 ✅
```

---

## 7. 자동화

### 7.1 wiki-ingest 트리거 조건

**`archive_tier ≥ standard` + `status: insight`만 자동 대상.** draft는 제외. 사람이 정제 후 status 올릴 때 비로소 wiki 반영.

### 7.2 automation-batch 편입

Phase 3 완료 후 `scripts/automation-batch.ts`에 wiki-ingest 단계 추가 검토. 우선은 수동.

### 7.3 대시보드 헬스 모니터

`memory/wiki/index.md`를 dashboard API(`/api/docs`)로 노출:
```
[Wiki Health] 엔티티: 42/80 | 컨셉: 23/50 | 미검증: 7 ⚠️ | Feynman: 1/3
```

---

## 8. 실행 순서

### Phase 1: 구조 생성
- [ ] `memory/wiki/`, 하위 디렉터리, index.md, log.md 생성.

### Phase 2: insights 스캔 → 추출
- [ ] `memory/ingest/insights/*.md` 전체 읽기 (배치: 10개씩 3라운드).
- [ ] 엔티티/컨셉 추출 (§3 기준).
- [ ] telegram-ocr 계열(status: draft) 자동 스킵.
- [ ] **중간 점검 목록 출력 → 사용자 확인 대기. 확인 없이 Phase 3 금지.**

### Phase 3: wiki 페이지 생성
- [ ] 확인된 엔티티/컨셉 파일 생성 (§2 규격).
- [ ] Source Lock 태그 적용 (§3.3).
- [ ] 교차 참조 양방향 적용.
- [ ] index.md, log.md 갱신.

### Phase 4: 역링크
- [ ] insights 프론트매터 `related:`에 wiki id 추가 (본문 수정 금지).

### Phase 5: 시스템 등록
- [ ] `memory/rules/wiki-ops.md` 생성 (§9).
- [ ] `.cursor/skills/wiki-ops/SKILL.md` 생성 (별도 파일).
- [ ] AGENTS.md에 wiki 경로 1줄 추가.
- [ ] Evaluator 판정 수행.

---

## 9. 운영 규칙 (`memory/rules/wiki-ops.md`로 생성)

```markdown
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
```

---

## 10. 트레이드오프·주의사항

1. **프론트매터 파싱**: 기존 insights 일부 형식 불일치. 파싱 실패 시 스킵 → log.md 기록.
2. **토큰**: insights 31개 전체를 한 세션에 읽으면 컨텍스트 초과. 10개씩 배치.
3. **Inferred 쓰레기통화**: TTL 30일 + 사용 시점 승격으로 방지.
4. **1인 과부하**: 수동 작업은 주간 MVI(30초~15분) + 분기 감사(15분)만. 나머지 자동.

---

*이 문서는 `docs/WIKI-SPEC-v2.md`에 저장. 실행: Claude Code에서 "docs/WIKI-SPEC-v2.md 읽고 실행해줘"*