---
id: github-repo-why-how
date: 2026-05-06
domain: ingest
tags: [github, ingest, why-how, insights]
related: [archiving-appraisal-feynman, insight-summary-quality]
status: active
---

# GitHub 레포 — URL 인제스트 + `why-how` 인사이트 짝

피드·쓰레드·인스타 등에서 깃헙 링크만 모이면 **나중에 왜 넣었는지** 잊기 쉽다. **긴 README는 그대로 두고**, **판단용 한 장**을 `insights/`에 둔다.

영어 README가 긴 오픈소스일수록 `why-how` 카드는 더 유용하다. 원문 해석 자체보다 **내 워크플로에서 언제 쓰는지·어디서 막히는지·채택 전 체크포인트**를 한국어로 고정해 두면, 다음 세션에서 링크를 다시 열지 않고도 의사결정을 빠르게 이어갈 수 있다.

---

## 역할 나누기


| 위치                               | 역할                                                | 분량                     |
| -------------------------------- | ------------------------------------------------- | ---------------------- |
| `memory/ingest/url/url-*.md`     | 원문 보존(README, 랜딩). 설치 문자열·표·changelog.            | 길어도 됨                  |
| `memory/ingest/insights/{id}.md` | **왜 쓰는지 · 언제 꺼내는지 · 어떻게 적용되는지** + 인제스트 경로·깃헙 URL. | **짧지도 길지도 않게** (아래 기준) |


SoT 우선은 `memory/rules/notion-sync.md`와 같다. 노션 미러는 선택.

형식은 분리 운영한다: `github=why-how`, `ocr/rss=feynman`. 즉, GitHub 카드는 why-how를 기본으로 하고 파인만 3단은 필요할 때만 덧붙인다.

---

## `why-how` 인사이트 길이·톤

요약·문장 품질의 공통 기준은 [`insight-summary-quality.md`](./insight-summary-quality.md)와 맞춘다.

- **너무 짧음:** 링크만 있고 “언제 쓰는지”가 없으면 나중에 또 README를 정독해야 함.
- **너무 김:** README를 복붙한 수준이면 인제스트와 중복되어 유지보수가 두 배.
- **적당함:** 대략 **400~900자 내외 본문**(섹션 나눈 뒤 합산)을 가이드로 둔다. 항목은 **불릿 위주**, 한 불릿에 문장 **1~2개**.
- **필수 블록:** 원본 링크 · 인제스트 상대 경로 · **한 줄로 하는 일** · **쓰면 이득인 상황 2~4개** · **실무에서의 사용 흐름(설치→실행→산출)** · **트레이드오프나 전제 1개** 정도.
- **선택:** `다음 액션` 한 줄, Yohan OS 안 분류 한 줄, `related`로 다른 노트 연결.

---

## 파일·ID 규칙

- **인사이트 `id`:** `{레포약칭-or-주제}-github-why-how` 또는 `{이름}-why-how` — `kebab-case`, 한 레포당 **why-how 하나**를 기본으로 한다.
- `**status`:** 처음엔 `draft`, 검토 후 `insight`.
- `**domain`:** `tools-research`, `devtools`, `ai-engineering` 등 실제 검색에 맞는 하나.
- `**tags`:** `github` + 용도 한두 개(예: `claude-code`, `skill`, `automation`).

## URL 정규화 규칙 (A안)

- `canonical_url`은 정규화해 저장한다: `utm_`*, `media_*`, `ranking_*` 파라미터 제거.
- `source_url`은 수집 원문 그대로 보존해도 된다. 즉 **재현성은 source_url**, **중복 방지는 canonical_url**로 분리한다.

---

## 작업 순서 (권장)

1. `**ingest_url`**(또는 동등 파이프)로 README를 `memory/ingest/url/`에 넣는다.
2. `**memory/templates/github-repo-why-how-template.md`**를 복사해 새 파일명으로 `insights/`에 둔다.
3. 템플릿 안내에 맞춰 채운 뒤 `related`·`ingest` 경로를 맞춘다.
4. 정말 **프로젝트에 채택**하면 그때 `decisions/` 또는 `active-project.yaml`에 한 줄로 연결한다. `why-how`만으로는 “채택 완료”를 뜻하지 않는다.

---

## 예시 참고

- `memory/ingest/insights/last30days-github-skill-why-how.md`

선별·맥락·파인만 티어: `memory/rules/archiving-appraisal-feynman.md`

---

## 에이전트·사람 공통

- 인사이트 작성 시 **인제스트에 없는 기능을 지어내지 않는다.** 불확실하면 “README 인제스트 확인”이라고 적는다.
- 업스트림이 크게 바뀌면 **인제스트를 다시 받고**, `why-how`의 **한 줄 요약·버전 한 줄·액션**만 갱신한다.