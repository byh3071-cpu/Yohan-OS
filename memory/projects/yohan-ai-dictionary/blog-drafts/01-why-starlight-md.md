---
id: blog-draft-01-why-starlight-md
date: 2026-05-06
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [blog, draft, phase3, p3-4, starlight, llm-wiki]
related:
  - memory/projects/yohan-ai-dictionary/vision.md
  - docs/adr/ADR-007-karpathy-llm-wiki.md
  - docs/adr/ADR-006-notion-as-sot-mirror.md
  - memory/ingest/insights/llm-wiki-gist-why-how.md
  - memory/ingest/insights/modern-ai-ch18-knowledge-management-karpathy-wiki.md
status: draft
target: yohan-ai-dictionary/src/content/docs/blog/ (Phase 3 P3-4 글 1편)
---

# 왜 Starlight + 마크다운으로 사전을 만들었는가

> 이 글은 `yohan-ai-dictionary` Phase 3 P3-4의 첫 번째 글 초안입니다. 비전 문서와 ADR을 인용해 결정의 맥락만 정리합니다.

## 1. 시작 — 같은 단어를 또 구글링한다

AI 관련 글을 매일 읽다 보면 같은 용어를 **하루에 두세 번**씩 다시 검색하게 된다. **MCP**·**RAG**·**Embedding**·**Skills** 같은 단어가 그렇다. 매번 `medium.com`·블로그·논문을 새로 열어 비슷한 정의를 다시 읽는다. 검색이 길어지는 만큼 **생각하는 시간은 줄어든다**.

처음엔 노션에 페이지를 모았다. 잘 됐다 — 입력은. 그런데 검색이 자꾸 어긋났다. 같은 개념이 두 페이지에 흩어져 있고, 어느 쪽이 정본인지 흐려진다. **노션은 입력에 강하고 정합에 약하다**.

그래서 사전 뷰어를 따로 만들기로 했다.

## 2. 왜 새 SaaS가 아니라 Starlight + 마크다운인가

후보가 몇 개 있었다. 짧게 정리하면 이렇다.

| 후보 | 장점 | 왜 떨어졌나 |
|---|---|---|
| 노션 페이지 묶음 | 입력 즉시·모바일 강함 | diff·정본 추적 약함 (`docs/adr/ADR-006`) |
| Obsidian 볼트 | PKM 친화 | 모바일·공유·자동화 약함 |
| Confluence·Wiki.js | 기능 풍부 | 1인 운영에 과함, 락인 |
| **Starlight + 마크다운** | git diff·로컬 검색·정적 배포 | — |

핵심은 단 두 가지다.

- **마크다운 = 단일 출처(SoT)다.** 코드와 같은 git 흐름으로 추적된다. 누가 언제 무엇을 바꿨는지가 자동 기록된다.
- **Starlight는 비켜준다.** 사이드바·검색(Pagefind)·반응형이 기본값으로 이미 잘 돼 있다. **나는 글에만 집중하면 된다.**

## 3. 단일 SoT가 만드는 복리

이 사전의 4개 핵심 용어 — **harness-engineering · vibe-coding-pipeline · rag · layered-context** — 는 사전이 정본이 아니다. **`memory/wiki/`가 원천**이고, 사전의 같은 항목은 `source:` 프론트매터로 그곳을 가리킨다(`vision.md` 핵심 제약).

왜 이렇게 했나? Karpathy의 LLM-Wiki 패턴(`docs/adr/ADR-007`)이 한 줄로 답한다 — **원본은 불변, 가공은 위키, 링크는 명시적으로**. 한 곳에서만 정본을 고치면 사전과 위키가 자동으로 정렬된다. 17개 용어가 250개가 돼도 **검색·청킹의 상한이 무너지지 않는다**(현대AI개론 Ch.18 인사이트).

복리는 작은 단위에서 시작된다. 한 용어를 추가할 때마다 `## 관련 용어`로 최소 2개 링크를 단다. 한 달이면 그래프가 자라 있다.

## 4. "AI스러운 디자인 금지"라는 제약

비전 문서에 박아놓은 한 줄이다 — *Starlight 기본 테마 유지 + 최소 커스텀, 장식 X, 타이포·간격 중심*.

처음엔 모순처럼 들렸다. AI 용어 사전인데 AI스러운 디자인을 금지한다고? 이유는 단순하다. **AI스러움**이라는 게 보통 그라데이션·과한 마이크로인터랙션·대시보드 스타일을 뜻하는데, 그건 **읽는 도구**의 본분이 아니다. 단어를 빨리 찾고, 정의를 빠르게 읽고, 다음 단어로 점프하는 것 — 그게 전부다.

이 제약은 Phase 3에서도 유지된다. Vercel에 올린 뒤에도 디자인 토큰을 손대지 않는다.

## 5. 다음 — 같이 쓰는 사전으로

지금까지가 비전·제약의 이야기였다. 다음 글에서는 **`source:`와 `memory/wiki` 정합 운영법**(글 2)을, 그 다음 글에서는 **이 레포를 GitHub 템플릿으로 복제해서 첫 빌드까지 가는 길**(글 3)을 풀 예정이다.

배포 URL과 템플릿이 준비되면 같은 패턴으로 자기 사전을 만들고 싶은 사람이 5분 안에 시작할 수 있게 만드는 게 Phase 3의 끝이다.

---

## 초안 메모 (편집 시 제거)

- **분량:** 약 1,100자. Starlight 블로그 1편으로 적당.
- **인용 근거:** `memory/projects/yohan-ai-dictionary/vision.md`, `docs/adr/ADR-006`, `docs/adr/ADR-007`, `memory/ingest/insights/{llm-wiki-gist-why-how, modern-ai-ch18-knowledge-management-karpathy-wiki}.md`.
- **이전 위치:** Phase 3 P3-2 배포 후 `yohan-ai-dictionary/src/content/docs/blog/01-why-starlight-md.mdx`로 카피 (frontmatter Starlight 형식 변환 필요: `title`·`description`·`pubDate`).
- **검수 포인트:**
  - "AI스러움" 표현이 비전 문구와 정합한지 한 번 더 보기.
  - 4개 겹치는 용어 목록이 vision.md와 동일한지 (drift 점검).
  - "현대AI개론 Ch.18 인사이트" 인용은 본인 노트 기반 — 외부 공개 시 책 제목·저자 명시 검토.
