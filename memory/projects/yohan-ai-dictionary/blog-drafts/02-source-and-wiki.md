---
id: blog-draft-02-source-and-wiki
date: 2026-05-06
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [blog, draft, phase3, p3-4, source, memory-wiki, sot]
related:
  - memory/projects/yohan-ai-dictionary/vision.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/01-why-starlight-md.md
  - memory/wiki/concepts/harness-engineering.md
  - memory/wiki/concepts/single-source-of-truth.md
  - yohan-ai-dictionary/src/content/docs/terms/harness-engineering.md
  - yohan-ai-dictionary/src/content/docs/terms/rag.md
  - docs/adr/ADR-007-karpathy-llm-wiki.md
status: draft
target: yohan-ai-dictionary/src/content/docs/blog/ (Phase 3 P3-4 글 2편)
---

# `source:`와 `memory/wiki` 정합 운영법

> Phase 3 P3-4의 두 번째 글 초안입니다. 사전 뷰어가 시간이 갈수록 어긋나지 않게 하는 **운영 한 줄**을 정리합니다.

## 1. 두 개의 레이어, 하나의 진실

사전(`yohan-ai-dictionary/`)과 위키(`memory/wiki/`)는 같은 용어를 두 번 갖는다. 같은 단어를 두 번 적는 건 보통 나쁜 신호지만, 여기서는 **역할이 다르다**.

- **`memory/wiki/concepts/*.md`** — 정본. 인용·출처(`source_insights`)·관련 노드까지 다 적힌 **컴파일 입력**. 길고 두툼하다.
- **`yohan-ai-dictionary/src/content/docs/terms/*.md`** — 가공본. 1~2문장 정의 + 관련 용어 5개 + Starlight가 그릴 사이드바. **읽기 위해 다듬은 산출물**.

겹치는 4개 용어(`harness-engineering`·`vibe-coding-pipeline`·`rag`·`layered-context`)는 비전 문서가 못 박았다 — *원천은 위키, 사전은 미러*(`vision.md` §핵심 제약). 그래서 사전 쪽 프론트매터에는 한 줄이 들어간다.

```yaml
source: memory/wiki/concepts/harness-engineering.md
```

이 한 줄이 **앵커**다. 두 파일이 흩어져 있어도, 사전을 보는 사람은 항상 정본 위치를 알 수 있다.

## 2. RAG는 매번 검색, 위키는 미리 정리

왜 굳이 두 레이어를 두는가? 사전 항목 `rag.md`에 한 줄 답이 있다.

- **RAG = query-time** — 매번 질의할 때 검색·생성
- **Wiki = compile-time** — 미리 축적·검증한 지식을 구조화

RAG만으로는 같은 정의가 매번 조금씩 흔들린다. **검증한 결과를 한 번 기록해 두는 층**이 필요하다 — 그게 `memory/wiki/`다. 사전은 그 층의 가장 얇은 단면이다(독자가 5초 안에 읽고 넘어갈 분량).

## 3. drift는 어디서 생기나

실제로 부서지는 지점은 두 군데다.

1. **위키 → 사전 누락.** `memory/wiki/`에 새 인사이트가 병합됐는데(예: 교재 Ch.18 인용 한 줄 추가), 사전은 그대로다. 사전 정의가 한 단어 정도 낡는다.
2. **사전 → 위키 역류.** 글을 다듬다 보면 사전 본문이 더 정확해질 때가 있다. 그런데 위키를 안 고치면, 다음 빌드 때 **어느 쪽이 정본인지 흐려진다**.

둘 다 잡는 규칙은 **단방향**이다 — *사전은 위키를 따르고, 사전을 고친 줄은 같은 세션 안에 위키로 역류시킨다.* 카파시 LLM-Wiki 패턴(`docs/adr/ADR-007`)도 같은 결론에 닿는다 — **원본은 불변, 가공은 위키, 링크는 명시적으로**.

## 4. 운영 한 줄: "월 1회 빌드 + 한 건씩 동기화"

비전 문서의 `Phase 3 — 지속` 항목은 한 줄이다.

> 월 1회 `npm run build` · 용어–`memory/wiki` 문장 드리프트 시 한 건씩 동기화

**한 건씩**이 핵심이다. 17개 용어를 한 번에 맞추려고 하면 영영 못 한다. 빌드를 켜면 Starlight가 깨진 링크·중복 ID를 알려주고, `source:` 경로가 가리키는 위키 파일과 사전 정의 한 문장만 비교한다. 다르면 **위키를 정본 삼아 사전 한 줄을 고친다**. 다음 달에 또 한 건.

이 루틴은 작아 보이지만 복리로 작동한다. 17개가 250개로 자라도 매달 1~2건만 손대면 된다. 정본이 한 곳이라 그렇다(`memory/wiki/concepts/single-source-of-truth.md`).

## 5. 자동화는 다음 단계로 미뤘다

`source:` 경로 검증 스크립트를 짤 수도 있다 — 사전의 `source:` 프론트매터를 읽어 위키 파일이 실제 존재하는지, 정의 첫 문장이 위키와 토큰 단위로 얼마나 다른지 측정. 짠다면 한 시간이지만, **지금 단계에선 안 짠다**. 17개에서 250개로 자라기 전까지는 사람 눈이 더 빠르고 더 정확하다(`vision.md` 비범위 — *Phase 3 이후*로 미룸).

대신 `npm run build`만 월 1회 돌린다. 깨진 링크는 빌드가 잡고, 정의 drift는 같은 자리에서 한 줄로 고친다.

## 6. 다음 — 같은 패턴을 5분 안에

여기까지가 **두 레이어를 어긋나지 않게 굴리는 법**이었다. 다음 글에서는 **이 레포를 GitHub 템플릿으로 복제해서 첫 빌드까지 가는 길**(글 3)을 푼다 — `Use this template` 한 번, `npm install`·`npm run dev` 두 번, 그리고 자기 첫 용어 한 줄.

Phase 3의 끝은 거기다.

---

## 초안 메모 (편집 시 제거)

- **분량:** 약 1,400자. 글 1편(1,100자)보다 약간 길다 — 운영 규칙 4·5절 사례를 줄여 1,200대로 깎는 것도 가능.
- **인용 근거:** `vision.md` (4개 겹치는 용어·월 1회 빌드 운영 한 줄·자동화 비범위), `rag.md` (RAG vs Wiki 한 줄), `single-source-of-truth.md` (정본 단일화), `ADR-007` (LLM-Wiki 패턴 한 줄).
- **이전 위치:** Phase 3 P3-2 배포 후 `yohan-ai-dictionary/src/content/docs/blog/02-source-and-wiki.mdx`로 카피 (frontmatter Starlight 형식 변환 필요: `title`·`description`·`pubDate`).
- **검수 포인트:**
  - 4개 겹치는 용어 목록(harness-engineering·vibe-coding-pipeline·rag·layered-context)이 vision.md와 일치하는지 (drift 점검).
  - "월 1회 빌드" 한 줄이 vision.md `Phase 3 — 지속` 표기와 정확히 일치하는지.
  - 5절 자동화 비범위가 vision.md 비범위 항목과 충돌하지 않는지 (지금은 정합).
  - 글 3 예고 문장이 phase3-checklist.md P3-3·P3-4와 어긋나지 않는지.
