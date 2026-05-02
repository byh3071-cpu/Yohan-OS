---

## id: dashboard-spec

date: 2026-04-09
domain: dashboard
tags: [dashboard, ui, pwa, web, spec]
related: [yohan-os-mcp, agent-harness]
status: active

# Yohan OS 웹 대시보드 — 전체 스펙 문서

이 문서는 대시보드 구현 시 **맥락 유지를 위한 단일 참조**다. 새 세션에서 대시보드 작업 시 이 파일을 먼저 읽는다.

---

## 1. 배경·동기

### 1.1 사용자 특성 (profile.yaml 반영)

- **비개발자·비전공자**: CLI 16+ 커맨드 중 2~3개만 기억
- **시각 학습자**: 도식·마인드맵·조직도로 이해가 가장 빠름, 머릿속에 그림으로 기억
- **"도서관" 선호**: 분류별로 꺼내 쓰는 깔끔·심플·직관적 구조
- **재무제표·차트** 보는 걸 좋아함
- **2차 가공**: 콘텐츠화해서 전달·판매까지 고려한 구조

### 1.2 왜 UI가 1순위가 됐나

- 원래 체크리스트 15번(최하위)이었으나, 사용자 특성 확인 후 1순위로 상향
- CLI 벽 해소 + 시각 학습자 + 분류 뷰 = 세 병목을 한 번에 해결
- 결정 기록: `memory/decisions/2026-04-09-1155-*.md`

---

## 2. 디자인 스펙 (합의 완료)

### 2.1 레이아웃

- **C안 하이브리드**: 사이드바 + 카드 목록 + 미리보기 패널
- 옵시디언 자율성 + 노션 깔끔함 + Linear 트렌디함 영감

### 2.2 테마·색감

