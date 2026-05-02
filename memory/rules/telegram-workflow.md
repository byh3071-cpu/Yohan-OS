---
id: telegram-workflow
date: 2026-05-02
domain: automation
tags: [telegram, workflow, bot, ocr, playbook]
related: [telegram-inbox, notion-ocr-pipeline, dashboard-quick-actions]
status: active
---

# 텔레그램 → SoT 플레이북 (한 장 요약)

에이전트·사람 공통으로 **순서만** 보면 된다. 세부 규칙은 링크 문서가 단일 참조다.

---

## 1. 한 줄 플로우

**보냄** → **수신·저장** → **배치 처리** → **검토·정리** → (선택) **노션 미러**

---

## 2. 단계별

| 순서 | 동작 | 명령 / 산출물 |
| --- | --- | --- |
| A | 로컬에서 봇 폴링 | `npm run bot` (한 PC·한 프로세스; `memory/.telegram-bot.lock`) |
| B | 텍스트·URL·사진 수신 | `memory/inbox/telegram/YYYY-MM-DD.md` |
| C | 자동 OCR→인사이트·노션·GitHub URL | `npm run automation:batch` (텔레그램 완료 알림: 루틴은 최대 2시간마다, 검토·실패는 매번) |
| D | 사람 검토 | `memory/inbox/automation-review.md`, `memory/logs/errors/` |
| E | 노션 원본·서머리 | `memory/rules/notion-ocr-pipeline.md`, `sync:notion:ocr:*` |

---

## 3. 점검·도구

| 목적 | 방법 |
| --- | --- |
| 봇·토큰·로컬 락 | `npm run telegram:health` — 웹 대시보드 **빠른 실행「봇 상태」** 동일 |
| MCP 번들 | `npm run mcp:check` (봇과 별개) |
| 인박스 반영·아카이브 | `memory/rules/telegram-inbox.md` |
| 빠른 실행 정의 | `memory/rules/dashboard-quick-actions.md` |

---

## 4. OCR 품질

- 배치 전처리 `prepareOcr`: 소셜 UI 잔여 줄(타임코드, `PLAY >`, `n/m` 캐러셀 등) **보수적으로 제거** — `scripts/automation/quality.ts` 의 `stripSocialMediaOcrNoise`.
- 의미 있는 문장이 잘리면 규칙을 넓히지 말고 **해당 줄 패턴을 이슈로 남기고** 치환 규칙만 조정한다.

---

## 5. 관련 파일

- 봇: `src/telegram-bot.ts`
- 배치: `scripts/automation-batch.ts`, `scripts/automation/notify.ts`
- 대시보드 액션: `dashboard/src/app/api/run/route.ts`
