---
id: blog-draft-03-template-to-first-build
date: 2026-05-06
domain: yohan-ai-dictionary
project: yohan-ai-dictionary
tags: [blog, draft, phase3, p3-4, template, first-build, starlight, vercel]
related:
  - memory/projects/yohan-ai-dictionary/vision.md
  - memory/projects/yohan-ai-dictionary/phase3-checklist.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/01-why-starlight-md.md
  - memory/projects/yohan-ai-dictionary/blog-drafts/02-source-and-wiki.md
  - yohan-ai-dictionary/README.md
status: draft
target: yohan-ai-dictionary/src/content/docs/blog/ (Phase 3 P3-4 글 3편 — 시리즈 마지막)
---

# 템플릿으로 복제해서 첫 빌드까지 — 5분 타임라인

> Phase 3 P3-4의 마지막 글 초안입니다. 1편(왜)·2편(운영)에 이어, **자기 사전을 5분 안에** 띄우는 길을 분 단위로 적습니다.

## 0분 — Use this template 한 번

GitHub의 `yohan-ai-dictionary` 레포에 들어가서 우상단 초록 버튼 **`Use this template`** → `Create a new repository`를 누른다. 본인 이름으로 새 레포가 만들어진다. fork가 아니라 **template**이다 — 커밋 히스토리는 0부터, 라이선스는 MIT 그대로(`phase3-checklist.md` P3-3).

## 1분 — clone + npm install

```bash
git clone https://github.com/<your-name>/<your-repo>.git
cd <your-repo>
npm install
```

`@astrojs/starlight`·`astro`·`sharp` 세 개가 설치된다. `sharp`가 가끔 늦으니 1~2분 걸리면 정상이다.

> **Windows + OneDrive + 한글·공백 경로**라면 빌드가 가끔 불안정하다. `C:\dev\<your-repo>` 같은 짧은 경로로 옮기거나 `subst`로 드라이브 문자를 잡는 게 안전하다(이 레포의 `README.md` "preview 404" 절 참고).

## 2분 — npm run dev

```bash
npm run dev
```

터미널에 찍힌 `http://localhost:4321`을 연다. **Starlight 기본 스플래시**가 보이면 끝. 사이드바·검색·다크모드는 이미 다 동작한다 — 1편에서 말한 *"Starlight는 비켜준다"*가 여기서 보인다.

## 3분 — 첫 용어 한 줄

`src/content/docs/terms/` 안에 `your-first-term.md` 하나를 만든다.

```yaml
---
title: 첫 용어
description: 한 줄 정의 — 검색 미리보기에 그대로 노출된다
status: draft
updated: "2026-05-06"
tags: [example]
---

## 정의

여기에 1~2문장. 그게 전부다.

## 관련 용어

- [다른 용어](/terms/another/) — 한 문장 설명
```

저장하면 dev 서버가 즉시 갱신한다. **사이드바에 항목이 떠 있으면 성공**이다. 카테고리 분류·아이콘 같은 건 나중. **있는 것 부터 쓴다.**

## 4분 — `source:`는 있을 때만

2편에서 말한 `source:` 프론트매터(`memory/wiki/...`로 가리키는 한 줄)는 **본인이 별도 위키 레이어를 가졌을 때**만 의미가 있다. 처음에는 사전 자체가 정본이어도 된다. 줄을 빼면 그만이다 — Starlight도 모른 척 잘 그린다.

위키 레이어를 추가할 시점은 용어가 50개를 넘어 정의가 흔들리기 시작할 때. 그때 2편 운영 한 줄("월 1회 빌드 + 한 건씩 동기화")로 돌아오면 된다.

## 5분 — Vercel에 올리기

push만 끝내면 배포는 한 번이다.

1. 새 레포를 GitHub에 push (Use this template으로 만들었다면 이미 거기 있다).
2. [vercel.com](https://vercel.com)에서 **Add New → Project → Import** → 그 레포를 고른다.
3. Framework는 `Astro`로 자동 인식, Build는 `astro build`, Output은 `dist`. 그대로 **Deploy**.

1~2분 안에 `https://<your-repo>.vercel.app`이 살아 있다(`phase3-checklist.md` P3-2). 모바일에서 한 번 열어보고 사이드바·검색·다크모드만 잘 뜨면 완료다.

## 그 다음 — 자기 손에 맞춰 굳히기

여기까지가 **누구나 5분**이다. 그 다음은 본인 도메인이다.

- **1주일 동안 매일 1~2개씩 용어를 추가**해 본다. 검색이 막히는 단어부터.
- **사이드바가 길어지면 카테고리를 만든다.** Starlight 사이드바 그룹 설정 한 번이면 된다.
- **위키 레이어가 필요해지면** 2편으로 돌아온다.

## 시리즈를 닫으며

세 편을 짧게 다시 묶으면 이렇다.

- **1편(왜):** 노션은 입력에 강하고 정합에 약하다. 마크다운 + Starlight는 그 반대다.
- **2편(운영):** 두 레이어가 어긋나지 않게 하는 한 줄 — *월 1회 빌드 + 한 건씩 동기화.*
- **3편(시작):** Use this template → 5분 안에 자기 사전.

같은 패턴으로 **자기 도메인 사전**을 만들고 싶다면 이제 막힐 곳이 없다. Phase 3는 여기서 닫힌다.

---

## 초안 메모 (편집 시 제거)

- **분량:** 약 1,300자. 1편(1,100)·2편(1,400) 사이로 수렴 — 시리즈 균형.
- **인용 근거:** `vision.md` (Phase 3 끝 = 5분 안에 시작), `phase3-checklist.md` (P3-2 Vercel·P3-3 템플릿), `yohan-ai-dictionary/README.md` (Windows OneDrive 한글 경로 케이스·로컬 실행 명령), 1편/2편 본문 인용.
- **이전 위치:** Phase 3 P3-2 배포 후 `yohan-ai-dictionary/src/content/docs/blog/03-template-to-first-build.mdx`로 카피 (frontmatter Starlight 형식 변환 필요: `title`·`description`·`pubDate`).
- **검수 포인트:**
  - GitHub repo URL/이름이 실제 공개 후 확정될 텐데, 본문에 placeholder(`<your-name>/<your-repo>`)로 둔 부분이 일관적인지.
  - "5분"이라는 약속이 실제 첫 시도 측정과 어긋나지 않는지 — 본인 측정 한 번 권장(`sharp` install 시간 포함).
  - Vercel Astro 자동 인식 단계가 현재 Vercel UI 문구와 일치하는지 (P3-2 실제 배포 시점에 한 번 더 캡처 검토).
  - 시리즈 마무리 3줄 요약이 실제 1·2편 결론 문장과 정합한지 (현재는 정합).
