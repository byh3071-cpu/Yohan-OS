# 텔레그램 OCR → 노션(유니버셜 메모리) + Cursor SoT 파이프라인

`memory/rules/notion-sync.md` 원칙을 유지한다. **에이전트 런타임·검색의 1차 진실은 여전히 `memory/`**이며, 노션은 **사람용 미러·협업·단기(리소스)·작업결과(서머리)** 용도다.

---

## 데이터 흐름 (의도한 순서)

1. **원본 OCR** — `memory/inbox/telegram/YYYY-MM-DD.md` 의 `type: screenshot` 블록 (또는 레거시 `telegram-inbox.md`).
2. **2차 정제본 (SoT)** — 먼저 또는 곧바로 `memory/ingest/insights/{id}.md`에 저장 (`.cursorrules` 인사이트 프론트매터·출처 `received_at` / `message_id` 유지).
3. **노션 리소스 DB (단기·원본 보존)** — OCR **교정 전** 텍스트를 그대로 한 페이지로 적재 (아래 필드 규칙).
4. **노션 서머리 DB (작업 결과물)** — 정제·구조화된 본문을 적재하고, **반드시 3번에서 만든 리소스 페이지와 관계형으로 연결**한다.
5. **Yohan OS 인박스에서 원본 블록 삭제** — 리소스 DB에 원본이 들어간 것을 확인한 **후에만** 해당 OCR 블록을 일별 인박스에서 제거한다.
  - **정제본 파일(`memory/ingest/insights/`)은 삭제하지 않는다** — Cursor SoT에 남긴다.
  - 서머리 DB는 insights 정제본을 재현하거나 요약한 **노션 쪽 작업물**이지, SoT를 대체하지 않는다.

**짧은 메모 수준 OCR (정량 기준):** `3줄 이하` **또는** `180자 이하`면 리소스 DB만 채워도 되고, 서머리는 생략 가능.  
**4줄 이상·실질 정보:** 리소스 + 서머리 둘 다.  
**이미 `memory/ingest/`에 정제본이 있는 경우:** 그 정제본을 기준으로 서머리를 쓰고, 리소스에는 필요 시 원본 OCR만 보존.

---

## DB 링크 (참고)


| 역할     | URL                                                                                         |
| ------ | ------------------------------------------------------------------------------------------- |
| 리소스 DB | `https://www.notion.so/3389740ab0728073940cf29cc4e5d749?v=3389740ab07280289b58000cbcf0c565` |
| 서머리 DB | `https://www.notion.so/3389740ab072804fbf5eef3cd94090b4?v=3389740ab07280e1b6db000c384695f9` |


API·스크립트용 DB ID(32자 hex, 동일 값을 `normalizeNotionId`에 넣으면 됨):

- 리소스: `3389740ab0728073940cf29cc4e5d749`
- 서머리: `3389740ab072804fbf5eef3cd94090b4`

구현(레포): MCP `notion_push_ocr_pair`, 단건 CLI `npm run sync:notion:ocr -- <payload.json>`, **텔레그램 스크린샷 일괄** `npm run sync:notion:ocr:telegram-batch -- memory/inbox/telegram-ocr-snapshot-20260408.md` (인박스 경로 인자 생략 시 `telegram-inbox.md`). 공통 토큰과 DB ID·**열 이름**은 `.env`로 맞춘다 (값은 커밋 금지).


