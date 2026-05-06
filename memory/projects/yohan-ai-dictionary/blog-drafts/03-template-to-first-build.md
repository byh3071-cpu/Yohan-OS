---
id: blog-draft-03-template-to-first-build
date: 2026-05-06
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [blog, draft, phase3, p3-3, p3-4, template, starlight, vercel, onboarding]
related:
  - memory/projects/yohan-ai-dictionary/vision.md
  - memory/projects/yohan-ai-dictionary/phase3-checklist.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/01-why-starlight-md.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/02-source-and-wiki.md
  - memory/projects/yohan-ai-dictionary/tickets/006-github-public-repo.md
  - memory/projects/yohan-ai-dictionary/tickets/007-vercel-deploy-and-template.md
  - yohan-ai-dictionary/README.md
status: draft
target: yohan-ai-dictionary/src/content/docs/blog/03-template-to-first-build.mdx (Phase 3 P3-4 글 3/3)
---

# 템플릿으로 복제해서 첫 빌드까지 — 5분 타임라인

> Phase 3 P3-4 세 번째 글 초안. 1편(왜 Starlight + 마크다운)·2편(`source:`와 `memory/wiki` 정합)에 이은 마무리. **약속** — `Use this template` 한 번부터 로컬에서 `npm run preview`까지 **5분 안**에 도착한다. (Vercel 배포는 push 이후 **추가 2~3분**으로 분리한다.)

## 0분 — Use this template 한 번

GitHub `byh3071-cpu/yohan-ai-dictionary`에서 우상단 초록 버튼 **`Use this template`** → `Create a new repository`. 이름은 `my-ai-dictionary`처럼 본인 것으로. **Public**으로 둬도 된다 — 사전은 공개되어야 검색·초대에 유리하다. fork가 아니라 **template**이라 커밋 히스토리·이슈가 따라오지 않는다(`phase3-checklist.md` P3-3, MIT 라이선스 유지).

## 1분 — clone + npm install

```bash
git clone https://github.com/<your-account>/my-ai-dictionary.git
cd my-ai-dictionary
npm install
```

`astro`, `@astrojs/starlight`, `astro-pagefind`(검색) 정도가 핵심이다. `sharp` 때문에 1~2분 더 걸리면 정상이다.

> **Windows + OneDrive + 한글·공백 경로**면 빌드가 가끔 불안정하다. `C:\dev\<repo>`처럼 짧은 경로로 두거나 `subst`로 드라이브 문자를 잡는 편이 안전하다(템플릿 레포 `README.md`의 preview·404 절 참고).

## 2분 — `npm run dev`

```bash
npm run dev
```

`http://localhost:4321`을 연다. 사이드바에 **17개 용어**가 보이고, 검색에서 `mcp`·`embedding`이 바로 잡힌다. **이 화면이 자기 사전의 출발점**이다 — 처음엔 17개를 굳이 지우지 말고 읽어도 된다. **가장 빠른 학습은 남이 정리한 인덱스를 일주일 읽는 것**이기도 하다.

## 3분 — 첫 용어 한 개

`src/content/docs/terms/`에 `my-first-term.md`를 만든다.

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

저장하면 핫리로드된다. **사이드바에 항목이 뜨면 성공**이다. 카테고리·아이콘은 나중.

## 4분 — `source:`는 있을 때만

2편의 `source: memory/wiki/...` 한 줄은 **별도 위키 레이어가 있을 때**만 의미가 있다. 처음엔 사전만 정본이어도 된다. 줄을 빼면 그만이다. 위키를 붙일 시점은 용어가 많아 정의가 흔들리기 시작할 때 — 그때 2편의 *월 1회 빌드 + 한 건씩 동기화*로 돌아오면 된다.

## 4분 30초 — 빌드·미리보기

```bash
npm run build
npm run preview
```

`dist/`가 생기고 미리보기가 뜨면 로컬 v0는 끝이다. 이 단계가 통과하면 Vercel·Cloudflare Pages 등 정적 호스팅으로 그대로 올릴 수 있다.

## 배포(선택) — Vercel

push 후 [vercel.com](https://vercel.com)에서 **Add New → Project → Import** → 해당 레포. Framework는 `Astro`, Build `astro build`, Output `dist`가 기본이다(`phase3-checklist.md` P3-2). 1~2분이면 `https://<project>.vercel.app`이 살아 있다.

## 그 다음

- **하루 한 용어**가 지속에 가장 잘 맞는다.
- 사이드바가 길어지면 Starlight 사이드바 그룹만 한 번 정리한다.
- 위키가 필요해지면 2편으로 돌아온다.

## 시리즈를 닫으며

- **1편:** 노션은 입력에 강하고 정합에 약하다. 마크다운 + Starlight는 그 반대다.
- **2편:** 두 레이어가 어긋나지 않게 하는 한 줄 — *월 1회 빌드 + 한 건씩 동기화.*
- **3편:** 템플릿 → 5분 안에 자기 사전.

Phase 3 P3-4 글 세 편은 여기서 닫는다. README 푸터에 한 줄 남기기 좋다 — *이 사전은 [yohan-ai-dictionary](https://github.com/byh3071-cpu/yohan-ai-dictionary) 템플릿으로 만들었다.*

---

## 초안 메모 (편집 시 제거)

- **통합:** 기존 `03-template-clone-5min.md` 초안과 본 파일을 한 편으로 합침(2026-05-06).
- **Starlight로 옮길 때:** `yohan-ai-dictionary/src/content/docs/blog/03-template-to-first-build.mdx` — 블로그 규약 `title`·`description`·`pubDate`로 변환.
- **검수:** 실제 시계로 5분 이내인지, `byh3071-cpu/yohan-ai-dictionary` URL·레포 공개 상태, "Public" 문구가 `vision.md` 비공개 데이터 제약과 충돌 없는지(사전 **콘텐츠** 공개 가정).
