---

## id: last30days-github-skill-why-how

date: 2026-04-08
domain: tools-research
tags: [github, claude-code, skill, last30days, 워크플로, 인스타, 쓰레드]
related: [knowledge-base-strategy, karpathy-obsidian-para-workflow, cursor, claude-code]
status: insight

# last30days-skill (GitHub) — 왜 쓰는지 · 어떻게 쓰는지

## 원본 링크·긴 문서 위치

- **GitHub:** [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill)
- **README 전문(SoT 인제스트):** `memory/ingest/url/url-b88590c43555a909.md` — 설치 커맨드, 소스별 API 표, changelog는 **항상 여기**를 본다.

## 쓰레드·인스타 → 깃헙 → 까먹는 루프를 끊는 용도

- SNS·피드에서 **“나중에 써먹어야지”** 하고 **스타만 찍거나 링크만 쌓이면**, 시간이 지나 **왜 저장했는지조차** 흐려진다.
- **GitHub 한 레포당** `insights/`에 이런 파일 하나를 두고 **무슨 문제를 풀 도구인지·언제 꺼내는지·긴 README는 어디인지**만 고정해 두면, `@last30days-github-skill-why-how` 한 번으로 **적용 여부를 빠르게 결정**할 수 있다.
- **이 레포가 하는 일(한 줄):** 최근 약 30일 동안 Reddit·X·YouTube·HN·Polymarket 등 **실제 논의**를 모아 **인용 있는 브리핑**으로 합쳐 주는 **Claude Code / 기타 CLI 스킬**이다.

## 왜 이걸 쓰면 좋은지

- **트렌드·프롬프트 리서치:** “지금 커뮤니티에서 통하는 논의”를 검색 몇 번으로 대충 보기 어려울 때 한 번에 훑기 좋다.
- **비교 질문:** README 기준 **Comparative mode**(A vs B, 병렬 리서치·표) — 세부는 인제스트.
- **“지금 말이 중요한” 주제**에 유리하고, **런당 수 분**(README 2–8분대 안내) 걸릴 수 있어 **깊이 vs 속도**를 본다(`--quick` 등은 원문).

## 실무에서 어떻게 쓰이는지

- **설치:** Claude Code는 `/plugin marketplace add …` → `/plugin install …`(정확한 문자열은 인제스트 상단).
- **실행:** `**/last30days`** + 주제. 소스는 **설정 단계**에 따라 다름(무설정 일부 동작, Exa·ScrapeCreators·Bluesky 등은 `.env`).
- **산출:** 점수·중복 제거 뒤 요약·인용; 일부 버전은 **문서 폴더에 `.md` 저장** 옵션(인제스트 v2.9.1 언급).
- **업스트림 변경:** `ingest_url`로 README 갱신 후, **이 파일의 한 줄 요약·버전 줄**만 손본다.

## Yohan OS 안 분류

- `**ingest/url/`:** README **전문** — 검색·복붙·버전 대조.
- `**ingest/insights/` (이 파일):** **의도·사용 조건** — 피드에서 온 레포를 **도구 카드**로 고정.
- **채택 확정 전**에는 `decisions/`에 올리지 않는다. 채택 시 `append_decision` 또는 `active-project`에 한 줄 연결을 검토한다.

## 다음 액션 (선택)

- Claude Code 루트에 **한 번 설치** → **토픽 하나**로 결과 형태만 확인 → **API를 어디까지 켤지** 결정.