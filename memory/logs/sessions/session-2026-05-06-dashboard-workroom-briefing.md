---

## id: session-2026-05-06-dashboard-workroom-briefing
date: 2026-05-06
verdict: pass
tags: [dashboard, briefing, openai, cache, ux, workroom, notion-handoff, troubleshooting]
related:
  - dashboard/src/app/api/briefing/route.ts
  - dashboard/src/app/page.tsx
  - dashboard/src/components/view-tabs.tsx
  - memory/rules/dashboard-runtime-stability.md
status: done

# 대시보드 작업실 탭 · 브리핑 캐시 · 선택 문서 동기화 (세션 기록)

노션 등 외부 맥락 유지용 요약. **신규 ADR은 불필요**한 수준(버그 수정 + UX 정렬)이며, 아키텍처 결정이 아니라 동작 명세·운영 메모로 충분함.

## 무엇을 남길지 판단


| 유형                 | 기록 여부 | 비고                                                                                                    |
| ------------------ | ----- | ----------------------------------------------------------------------------------------------------- |
| 세션 로그              | ✅     | 본 파일                                                                                                  |
| ADR                | ❌     | 아키텍처·정책 수준의 결정 아님. 브리핑 캐시 규칙을 장기 문서로 고정하고 싶다면 선택적으로 `docs/adr/` 또는 `memory/decisions/`에 한 줄 결정만 추가 가능 |
| 트러블슈팅              | ✅     | 아래 § 문제–원인–조치                                                                                         |
| 결정 로그 (decisions/) | 선택    | “작업실 = 탭, 사이드바 비추가”를 공식화하려면 짧은 결정 1건 추가 가능                                                            |


## 한 일 (코드 반영)

1. **작업실 상단 탭**
  - `ViewTab`에 `workroom` 추가. 순서: 홈 · 차트 · 타임라인 · **작업실** · 별자리.
  - 브리핑(`BriefingCard`)·SoT 초안(`SotDraftPanel`)은 **홈에서 제거**, 작업실 탭 전용 영역(`ScrollArea`)으로 이동.
  - NLP 커맨드·커맨드 팔레트에 `workroom` 및 한글 라벨 반영.
2. **카테고리 ↔ 미리보기 불일치**
  - 사이드바 카테고리 변경 후에도 `selectedDoc`가 유지되면, 목록에는 없는 문서가 오른쪽 미리보기에 남을 수 있음.
  - `filtered`에 현재 선택 경로가 없으면 `selectedDoc` 해제하는 `useEffect` 추가.
3. **브리핑: 재시작해도 “OPENAI_API_KEY 없음”이 계속 보이던 현상**
  - **원인**: 키 없을 때 생성된 문구가 `dashboard/.next/cache/briefing/<오늘>.json`에 저장되면, 이후 요청은 OpenAI를 호출하지 않고 해당 JSON만 반환.
  - **조치**: (a) 키가 있는데 캐시 본문이 실패 플레이스홀더면 캐시 파일 삭제 후 재생성 (b) 실패 플레이스홀더는 디스크에 캐시하지 않음 (c) `dotenv`로 레포 루트·`dashboard` 각각의 `.env` / `.env.local` 순차 로드.

## 트러블슈팅 요약


| 증상                               | 원인                                          | 조치                                                       |
| -------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `.env`에 키 넣고 서버 재시작했는데 브리핑 문구 동일 | 일일 브리핑 파일 캐시                                | API에서 실패 캐시 무시·미저장 + 필요 시 브리핑 UI에서 수동 새로고침(`?refresh=1`) |
| 교재 등으로 필터했는데 미리보기가 다른 카테고리 문서    | `selectedDoc` 미초기화                          | 필터에 없는 선택은 자동 해제                                         |
| “작업실”이 안 보임 (사용자 기대: 별자리 옆)      | 사이드바가 아닌 **뷰 탭**에 없었음 + 이전엔 홈 본문 `details`만 | 전용 `workroom` 탭 추가                                       |


## 운영 메모 (Notion·팀 맥락용)

- **환경 변수**: 서버 사이드 브리핑은 `OPENAI_API_KEY`를 사용. 파일 위치는 레포 루트 또는 `dashboard/` 쪽 `.env` / `.env.local` (라우트에서 둘 다 시도).
- **캐시 위치**: `dashboard/.next/cache/briefing/`. 이상한 날의 스냅이 남으면 해당 날짜 JSON 삭제 또는 브리핑 새로고침.
- **제품 UX**: “작업실”은 사이드바 항목이 아니라 **상단 탭**이다. 홈은 재발견 카드 + 문서 목록·미리보기 중심.

## 노션에 붙여 넣기용 (짧은 블록)

```
[2026-05-06] Yohan OS 대시보드

- 작업실: 상단 탭에 신설 (타임라인과 별자리 사이). 브리핑·SoT 초안은 홈에서 빼고 작업실 탭으로만 표시.
- 버그: 카테고리 바꿔도 선택 문서가 남아 미리보기와 목록이 어긋나던 문제 → 필터에 없으면 선택 해제.
- 버그: OpenAI 키를 넣어도 브리핑이 "키 없음"으로 고정되던 문제 → 일일 JSON 캐시가 실패 응답을 저장해 재사용하던 것이 원인. 실패 문구는 캐시하지 않고, 키가 있으면 옛 실패 캐시는 무시·삭제 후 재생성.
- ADR 신규 없음 (운영/버그픽스). 세션 로그: memory/logs/sessions/session-2026-05-06-dashboard-workroom-briefing.md
```

## 변경 파일 (참고)

- `dashboard/src/app/page.tsx`
- `dashboard/src/components/view-tabs.tsx`
- `dashboard/src/app/api/briefing/route.ts`
- `dashboard/src/app/api/nlp-command/route.ts`
- `dashboard/src/components/command-palette.tsx`

## 잔여 / 확인 필요

- 로컬에서 **최신 코드 빌드·재시작** 후 브리핑 동작 확인 (구 빌드나 오래된 `.next` 캐시만 보면 이전 문구가 남을 수 있음).
- Notion 동기 CLI를 쓰는 경우, 본 세션 로그를 지식 허브에 올릴지 여부는 저장소 정책에 따름 (`npm run sync:notion:records` 등 기존 플로우).

