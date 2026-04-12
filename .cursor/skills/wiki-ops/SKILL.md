---
name: wiki-ops
description: >-
  Wiki 레이어 운영 커맨드. /wiki-ingest, /wiki-query, /wiki-answer, /wiki-lint.
  memory/wiki/ 관련 작업 시 자동 로드. 사용자가 wiki, 엔티티, 컨셉, 지식검색을
  언급하면 트리거.
---

# Wiki Ops — LLM Wiki 레이어 커맨드

명세: `docs/WIKI-SPEC-v2.md` | 규칙: `memory/rules/wiki-ops.md`

---

## /wiki-ingest

**트리거:** 새 insights 파일 추가 시, 또는 사용자가 "wiki에 넣어줘" 요청 시.

```
1. 대상 insights 파일 읽기.
2. 엔티티/컨셉 추출 (WIKI-SPEC-v2 §3 기준).
   - 추출 조건: 2개+ 소스에서 등장 (신규는 사용자 확인).
   - telegram-ocr 계열 (status: draft) 스킵.
3. 기존 wiki 페이지 있으면 → source_insights 추가 + Verified 내용 보강.
   - 새 Verified 문장마다 [source: insight-id] 태그 필수.
4. 없으면 → 새 wiki 페이지 생성 (WIKI-SPEC-v2 §2 규격).
   - Verified/Inferred 섹션 분리.
   - Inferred에는 created + expires(+30일) 표기.
5. 교차 참조 양방향 갱신.
6. insights 프론트매터 related:에 wiki id append (본문 수정 금지).
7. index.md, log.md 갱신.
8. 추출 결과 요약 출력.
```

**Source Lock 강제:** Verified 섹션의 모든 문장에 `[source: {insight-id}]` 없으면 작성 금지.

---

## /wiki-query

**트리거:** 사용자가 지식 질문을 할 때, 또는 "wiki에서 찾아줘" 요청 시.

```
1. 질문 받기.
2. memory/wiki/ 전체 검색 (entities/, concepts/, answers/).
3. 관련 페이지 읽고 종합 답변 생성.
   - Verified 내용 우선 인용.
   - Inferred 내용 포함 시 명시: "(추론, 미검증)"
   - expired Inferred는 검색 대상에서 제외.
4. 신뢰도 표시: high(3+소스) / medium(1~2) / low(추론 포함).
5. 출처 wiki 페이지 목록 제시.
6. "이 답변을 wiki/answers/에 저장할까요?" 묻기.
7. "이 답변에 대해 네 생각이나 경험 한 줄?" 묻기 (암묵지 캡처).
```

---

## /wiki-answer

**트리거:** /wiki-query 직후 사용자가 저장 승인 시.

```
1. 직전 /wiki-query 결과를 WIKI-SPEC-v2 §2.3 규격으로 저장.
   경로: memory/wiki/answers/{YYYY-MM-DD}-{question}.md
2. 답변에서 새 엔티티/컨셉 식별 시 wiki 페이지 생성/갱신.
3. 사용자가 한 줄 생각을 답했으면 → 관련 wiki 페이지 Owner Notes에 추가.
4. index.md, log.md 갱신.
```

---

## /wiki-lint

**트리거:** 주간 리뷰 시, 또는 사용자가 "wiki 점검" 요청 시.

```
1. 고아 페이지: source_insights가 모두 삭제/부재인 wiki 페이지.
2. 깨진 링크: 존재하지 않는 파일 참조하는 related_* 필드.
3. 단방향 참조: A→B 있는데 B→A 없는 경우.
4. 프론트매터 누락: id, type, source_insights 빠진 파일.
5. Source Lock 위반: Verified 섹션에 [source:] 태그 없는 문장.
6. Fact-Check (핵심):
   - [source: X] 태그의 X 파일을 실제로 열기.
   - 원본 텍스트와 wiki 문장 대조.
   - 방식: "이 원본에 아래 문장의 근거가 있는가? Yes/No만"
   - 근거 없으면 "⚠️ 미검증" 플래그.
7. Inferred TTL 초과: expires 날짜 지난 Inferred → status: expired 처리.
8. Cap 체크:
   - entities > 80 → 병합 후보 쌍 제시 (related_concepts 80%+ 겹침).
   - concepts > 50 → 상위 개념 병합 권고.
9. 결과 보고서 출력.
```

---

## 공통 규칙

- **insights 본문 수정 금지.** 프론트매터 related만 추가 가능.
- **엔티티/컨셉 삭제 전 사용자 확인 필수.**
- **Cap 초과 시 자동 삭제 안 함.** 병합 후보만 제시, 사람이 Yes/No.
- **Phase 2 중간 점검: 확인 없이 파일 생성 금지.**