| 변수                                                                   | 의미                                                                                                 |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NOTION_TOKEN`                                                       | Integration 토큰                                                                                     |
| `NOTION_OCR_RESOURCE_DATABASE_ID`                                    | 리소스 DB ID (32자 hex)                                                                                |
| `NOTION_OCR_SUMMARY_DATABASE_ID`                                     | 서머리 DB ID                                                                                          |
| `NOTION_OCR_RESOURCE_PROP_`*                                         | 리소스 DB 열 이름 덮어쓰기. 기본: 제목 열 `이름`, `소스`, `상태`, `수집일`, `태그`. `BODY` 미설정 시 본문은 **페이지 블록(문단)**으로 붙음.    |
| `NOTION_OCR_SUMMARY_PROP_`*                                          | 서머리 DB. 기본: `이름`, `유형`, `상태`, `생성일`, `태그`, 관계 `리소스 DB (단기 기억)`. `BODY` 미설정 시 정제본도 **페이지 블록**으로 붙음. |
| `NOTION_OCR_RESOURCE_STATUS_KIND` / `NOTION_OCR_SUMMARY_STATUS_KIND` | `notion_status`(기본) = Notion **Status** 열 · `select` = 일반 Select 열.                                |
| `NOTION_OCR_DEFAULT_SOURCE` 등                                        | `소스`·`상태`·`유형` Select/Status **옵션 이름**과 정확히 일치해야 함 (예: `수집됨`, `초안`).                               |


**스키마(현재 워크스페이스 기준):** 리소스 — `이름`(Title), `소스`(Select), `상태`(Notion Status), `수집일`(Date), `태그`(Multi-select), `서머리 DB`(Relation, 코드에서 설정하지 않음·양방향 자동). 서머리 — `이름`, `리소스 DB (단기 기억)`(Relation·푸시 시 필수), `상태`(Status), `생성일`, `유형`(Select), `태그`. 별도 **본문** Rich text 열이 없으면 `.env`에 `BODY`를 비우고 두면 된다(기본).

`payload.json` 예시:

```json
{
  "date_ymd": "2026-04-06",
  "resource_title": "[2026-04-06] 스크린 캡처 제목",
  "ocr_raw_body": "OCR 원문 전체…",
  "tags": ["AI", "생산성"],
  "summary_title": "[2026-04-06] 정제 핵심 제목",
  "summary_body": "카테고리 / 핵심 요약 / …",
  "resource_only": false
}
```

짧은 OCR만 올릴 때는 `summary_title`·`summary_body`를 빼거나 `"resource_only": true`.

레포 예시 파일: `docs/examples/ocr-notion-payload.example.json` → 복사 후 경로·문구만 바꿔 `npm run sync:notion:ocr -- <파일>`.

---

## 리소스 DB (1단계) — 필드 가이드

- **제목:** `[YYYY-MM-DD] OCR 원본 제목` (수집일 기준 날짜 권장, Asia/Seoul 가능)
- **소스:** `텔레그램 스크린샷` / `이미지` / `웹클립` / `직접입력`
- **상태:** `수집됨`
- **수집일:** `YYYY-MM-DD`
- **태그:** 내용 기준 1~3개 (`재무`, `AI`, `IT`, `카페OS`, `창업레이더`, `개발`, `마케팅`, `생산성`, `투자` 등)
- **본문:** OCR 원문 **그대로** (교정·요약 금지)

---

## 서머리 DB (2단계) — 필드 가이드

- **제목:** `[YYYY-MM-DD] 정제된 핵심 제목`
- **유형:** `요약` / `블로그초안` / `액션아이템` / `인사이트` / `프롬프트` / `코드스니펫` / `레퍼런스`
- **상태:** `초안`
- **생성일:** `YYYY-MM-DD`
- **태그:** 리소스와 동일하게 유지
- **리소스 DB 관계:** 위 1단계 페이지와 **반드시** 연결
- **본문:** 자료 구조화 스킬 포맷 (카테고리 / 핵심 요약 / 상세 / 보충 / 인풋 / 아웃풋 / 적용 사항)

---

## 삭제 정책 (이 파이프라인 한정)

- **인박스 OCR 블록:** 노션 리소스에 원문이 반영되었음을 확인한 뒤 **삭제**해도 된다 (노션이 원본 사본 역할).
- `**memory/ingest/insights/` 정제본:** **보관** — 노션·인박스 정리와 무관하게 SoT로 유지한다.
- 노션 행 삭제는 `notion-sync.md`대로 SoT를 자동 삭제하지 않는다.

관련 스킬: `.cursor/skills/ocr-refine/SKILL.md` · 인박스 규칙: `memory/rules/telegram-inbox.md`.