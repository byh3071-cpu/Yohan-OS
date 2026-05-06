---
id: blog-draft-03-template-clone-5min
date: 2026-05-06
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [blog, draft, phase3, p3-3, p3-4, template, starlight, onboarding]
related:
  - memory/projects/yohan-ai-dictionary/blog-drafts/01-why-starlight-md.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/02-source-and-wiki.md
  - memory/projects/yohan-ai-dictionary/vision.md
  - memory/projects/yohan-ai-dictionary/phase3-checklist.md
  - memory/projects/yohan-ai-dictionary/tickets/006-github-public-repo.md
  - memory/projects/yohan-ai-dictionary/tickets/007-vercel-deploy-and-template.md
status: draft
target: yohan-ai-dictionary/src/content/docs/blog/ (Phase 3 P3-4 글 3/3)
---

# 템플릿으로 복제해서 첫 빌드까지 5분 타임라인

> Phase 3 P3-4 세 번째 글 초안. 1편(왜 Starlight + 마크다운)·2편(`source:`와 `memory/wiki` 정합)에 이은 마무리. **이 글의 약속은 단 하나** — Use this template 클릭부터 로컬 미리보기까지 **5분 안에** 도착한다.

## 0:00 — 시작

준비물은 둘이다.

- GitHub 계정
- Node v20 이상 (`node -v`로 확인)

그 외엔 없다. 디자인 시안도, 환경 변수도, 노션도 필요 없다. 5분 동안 우리가 만지는 건 **마크다운 파일 하나** + `npm run` 두 번뿐이다.

## 1:00 — 템플릿에서 새 레포 만들기

GitHub `byh3071-cpu/yohan-ai-dictionary` 페이지에서 우상단 초록 버튼 **"Use this template"** → "Create a new repository". 이름은 `my-ai-dictionary`처럼 자기 것으로. **Public**으로 둬도 된다 — 사전은 공개되어야 검색에 잡히고, 자기 인덱스가 된다.

> 템플릿 레포는 fork와 다르다. 커밋 히스토리·이슈·PR이 따라오지 않는, **빈 슬레이트**다. 한 달 뒤에 본인 사전이 30개 용어로 자라도, 원본 템플릿과 git 관계가 없어 부담이 없다.

## 2:00 — 클론 + 의존성 설치

```bash
git clone https://github.com/<your-account>/my-ai-dictionary.git
cd my-ai-dictionary
npm install
```

`npm install`이 1분 안에 끝난다 — Starlight는 큰 네이티브 의존성이 없다. 끝나면 `package.json`을 한 번만 본다. `astro`, `@astrojs/starlight`, 그리고 `astro-pagefind` (검색). 이게 전부다. **이해할 수 있는 크기의 도구**라는 점이 1편의 첫 약속이었다.

## 3:30 — `npm run dev`로 띄우기

```bash
npm run dev
```

`http://localhost:4321`이 열린다. 사이드바에 **17개 용어**가 그대로 떠 있고, 검색창에서 `mcp`나 `embedding`을 치면 바로 결과가 뜬다. **이 화면이 곧 자기 사전의 출발점**이다 — 이 글은 굳이 17개를 지우지 말자고 권한다. **가장 빠른 학습은 다른 사람이 정리한 것을 일주일 동안 읽는 것**이고, 사전은 그러기에 좋은 형태다.

## 4:00 — 첫 용어 한 개 추가

`src/content/docs/terms/`에 `mcp.md`가 보일 것이다. 같은 폴더에 새 파일을 만들자.

```
src/content/docs/terms/my-first-term.md
```

내용은 한 줄 frontmatter + 두 문단이면 충분하다.

```markdown
---
title: My First Term
description: 내가 매일 검색하는 첫 번째 용어.
---

## 정의

(2~3줄)

## 관련 용어

- [mcp](./mcp)
```

저장하면 dev 서버가 핫리로드된다. 사이드바에 항목이 추가되고, 검색에도 즉시 잡힌다. **이 한 번의 저장이 자기 사전의 첫 자국**이다.

## 5:00 — 빌드·미리보기·다음 한 줄

```bash
npm run build
npm run preview
```

`dist/`에 정적 사이트가 떨어지고, 미리보기 서버가 빌드된 결과를 띄운다. 이 단계가 통과하면 Vercel/Cloudflare Pages 어디든 그대로 올릴 수 있다.

5분이 끝났다. 자기 사전의 v0이 로컬에서 돌아간다.

## 다음 한 달

- **하루에 한 용어**가 가장 지속 가능한 페이스다. 7개면 한 주가 끝난다.
- 4개 핵심 개념(`harness-engineering`, `vibe-coding-pipeline`, `rag`, `layered-context`)에 손을 대면 2편의 `source:` 패턴을 떠올리자 — 자기 위키가 생기면 그 쪽이 정본, 사전은 미러.
- 한 달 뒤 `npm run build`가 30용어를 무리 없이 처리하면, 그게 곧 **이 패턴이 작동한다는 증거**다. 그 시점에 GitHub에 초대장처럼 짧은 README 한 줄을 적어두면 된다 — *"이건 [yohan-ai-dictionary](https://github.com/byh3071-cpu/yohan-ai-dictionary) 템플릿으로 만든 내 사전이다."*

복리는 작은 단위에서 시작된다. 5분 안에 한 번의 저장을 만들고 나면, 그 다음 저장은 1분 안에 일어난다.

---

## 초안 메모 (편집 시 제거)

- **분량:** 약 1,200자. 1편(1,100자)·2편(약 1,400자)과 비슷한 톤·길이.
- **타임라인 구성:** Phase 3 P3-3(GitHub 템플릿화) + P3-4 글 3편 비전 충족. 0:00→5:00 카드 6개 + "다음 한 달".
- **사전 외부 발신용 문장:** 마지막 "이건 …템플릿으로 만든 내 사전이다" 한 줄 — README 푸터에도 같은 문구가 좋다.
- **이전 위치:** `yohan-ai-dictionary/src/content/docs/blog/03-template-clone-5min.mdx`로 카피. frontmatter는 Starlight blog 규약(`title`·`description`·`pubDate`)으로 변환.
- **검수 포인트:**
  - 5분 타임라인이 실제로 5분 안에 끝나는지 — 다른 PC에서 시계 측정 필요. 1분 초과 시 단계 줄이거나 시간 표기 정정.
  - GitHub URL `byh3071-cpu/yohan-ai-dictionary`가 외부 공개 시점에 유효한지(레포 공개·이름 확정).
  - 17용어 → 본인 사전으로 점진 대체 권장 문구가 vision.md "AI스러운 디자인 금지·SoT 단일화" 톤과 충돌하지 않는지.
  - "Public으로 둬도 된다" 제안이 vision.md 비공개 데이터 유출 금지 제약과 정합한지(데이터가 아니라 사전 컨텐츠 자체는 공개 OK).