- **다크/라이트 토글** 지원
- 다크: 슬레이트 다크(#0f172a 계열) + 인디고/바이올렛 포인트
- 눈 안 아프고 트렌디한 감각

### 2.3 밀도·스타일

- 균형 — 빈 공간 싫음, 정보가 눈에 팍 꽂히되 읽기 편한 구조
- 노션 느낌 + 미니멀 + 대시보드(카드·차트) 혼합
- 마크다운 형식 적재적소 정렬
- 사람이 읽기 편하고, 2차 가공/전달에도 적합한 구조

### 2.4 기술 스택

- **프레임워크**: Next.js 16 (App Router, TypeScript)
- **스타일**: Tailwind CSS v4 + shadcn/ui
- **차트**: Recharts
- **아이콘**: Lucide React
- **마크다운**: react-markdown + remark-gfm
- **프론트매터**: gray-matter
- **PWA**: manifest.json + standalone display

### 2.5 목업 참조 이미지

- `assets/yohan-os-dashboard-mockup.png` (AI 생성 목업)
- `assets/c__Users_user_AppData_..._image-c335bfcc-*.png` (사용자 확인한 목업)

---

## 3. 프로젝트 구조

```
dashboard/
├── public/
│   └── manifest.json          # PWA
├── src/
│   ├── app/
│   │   ├── globals.css        # 다크/라이트 테마 변수 (인디고/바이올렛 커스텀)
│   │   ├── layout.tsx         # 루트 레이아웃 (ThemeProvider + TooltipProvider)
│   │   ├── page.tsx           # 메인 대시보드 페이지 (클라이언트 컴포넌트)
│   │   └── api/
│   │       └── docs/
│   │           ├── route.ts           # GET /api/docs → 전체 문서 목록 + 통계
│   │           └── [...path]/route.ts # GET /api/docs/:path → 개별 문서 본문
│   ├── components/
│   │   ├── theme-provider.tsx   # 다크/라이트 토글 Context
│   │   ├── header.tsx           # 상단 바 (로고, 검색, Ctrl+K, 테마 토글)
│   │   ├── sidebar.tsx          # 왼쪽 사이드바 (카테고리 + 빠른 실행)
│   │   ├── stat-cards.tsx       # 상단 현황 카드 4개
│   │   ├── doc-card.tsx         # 카드 목록의 개별 카드
│   │   ├── doc-preview.tsx      # 오른쪽 마크다운 미리보기 패널
│   │   ├── command-palette.tsx  # Ctrl+K 커맨드 팔레트
│   │   └── ui/                  # shadcn/ui 컴포넌트
│   └── lib/
│       ├── memory.ts            # memory/ 파일 읽기·파싱 (서버 전용)
│       ├── types.ts             # DocMeta, DocFull, Stats 타입
│       └── utils.ts             # shadcn/ui 유틸
├── package.json
└── tsconfig.json
```

---

## 4. API 설계

### GET /api/docs

- **응답**: `{ docs: DocMeta[], stats: Stats }`
- `docs`: memory/ 하위 6개 디렉토리(insights, rss, url, decisions, rules, templates)의 .md 파일
- `stats`: totalDocs, decisions, ingests, batchStatus, batchLastRun

### GET /api/docs/:relPath

- **응답**: `DocFull` (메타 + content + frontmatter)
- relPath 예: `ingest/insights/vibe-coding-pipeline.md`

---

## 5. v1 기능 목록 (현재 구현 상태)


| 기능                 | 상태    | 파일                                        |
| ------------------ | ----- | ----------------------------------------- |
| 하이브리드 레이아웃         | ✅ 구현  | `page.tsx`                                |
| 카테고리 분류 (10종)       | ✅ 구현  | `sidebar.tsx` · 스캔: `wiki`, `inbox/md_files`, `projects` + 기존 6경로 (`memory.ts`) |
| 현황 카드 4개           | ✅ 구현  | `stat-cards.tsx`                          |
| 문서 카드 목록           | ✅ 구현  | `doc-card.tsx`                            |
| 마크다운 미리보기          | ✅ 구현  | `doc-preview.tsx`                         |
| 커맨드 팔레트 (Ctrl+K)   | ✅ 구현  | `command-palette.tsx`                     |
| 빠른 실행 버튼 11개       | ✅ 구현  | `sidebar.tsx`, `api/run/route.ts`         |
| 빠른 실행 설명 가이드 (SoT) | ✅ 구현  | `memory/rules/dashboard-quick-actions.md` |
| 사이드바 접기/펼치기        | ✅ 구현  | `sidebar.tsx`                             |
| 다크/라이트 토글          | ✅ 구현  | `theme-provider.tsx`, `header.tsx`        |
| PWA manifest       | ✅ 구현  | `public/manifest.json`                    |
| memory/ 실제 데이터 연결  | ✅ 구현  | `lib/memory.ts`, API routes               |
| 디자인 품질 개선          | ✅ 완료  | 다크: GitHub 다크 기반, 라이트: 무채색 유지             |
| 빠른 실행 오류 수정        | ✅ 완료  | URL 인제스트(프롬프트), 메모리 검색(팔레트 연결)            |
| 반응형 모바일            | ✅ 기본 | `page.tsx`, `header.tsx`, `doc-preview.tsx` — `md` 미만 드로어·미리보기 전체(헤더 아래) |


### v2 Phase 2-A (구현 완료)


| 기능                     | 상태   | 파일                                                     |
| ---------------------- | ---- | ------------------------------------------------------ |
| 뷰 탭 (홈/차트/타임라인)        | ✅ 구현 | `view-tabs.tsx`, `page.tsx`                            |
| 세렌디피티 카드               | ✅ 구현 | `serendipity-card.tsx`, `memory.ts`                    |
| 인제스트 추이 차트 (Area)      | ✅ 구현 | `mini-charts.tsx`                                      |
| 도메인 분포 차트 (Pie)        | ✅ 구현 | `mini-charts.tsx`, `domains.ts`                        |
| 도메인 태그 매핑 (30→7)       | ✅ 구현 | `lib/domains.ts`                                       |
| 위젯 자동 접힘 (문서 선택 시)     | ✅ 구현 | `page.tsx`                                             |
| API charts+serendipity | ✅ 구현 | `api/docs/route.ts`                                    |
| 에러 로그 분리               | ✅ 구현 | `scripts/automation-batch.ts` → `memory/logs/errors/`  |
| 세션 로그 구조               | ✅ 구현 | `memory/rules/session-log.md`, `memory/logs/sessions/` |
| 지식 별자리 (별자리 탭·API)   | ✅ D-1+ | `api/constellation/route.ts`, `constellation-view.tsx`, `lib/constellation.ts` |

## 6. 디자인 확정 사항

### 다크 모드 — GitHub 다크 기반 (2026-04-10 확정)

- 배경: `oklch(0.145 0.014 256)` — 블루 틴트 미세, 차가운 느낌
- 카드: `oklch(0.19 0.014 256)` — 배경과 확실한 분리
- 경계선: `oklch(0.30 0.01 252)` — 뚜렷한 구분
- 결정 기록: `memory/decisions/2026-04-09-1607-*.md`

### 라이트 모드 — 완전 무채색 (사용자 선호)

- 모든 base 색상 hue=0, chroma=0
- 차트·태그만 컬러 사용

### 기각된 방향

- 인디고/바이올렛 포인트 → "AI 스럽고 흔해빠진 느낌" (사용자 피드백)
- 완전 무채색 다크 → "가독성 나쁨, 밋밋함"
- 그라데이션/글로우/shadow-color → AI 작업물 느낌

### 빠른 실행 정리 (16개 → 11개)

- 제거: 새 결정(에이전트가 자동), 새 인사이트(인제스트로 자동), OCR 업로드(텔레그램 봇), 체인지로그(타임라인 탭으로 대체), 평가 로그(불필요 판단)

---

## 7. 로드맵 (v1 → v5)

### v1 — 기반: "CLI 없이 쓸 수 있다"

- 레이아웃, 커맨드팔레트, 라이브러리, 빠른실행, 현황카드
- PWA + 반응형 + 다크/라이트
- 커스텀 기본 (아이콘, 커버, 테마 색상)

### v2 — 지능: "AI가 도와준다"

- 오늘의 브리핑 (AI 자동 요약)
- 체인지로그 (Git 기반 자동 추출)
- 개발 로그 뷰 (오류/디버깅/리팩토링)
- 차트 5개 (인제스트 추이, 도메인 분포, 배치 성공률, 활동 타임라인, 결정 히스토리)
- 세렌디피티 카드 (랜덤 과거 인사이트)
- 결정 타임라인
- 템플릿 원클릭
- 자연어 명령 (커맨드 팔레트 확장)

### v3 — 시각화: "눈이 즐겁다"

- **지식 별자리 (3D)** ← 킥 피처 (**D 페이즈**로 구현: §10.1)
- AI 초안 → 검토 → **확정** 시 SoT 저장 (인사이트·결정·계획 등, §10.11)
- 주의 히트맵 (GitHub 잔디밭 + 도메인별 색)
- 에이전트 라이브 피드 (실시간 작업 스트리밍)
- 포커스 모드 (active-project 기반 자동 필터링)
- 지식 리플레이 (주간 학습 슬라이드)
- 위젯 드래그 커스텀

### v4 — 콘텐츠: "가치를 만든다"

- 음성 메모 → 인사이트 (STT + 요약)
- 2차 가공 내보내기 (블로그/프레젠테이션/SNS, AI티 안 나게)
- 에이전트 캐릭터화 (라이브 피드를 캐릭터·애니메이션으로)
- 커스텀 CSS
- AI 맥락 패널 (get_context 시각화)

### v5 — 플랫폼: "세계 최고를 향해"

- 캔버스/화이트보드
- 모바일 전용 최적화
- 외부 접속 (Cloudflare Tunnel)
- 테마 마켓
- 벡터 검색 심화 연동
- 멀티 디바이스 실시간 동기

---

## 8. 빠른 실행 버튼 목록 (합의)

**각 버튼 역할·v1 실제 동작**은 SoT 가이드 `memory/rules/dashboard-quick-actions.md`를 단일 참조로 쓴다. (대시보드 **규칙** 카테고리에서도 열 수 있음.)


| #   | 라벨              | action key       | npm 스크립트                   |
| --- | --------------- | ---------------- | -------------------------- |
| 1   | URL 인제스트        | ingest:url       | `npm run ingest:url`       |
| 2   | RSS 수집          | ingest:all       | `npm run ingest:all`       |
| 3   | 노션 푸시           | sync:notion:push | `npm run sync:notion:push` |
| 4   | 노션 풀            | sync:notion:pull | `npm run sync:notion:pull` |
| 5   | 주간 리포트          | report:weekly    | `npm run report:weekly`    |
| 6   | 드리프트 점검         | check:drift      | `npm run check:drift`      |
| 7   | 메모리 검색          | search:memory    | `npm run search:memory`    |
| 8   | 새 결정 기록         | new:decision     | MCP `append_decision`      |
| 9   | 봇 상태            | bot:status       | `npm run bot` 상태 확인        |
| 10  | 배치 즉시 실행        | automation:batch | `npm run automation:batch` |
| 11  | MCP 빌드          | build            | `npm run build`            |
| 12  | Git 동기화         | git:sync         | `git pull && git push`     |
| 13  | 새 인사이트 작성       | new:insight      | 빈 템플릿 열기                   |
| 14  | OCR 스크린샷 업로드    | ocr:upload       | 이미지 → OCR → 인사이트           |
| 15  | 체인지로그 보기        | view:changelog   | Git log 뷰                  |
| 16  | Evaluator 로그 보기 | view:evaluator   | metrics/evaluations 뷰      |


---

## 9. 실행 방법

```bash
# 개발 모드
npm run dashboard          # localhost:3000 (또는 다른 포트)

# 빌드
npm run dashboard:build

# 프로덕션
npm run dashboard:start
```

포트 충돌 시: `npx next dev --port 4000` (dashboard/ 디렉토리에서)

런타임 안정화·장애 복구 표준은 `memory/rules/dashboard-runtime-stability.md`를 단일 참조로 따른다. (Node 프로세스 폭증, `tailwindcss` resolve 오류, `EADDRINUSE` 포함)

---

## 10. 혁신 기능 상세 (v2~v4 참조)

### 10.1 지식 별자리 (v3, 킥 피처) — **D 페이즈 로드맵**

**목표**: 난이도·버그·성능 리스크를 나눠서 올린다. 비전은 **D = C 레이아웃 + 시간(A) + 중력(B) + 성운(C 시각)** 조합이나, **구현은 D-1 → D-4 순**.

#### 데이터·레이아웃 원칙

- **문서 풀**: 카테고리별로 모두 표시해 **은하단** 느낌 (~200 목표). `related`만 있으면 고립 노드가 바깥으로 흩어지는 문제를 피함.
- **기본 레이아웃 (현재 규모)**: **옵션 C** — 카테고리별 **고정 3D 영역**에 노드 배치 + `related`로 **연결선**. 카테고리 간 다리 = 교차 카테고리 링크.
- **대규모 전환 (~1000+ 문서, 연결 밀도 높을 때)**: **옵션 A** (순수 force-directed) 또는 **C+A 하이브리드** 검토 — 큰 틀은 카테고리, 국소만 물리.
- **노드**: 카테고리별 색(차트·대시보드와 정합). 허브(id 참조 다수)는 크기·밝기 강조.
- **인터랙션**: 3D 회전·줌 필수. 클릭 → 기존 **미리보기 패널** 연결(B안, 구현·일관성 유리).

#### D-1 (필수 — 첫 출시 단위)

- API: `/api/constellation` — nodes(edges, 카테고리, 위치 메타) + edges
- UI: 뷰 탭 **별자리**, `@react-three/fiber` + `@react-three/drei`
- 옵션 C 레이아웃, 연결선, 호버 라벨, 클릭→DocPreview
- UX: 은하 라벨(카테고리·건수), 배경(우주 톤), 미세 반짝임, 줌 레벨에 따른 정보 밀도, 카테고리 필터(하이라이트/흐림)

#### D-2 — 시간 (혁신 A)

- 날짜 슬라이더: 선택 시점 이전/이후 문서·연결 표시 변화(성장 애니메이션)
- 성능: 시점 필터는 데이터 단에서 제한

#### D-3 — 중력 (혁신 B)

- 허브 노드 주변만 부드러운 끌림(토글). D-1 안정 후 추가

#### D-4 — 성운 (혁신 C)

- 카테고리·밀도를 포그/인스턴스로 표현. 성능 프로파일 후 단계적 도입

#### 구현 순서(참고)

1. 데이터 API
2. 기본 3D 씬 + 옵션 C 배치 + OrbitControls
3. 연결선 + 허브 강조
4. 미리보기 연동 + D-2~D-4 순 확장

---

### 10.11 v3 — AI 초안 → 검토 → 확정 저장 (기획안 플로우)

- 사용자: 주제·맥락 입력 → AI가 **초안** 생성(OpenAI 등, 브리핑 API 패턴 재사용)
- 대시보드: 미리보기에서 초안 확인, 수정 요청 반복 가능
- **확정** 버튼 → `memory/`에 YAML+본문 규격으로 저장 (인사이트·결정·작업계획·실패보고 등 템플릿 종류 선택)
- Cursor의 `append_decision`과 병행: 사람 판단 지점은 **확정** 한 번으로 명확히

### 10.2 오늘의 브리핑 (v2)

- 아침에 대시보드 열면 AI가 어제 요약 + 확인 필요 + 오늘 제안 + 세렌디피티 표시
- 배치 로그 + 인제스트 + 결정 + 규칙 상태를 AI가 조합

### 10.3 주의 히트맵 (v3)

- GitHub 잔디밭 + 도메인별(창업/재무/개발/생산성) 색 레이어
- 써보면서 조정

### 10.4 에이전트 라이브 피드 (v3 → v4 캐릭터화)

- 실시간 작업 스트리밍 ("인제스트 중... OCR 처리 중...")
- 나중에 캐릭터·애니메이션·게임 요소로 진화 (독창성·재미)

### 10.5 세렌디피티 카드 (v2)

- 대시보드 열 때마다 과거 인사이트 랜덤 1장
- 잊힌 지식 재발견

### 10.6 결정 타임라인 (v2)

- 시간축 위 결정들이 점으로, 클릭하면 맥락
- 써보면서 판단

### 10.7 자연어 명령 (v2)

- 커맨드 팔레트에서 "어제 저장한 글 보여줘" → AI가 찾아서 열어줌

### 10.8 포커스 모드 (v3)

- active-project 기반, 관련 문서만 자동 필터링
- 나머지 숨김 → 집중

### 10.9 음성 메모 → 인사이트 (v4)

- 말하면 → STT → 요약 → 인사이트 카드 자동 생성
- 노션 AI 노트 녹음 경험에서 중요성 확인 (사용자)

### 10.10 2차 가공 내보내기 (v4)

- 인사이트를 블로그/프레젠테이션/SNS 포스트로 변환
- AI티 안 나면서 맞춤형, 품질·퀄리티 중시
- 장기적으로 핵심 (사용자 강력 요청)

---

## 11. 결정 기록 참조

- `memory/decisions/2026-04-09-1155-웹-대시보드pwa-구현-결정--ui를-다음-핵심-기능으로-선택.md`
- `memory/decisions/2026-04-09-1235-웹-대시보드-v1v2v3-스펙-합의--구현-전-대기.md`
- `memory/decisions/2026-04-09-1249-웹-대시보드-로드맵-v1v5-최종-확정.md`

---

## 12. 다음 단계

1. ~~**빠른 실행 실제 동작**~~ — ✅ 완료
2. ~~**사이드바 접기**~~ — ✅ 완료
3. ~~**빠른 실행 + 커맨드 팔레트**~~ — ✅ 완료 (16→11개 정리)
4. ~~**v1 디자인 품질 개선**~~ — ✅ 완료 (다크: GitHub, 라이트: 무채색)
5. ~~**v2 기능**~~ — ✅ 완료 (브리핑, 차트, 타임라인, 세렌디피티, AI검색)
6. ~~**빠른 실행 오류 수정**~~ — ✅ 완료 (URL 프롬프트, 메모리 검색→팔레트)
7. ~~**반응형 모바일 (기본)**~~ — ✅ 완료 (`md` 미만 메뉴 드로어·미리보기 오버레이)
8. ~~**v3 지식 별자리 D-1**~~ — ✅ 완료 (`/api/constellation`, 별자리 탭). 이후: **D-2~D-4 고도화** · **AI 초안→확정(§10.11)** · 히트맵 등

---

*이 문서는 대시보드 관련 새 세션 시작 시 반드시 참조한다. 변경 시 이 파일을 갱신한다.*