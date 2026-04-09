---
id: telegram-inbox
date: 2026-04-07
domain: automation
tags: [telegram, inbox, bot, automation]
related: [notion-ocr-pipeline, archiving-appraisal-feynman]
status: active
---

# 텔레그램 인박스 — 일별 파일·반영·아카이브

## 저장 위치 (봇 append)

- **현재:** `memory/inbox/telegram/YYYY-MM-DD.md` — 날짜는 메시지 시각 기준 **Asia/Seoul** (`paths.ts` / `telegram-bot.ts`).
- **과거 단일 파일:** `memory/inbox/telegram-inbox.md` — 이전에 쌓인 로그만 남음. 새 수신은 일별 경로로만 간다.

## “읽었고 반영함” 이후

1. **정제·구조화 산출**을 SoT에 남긴다 (택 1 이상):
  - 인사이트·메모: `memory/ingest/insights/` (`.cursorrules` §3 프론트매터)
  - 결정·합의: `memory/decisions/` 또는 MCP `append_decision`
  - 링크·기사: 이미 `ingest_url`이면 `memory/ingest/url/` — 텍스트만 인박스에 있던 것은 정리 후 필요 시 새 `ingest`·노트로
2. 인박스 블록의 `received_at` / `message_id`를 정제본 `related`·본문 각주 등에 **한 줄이라도 남기면** 나중에 대조하기 좋다.

## 텔레그램 OCR (스크린샷) — 노션 연동 시

OCR 블록은 `**memory/rules/notion-ocr-pipeline.md`** 기준으로 다룬다.

- **2차 정제본** → `memory/ingest/insights/` (SoT, 유지).
- **1차 OCR 원문** → 노션 **리소스 DB**에 보존 후, 확인되면 **일별 인박스에서 해당 블록 삭제**해도 된다 (레포에는 정제본만 남는 운영).
- **서머리 DB**는 정제 결과의 노션 쪽 표현; SoT를 대체하지 않는다.

## 삭제 vs 아카이브 (일반 텍스트·기타)


| 방식            | 언제                                         | 주의                                                   |
| ------------- | ------------------------------------------ | ---------------------------------------------------- |
| **삭제**        | 정제본·결정이 SoT에 있고, 인박스 raw가 **더 이상 필요 없을 때** | SoT에 없는 유일한 사본이면 복구 불가                               |
| **아카이브 (권장)** | 반영은 끝났지만 **로컬에 raw를 더 남기고** 싶고 노션에 안 올릴 때  | 블록 또는 파일 단위로 `memory/inbox/archive/telegram/` 아래로 옮김 |


**권장 절차 (블록 단위):**

1. 일별 파일에서 처리한 블록을 잘라낸다.
2. `memory/inbox/archive/telegram/YYYY-MM-DD.md`(또는 월별 파일)에 **붙여 넣고** 상단에 `archived_from: memory/inbox/telegram/…` 한 줄을 둔다.
3. 일별 파일에서는 해당 블록을 제거해 **살아 있는 큐**만 남긴다.

**파일 단위:** 특정 날 파일이 비었거나 “이 날은 전부 반영 완료”면 파일 통째로 `archive/telegram/done-YYYY-MM-DD.md`로 옮겨도 된다.

## 요약

- **일별 인박스** = 짧은 큐 · **OCR은 노션 리소스 확인 후 인박스 블록 삭제 가능** · 그 밖 raw는 **아카이브** 또는 SoT 확정 후 **삭제**.
- OCR 상세 파이프라인: `notion-ocr-pipeline.md` · 스킬: `.cursor/skills/ocr-refine/SKILL.md`.