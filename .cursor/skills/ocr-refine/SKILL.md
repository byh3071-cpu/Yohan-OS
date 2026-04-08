---
id: ocr-refine-skill
date: 2026-04-08
domain: ingest
tags: [ocr, telegram, refine, screenshot, notion, insights]
status: active
---

# OCR 2차 정제 Skill

## 언제 사용

- 텔레그램 봇이 쌓은 **`type: screenshot`** 블록을 정제할 때
- 소스 파일: **`memory/inbox/telegram/YYYY-MM-DD.md`** (레거시: `memory/inbox/telegram-inbox.md`)

## 목표 흐름 (SoT + 노션)

1. **Cursor SoT:** 정제 결과를 **`memory/ingest/insights/{id}.md`**에 저장 (프론트매터·`related`·출처 `received_at` / `message_id`).
2. **노션 리소스 DB:** OCR **원문**(교정 전)을 단기 기억용으로 적재 — 규칙은 **`memory/rules/notion-ocr-pipeline.md`**.
3. **노션 서머리 DB:** 구조화한 2차 결과를 적재하고 **리소스 페이지와 관계형 필수 연결**.
4. **인박스:** 리소스 DB에 원문이 올라간 것을 확인한 뒤, **`memory/inbox/telegram/…`에서 해당 OCR 블록만 삭제** (정제본 파일은 유지).

짧은 OCR(대략 3줄 이하)은 리소스만·서머리 생략 가능. 긴 본문은 리소스+서머리.
짧은 OCR 기준은 정량으로 고정한다: `3줄 이하` 또는 `180자 이하`면 short로 본다.

## 프롬프트 템플릿

아래 템플릿을 기본으로 고정 사용한다.

```text
입력: 텔레그램 OCR 원문 블록 1건
목표: SoT용 2차 정제본(insights) 생성 + 노션 리소스/서머리 분기 판단

규칙:
1) 사실 추가 금지. 원문에 없는 정보는 "확인 필요"로 표기
2) 출처 식별자 유지: received_at, message_id, source 경로
3) short 기준: 3줄 이하 또는 180자 이하
4) short면 리소스-only 제안, long이면 리소스+서머리 제안
5) 결과는 지정된 출력 형식 그대로 작성
```

## 출력 형식

정제 결과는 아래 고정 구조를 따른다.

```text
---
id: {kebab-case-id}
date: {YYYY-MM-DD}
domain: ingest
tags: [ocr, telegram]
related: []
status: draft
# archive_tier: standard
---

# {제목}

## 원문 메타
- source_file: `memory/inbox/telegram/{YYYY-MM-DD}.md`
- received_at: `{ISO_DATETIME}`
- message_id: `{MESSAGE_ID}`

## 한 줄 요약
- {핵심 1문장}

## 파인만 3단
### 쉬운 설명
- {설명}
### 실생활(또는 내 일) 예시
- {예시}
### 궁금한 점
- {확인 필요/추가 질문}

## 실행 분기
- classification: short | long
- notion_action: resource_only | resource_and_summary
- reason: {줄수/문자수 기준 + 정보 밀도}
```

## 저장·동기 근거

- 인사이트 SoT: `memory/ingest/insights/`
- 노션 필드·순서·삭제 정책: `memory/rules/notion-ocr-pipeline.md`
- 노션 vs SoT 우선순위: `memory/rules/notion-sync.md`

## 성공 기준

- insights만 보고 업무 재개 가능
- 출처(날짜·채팅·message_id)가 정제본에 남음
- (운용 시) 리소스 DB에 원본이 있으면 인박스 원 블록 제거로 큐가 가벼워짐
