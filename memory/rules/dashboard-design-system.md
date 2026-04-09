---

## id: dashboard-design-system

date: 2026-04-09
domain: dashboard
tags: [dashboard, design, ui, ux, rules]
related: [dashboard-spec, dashboard-quick-actions]
status: active

# 대시보드 디자인 시스템 규칙

대시보드 UI/UX 작업 시 **반드시 참조**하는 디자인 원칙. 새 컴포넌트·색상·레이아웃 변경 시 이 문서 기준으로 판단한다.

---

## 1. 색상 원칙

### 1.1 다크/라이트 양립 필수

- 색상 값은 반드시 `dark:` variant와 기본(라이트)을 **둘 다** 지정한다.
- 라이트: `text-*-700` + `bg-*-100` (진한 텍스트, 연한 배경)
- 다크: `text-*-300` + `bg-*-500/25` (밝은 텍스트, 반투명 배경)
- **단일 값**(`text-purple-400`)은 한쪽 모드에서 반드시 깨진다 → 금지.

### 1.2 대비 기준

- 텍스트 vs 배경 대비비: 최소 **4.5:1** (WCAG AA).
- 태그·뱃지처럼 작은 텍스트(12px 이하)는 **7:1** 이상 목표.
- 의심되면 브라우저 DevTools → Accessibility → Contrast ratio로 확인.

### 1.3 색감 톤

- 다크 기본: 슬레이트(#0f172a 계열) + 인디고/바이올렛 포인트.
- 라이트 기본: 흰색(#ffffff) + 동일 포인트 색의 700 톤.
- "눈 안 아픈" 기준: 채도 과다 금지, oklch 기반 CSS 변수 사용.

---

## 2. 타이포그래피


| 용도      | 크기                        | Weight        | 비고                        |
| ------- | ------------------------- | ------------- | ------------------------- |
| 카드 제목   | `text-sm` (14px)          | `font-medium` | `line-clamp-2`            |
| 태그 뱃지   | `text-[11px]`             | `font-medium` | 최소 가독 크기                  |
| 발췌/본문   | `text-xs` (12px)          | normal        | `line-clamp-2`            |
| 날짜/보조   | `text-[10px]~text-[11px]` | normal        | `text-muted-foreground`   |
| 미리보기 본문 | `prose-sm`                | -             | `@tailwindcss/typography` |


- `10px` 미만 텍스트 금지 — 어떤 화면에서도 읽을 수 없다.

---

## 3. 간격·밀도

- **빈 공간 싫음** — 정보가 눈에 팍 꽂히되 읽기 편한 구조.
- 카드 패딩: `p-3` (12px).
- 카드 간격: `space-y-2` (8px).
- 사이드바 항목 간격: `space-y-0.5` (2px) — 촘촘하게.
- 현황 카드: `gap-3` (12px), 모바일은 `grid-cols-2`.

---

## 4. 컴포넌트 패턴

### 4.1 태그 뱃지

```
PALETTE 기반: p("color") 함수 → bg + text + border 한 번에
라이트: bg-*-100 text-*-700 border-*-300
다크:   bg-*-500/25 text-*-300 border-*-500/40
```

- 새 태그 색상 추가 시 `PALETTE`에 먼저 등록, `TAG_COLORS`에서 `p()`로 참조.
- fallback: `p("slate")` — 매핑 안 된 태그는 무채색.

### 4.2 사이드바 접힌 상태 아이콘

- 카테고리·빠른 실행 **모두** `size-9`(36px) 정사각형 + `rounded-md`.
- 아이콘 크기: **16px 통일** (카테고리·빠른 실행 동일).
- 부모 정렬: `flex flex-col items-center` — 세로 중앙.
- 간격: `gap-0.5` 통일.
- **새 섹션 추가 시에도 같은 패턴**을 따른다.

### 4.3 버튼

- shadcn `Button` 사용. `variant`: ghost / outline / default.
- `<button>` 안에 `<button>` 금지 (hydration 에러).
- Tooltip + button 조합: Base UI `render` prop으로 단일 요소 합침.

### 4.4 스크롤 영역

- `ScrollArea` 사용 시 부모에 반드시 `overflow-hidden` + `min-h-0`.
- flex 컨테이너 안에서 `flex-1 min-h-0` 패턴.

---

## 5. 반응형


| 브레이크포인트         | 변경                   |
| --------------- | -------------------- |
| < 768px (md 미만) | 현황 카드 2열, 사이드바 접힘 기본 |
| >= 768px        | 현황 카드 4열, 사이드바 펼침    |
| >= 1024px (lg)  | 미리보기 패널 넓게           |


---

## 6. 디자인 변경 시 체크리스트

1. 라이트 모드에서 스크린샷 확인했는가?
2. 다크 모드에서 스크린샷 확인했는가?
3. 태그/뱃지 텍스트가 양쪽에서 읽히는가?
4. `10px` 미만 텍스트가 없는가?
5. 새 색상은 `PALETTE`에 등록했는가?
6. 스크롤 영역이 실제로 스크롤되는가?

---

## 7. 디자인 결정 기록 원칙

- 색상·레이아웃·컴포넌트 패턴 변경은 `**append_decision`으로 기록**한다.
- 사소한 간격 조정(1~2px)은 기록 불필요.
- 기록 기준: "다음 세션에서 왜 이렇게 했는지 모를 수 있는 변경".

---

## 8. 관련 파일

- 전체 스펙: `docs/DASHBOARD-SPEC.md`
- 빠른 실행 가이드: `memory/rules/dashboard-quick-actions.md`
- CSS 변수: `dashboard/src/app/globals.css`
- 태그 색상: `dashboard/src/components/doc-card.tsx` PALETTE

