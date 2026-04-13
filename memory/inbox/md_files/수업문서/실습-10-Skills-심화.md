// practice-10.typ — 실습 10차시: Skills 심화: 복합 스킬

// ━━━ 표지 ━━━
,
  badge-color: practice-color.primary,
  title-color: practice-color.primary,
  accent-color: practice-color.accent,
  box-bg: practice-color.bg,
  box-border: practice-color.border,
)

// ━━━ 핵심 질문 ━━━
> ***핵심 질문****: 지난 시간에 커밋 스킬 하나를 만들었어요. 그런데 실무에서는 "코드 리뷰 후 커밋", "테스트 통과 후 배포"처럼 여러 작업이 연결되는 경우가 많아요. 여러 스킬을 어떻게 조합하고 관리할 수 있을까요?

// ━━━ 배경지식 ━━━
# 0. 오늘 만들 결과물

이번 실습이 끝나면 두 개의 스킬이 완성돼요. 하나는 코드 리뷰 스킬이고, 다른 하나는 지난 시간에 만든 커밋 스킬을 업그레이드한 버전이에요. 그리고 이 둘이 연결되어 "리뷰 후 커밋"이라는 워크플로우가 완성돼요.

#summary-box(title: "배경지식: 복합 스킬과 컨텍스트 관리")[
  스킬은 단독으로도 유용하지만, 여러 스킬을 조합하면 더 강력해져요. 이때 두 가지를 고려해야 해요.

  첫째, **allowed-tools**예요. 스킬이 사용할 수 있는 도구를 제한하면 안전성이 높아져요. 예를 들어 코드 리뷰 스킬은 파일을 읽기만 하면 되니까, 쓰기 도구는 제외할 수 있어요.

  둘째, **context fork**예요. 스킬이 실행될 때 메인 대화와 별도의 컨텍스트에서 동작하게 하면, 스킬의 중간 과정이 메인 대화를 어지럽히지 않아요. 복잡한 분석을 수행하는 스킬에서 특히 유용해요.
]

#prep-box((
  [지난 실습에서 만든 practice-todo-app 프로젝트],
  [`.claude/commands/commit.md` 파일 (지난 실습에서 작성)],
  [Claude Code],
))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. allowed-tools 설정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(1, "스킬이 사용할 수 있는 도구를 제한해요")[
  스킬에는 `allowed-tools`를 설정할 수 있어요. 이 설정이 없으면 스킬은 Claude가 사용할 수 있는 모든 도구를 사용할 수 있어요. 안전을 위해, 스킬에 필요한 도구만 허용하는 것이 좋은 습관이에요.

  지난 시간에 만든 `commit.md`를 열어보세요.

  ```
  code ~/practice-todo-app/.claude/commands/commit.md
  ```
]

프론트매터에 `allowed-tools`를 추가해볼게요. 커밋 스킬에 필요한 도구는 Bash(git 명령어 실행)와 파일 읽기예요.

```markdown
---
description: "변경사항을 분석하고 컨벤셔널 커밋 메시지를 작성합니다"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

# 커밋 스킬
(이하 기존 내용 동일)
```

`allowed-tools`에 명시한 도구만 이 스킬 실행 중에 사용할 수 있어요. 파일 쓰기(`Write`, `Edit`)를 제외했기 때문에, 커밋 스킬이 실행되는 동안에는 파일 내용을 수정할 수 없어요. 커밋 전에 코드를 멋대로 고치는 것을 방지하는 안전장치인 셈이에요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[도구],
    text(fill: color.white, weight: "bold")[허용 이유],
  ),
  text(weight: "bold", fill: practice-color.primary)[Bash], [git status, git diff, git add, git commit 실행에 필요],
  text(weight: "bold", fill: practice-color.primary)[Read], [파일 내용을 읽어서 변경사항 분석에 필요],
  text(weight: "bold", fill: practice-color.primary)[Glob], [파일 목록을 조회하는 데 필요],
  text(weight: "bold", fill: practice-color.primary)[Grep], [파일 내용을 검색하는 데 필요],
)

> ****핵심****: allowed-tools는 "최소 권한 원칙"의 구현이에요. 스킬이 필요한 도구만 허용하면, 의도치 않은 부작용을 예방할 수 있어요. 특히 파일을 수정하거나 외부 API를 호출하는 도구는 신중하게 허용하세요.

#try-it[
  allowed-tools의 효과를 확인해보세요.

  1. 커밋 스킬을 실행한 상태에서 "이 파일 내용도 수정해줘"라고 요청해보세요
  2. Write 도구가 제한되어 있기 때문에 Claude가 수정을 거부할 거예요
  3. allowed-tools에 "Write"를 추가하고 같은 요청을 해보세요
  4. 이번에는 수정이 가능해질 거예요

  이 차이를 통해 allowed-tools의 역할을 체감할 수 있어요.
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. 두 번째 스킬 제작: 코드 리뷰
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(2, "다른 도메인의 스킬을 만들어봐요")[
  이번에는 코드 리뷰 스킬을 만들어볼 거예요. 이 스킬은 변경된 코드를 분석하고, 잠재적 문제와 개선 사항을 찾아주는 스킬이에요.

  새 파일을 만들어보세요.

  ```
  code ~/practice-todo-app/.claude/commands/review.md
  ```
]

아래 내용을 작성하세요.

``````markdown
---
description: "변경된 코드를 리뷰하고 개선 사항을 제안합니다"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

# 코드 리뷰 스킬

## 리뷰 절차

1. ****변경 범위 파악****
   - `git diff`를 실행하여 변경된 코드를 확인하세요
   - 변경된 파일의 전체 컨텍스트를 읽어 이해하세요

2. ****코드 품질 점검****
   다음 항목을 순서대로 점검하세요:
   - [ ] 타입 힌트가 빠진 함수가 있는가
   - [ ] 에러 처리가 누락된 부분이 있는가
   - [ ] 하드코딩된 값이 있는가
   - [ ] 중복 코드가 있는가
   - [ ] 함수가 30줄을 넘는가

3. ****보안 점검****
   - [ ] 민감 정보(API 키, 비밀번호)가 코드에 포함되어 있는가
   - [ ] SQL 인젝션 등 입력 검증이 필요한 부분이 있는가
   - [ ] 로깅에 민감 정보가 포함되는가

4. ****결과 보고****
   아래 형식으로 리뷰 결과를 정리하세요:

   ## 코드 리뷰 결과

   ### 발견된 문제 (심각도 높음)
   - [파일:줄] 문제 설명

   ### 개선 제안 (선택)
   - [파일:줄] 제안 내용

   ### 칭찬할 점
   - 잘 작성된 부분 언급

## 규칙
- 리뷰는 읽기 전용이에요. 코드를 직접 수정하지 마세요
- 문제의 심각도를 높음/중간/낮음으로 구분하세요
- 개선 제안에는 항상 "왜" 개선해야 하는지 이유를 포함하세요
- 칭찬할 점을 최소 1개는 찾아주세요

$ARGUMENTS가 있다면 해당 부분을 중점적으로 리뷰하세요.
``````

#screenshot[review.md 스킬 파일을 작성 완료한 화면]

이제 두 개의 스킬이 준비되었어요. 코드 리뷰 스킬을 테스트해볼게요.

```
cd ~/practice-todo-app
claude
```

파일을 하나 수정하고 리뷰 스킬을 실행해보세요.

```
> src/utils.py에 데이터를 파싱하는 함수를 추가해줘
> /review
```

#screenshot[/review 스킬이 실행되어 코드 리뷰 결과를 보여주는 화면]

코드 리뷰 스킬이 변경사항을 분석하고, 체크리스트 항목별로 점검 결과를 보여줄 거예요. 문제가 발견되면 파일명과 줄 번호와 함께 구체적으로 알려줘요.

> ****핵심****: 좋은 리뷰 스킬은 "무엇을 점검할지"를 체크리스트로 명시해요. Claude는 이 체크리스트를 하나씩 따라가면서 빠짐없이 점검해요. 체크리스트가 구체적일수록 리뷰 품질이 올라가요.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. 자동 매칭 테스트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(3, "여러 스킬이 있을 때 자동 매칭이 어떻게 되는지 확인해요")[
  이제 두 개의 스킬이 있어요. 자연어로 요청했을 때 Claude가 올바른 스킬을 선택하는지 테스트해볼 거예요.

  Claude Code에서 아래 요청들을 하나씩 해보세요.
]

#table(
  columns: (1fr, auto, auto),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[요청],
    text(fill: color.white, weight: "bold")[기대 스킬],
    text(fill: color.white, weight: "bold")[실제 결과],
  ),
  ["변경사항을 커밋해줘"], [`/commit`], [직접 확인],
  ["코드를 리뷰해줘"], [`/review`], [직접 확인],
  ["이 코드에 문제가 있는지 봐줘"], [`/review`], [직접 확인],
  ["수정한 내용을 저장해줘"], [`/commit`], [직접 확인],
  ["코드 품질을 점검해줘"], [`/review`], [직접 확인],
)

실제 결과가 기대와 다른 경우가 있을 수 있어요. 그럴 때는 description을 더 구체적으로 수정하면 정확도가 올라가요.

#try-it[
  자동 매칭이 혼동될 만한 요청을 일부러 해보세요.

  1. "코드를 확인하고 커밋해줘", 리뷰? 커밋? 둘 다?
  2. "문제 없으면 커밋해줘", 리뷰 후 커밋?
  3. "이거 괜찮아 보여?", 리뷰?

  Claude가 어떤 스킬을 선택하는지 관찰하고, 왜 그 스킬을 선택했는지 물어보세요.

  ```
  > 왜 그 스킬을 선택했어?
  ```
]

## 스킬 조합: 리뷰 후 커밋 워크플로우

"리뷰 후 커밋"이라는 워크플로우를 만들어볼게요. 새 스킬 파일을 만들어보세요.

```
code ~/practice-todo-app/.claude/commands/review-and-commit.md
```

```markdown
---
description: "코드를 리뷰한 후, 문제가 없으면 커밋합니다"
allowed-tools: ["Bash", "Read", "Glob", "Grep", "Edit"]
---

# 리뷰 후 커밋

## 절차

1. ****코드 리뷰 수행****
   - `git diff`로 변경사항을 확인하세요
   - 아래 항목을 점검하세요:
     - 타입 힌트 누락
     - 에러 처리 누락
     - 보안 문제
     - 코드 스타일 위반

2. ****리뷰 결과 보고****
   - 발견된 문제를 심각도별로 정리하세요
   - 사용자에게 결과를 보여주세요

3. ****분기 처리****
   - ****심각한 문제가 있으면****: 문제 목록을 보여주고 수정 여부를 물어보세요
     - 수정을 원하면 문제를 수정하세요
     - 수정을 원하지 않으면 중단하세요
   - ****문제가 없거나 경미하면****: 커밋 절차로 진행하세요

4. ****커밋 수행****
   - Conventional Commits 형식으로 커밋 메시지를 작성하세요
   - 사용자 확인을 받은 후 커밋하세요
```

이 스킬은 리뷰와 커밋을 연결하면서, 중간에 조건 분기를 넣었어요. "문제가 있으면 수정할지 물어보고, 없으면 바로 커밋"하는 흐름이에요.

#screenshot[/review-and-commit 스킬 실행 시 리뷰 후 커밋까지 진행되는 화면]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. Context Fork 설정
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(4, "스킬을 독립된 컨텍스트에서 실행하는 방법을 알아봐요")[
  스킬이 복잡한 분석을 수행할 때, 중간 과정의 모든 출력이 메인 대화에 쌓이면 컨텍스트가 지저분해져요. context fork를 사용하면 스킬이 별도의 컨텍스트에서 실행되고, 최종 결과만 메인 대화로 돌아와요.

  이것은 마치 팀원에게 일을 위임하는 것과 비슷해요. "이거 분석해서 결과만 알려줘"라고 하면, 팀원이 중간에 뭘 했는지는 모르지만 결론만 깔끔하게 받아볼 수 있잖아요.
]

코드 리뷰 스킬에 context fork를 적용해볼게요. `review.md`를 수정하세요.

```markdown
---
description: "변경된 코드를 리뷰하고 개선 사항을 제안합니다"
allowed-tools: ["Bash", "Read", "Glob", "Grep"]
---

# 코드 리뷰 스킬

(기존 내용은 유지하되, 맨 아래에 아래 내용 추가)

## 실행 모드
이 스킬은 서브에이전트로 실행되어야 해요. 중간 분석 과정은 사용자에게
보여주지 않고, 최종 리뷰 결과만 깔끔하게 정리해서 전달하세요.
```

Claude Code에서 스킬을 서브에이전트 모드로 실행하면 독립된 컨텍스트에서 작업이 수행돼요. 현재 Claude Code에서는 스킬 실행 시 자동으로 이 모드를 적용할 수 있어요.

#try-it[
  context fork의 효과를 비교해보세요.

  1. `/review`를 실행하고 Claude가 중간 과정을 어떻게 보여주는지 관찰하세요
  2. 리뷰가 끝나면 메인 대화에 얼마나 많은 내용이 쌓여 있는지 확인하세요

  중간 과정이 많은 복잡한 스킬일수록 context fork의 효과가 커져요. 특히 여러 파일을 분석하는 스킬에서는 중간에 파일 내용이 계속 출력되면서 대화가 길어지거든요.
]

## 스킬 설계 패턴 정리

지금까지 배운 스킬 설계 패턴을 정리해볼게요.

#table(
  columns: (auto, 1fr, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[패턴],
    text(fill: color.white, weight: "bold")[설명],
    text(fill: color.white, weight: "bold")[예시],
  ),
  text(weight: "bold", fill: practice-color.primary)[단일 작업], [하나의 명확한 작업을 수행], [커밋, 리뷰, 테스트],
  text(weight: "bold", fill: practice-color.primary)[파이프라인], [여러 단계를 순서대로 수행], [리뷰 → 커밋],
  text(weight: "bold", fill: practice-color.primary)[조건 분기], [결과에 따라 다른 경로 실행], [문제 있으면 수정, 없으면 진행],
  text(weight: "bold", fill: practice-color.primary)[도구 제한], [allowed-tools로 안전 범위 설정], [리뷰: 읽기만, 커밋: 읽기+실행],
  text(weight: "bold", fill: practice-color.primary)[인자 활용], [`$ARGUMENTS`로 유연하게], [특정 파일만 리뷰],
)

> ****핵심****: 복합 스킬을 설계할 때 가장 중요한 원칙은 "각 스킬은 하나의 책임만"이에요. 커밋 스킬은 커밋만, 리뷰 스킬은 리뷰만 담당하고, 이를 조합하는 별도의 스킬을 만드는 것이 유지보수에 유리해요.

## 실무에서 유용한 스킬 아이디어

여러분의 업무에 적용할 수 있는 스킬 아이디어를 몇 가지 소개할게요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[스킬 이름],
    text(fill: color.white, weight: "bold")[용도],
  ),
  text(weight: "bold", fill: practice-color.primary)[`/deploy`], [배포 절차 자동화 (테스트 → 빌드 → 배포 → 확인)],
  text(weight: "bold", fill: practice-color.primary)[`/doc`], [코드에서 문서를 자동 생성 (함수별 설명, API 문서)],
  text(weight: "bold", fill: practice-color.primary)[`/refactor`], [코드 리팩토링 (중복 제거, 함수 분리, 네이밍 개선)],
  text(weight: "bold", fill: practice-color.primary)[`/translate`], [코드 주석/문서를 다른 언어로 번역],
  text(weight: "bold", fill: practice-color.primary)[`/migrate`], [라이브러리 버전 업그레이드 가이드],
  text(weight: "bold", fill: practice-color.primary)[`/daily`], [일일 업무 보고서 자동 작성 (git log 기반)],
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. 정리 및 다음 단계
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#summary-box(title: "이번 실습 핵심 정리")[
  - **allowed-tools**로 스킬이 사용할 수 있는 도구를 제한하여 안전성을 높여요
  - 서로 다른 도메인의 스킬을 만들고, 파이프라인으로 조합할 수 있어요
  - 자동 매칭은 description의 구체성에 비례해요
  - **context fork*로 복잡한 스킬의 중간 과정을 숨기고 결과만 받을 수 있어요
  - 좋은 스킬 설계의 원칙: 하나의 스킬, 하나의 책임
]

#troubleshoot((
  (q: "allowed-tools를 설정했는데 Claude가 다른 도구도 사용해요", a: "프론트매터의 YAML 형식이 올바른지 확인하세요. 배열은 대괄호와 쌍따옴표를 사용해야 해요: `[\"Bash\", \"Read\"]`. 오타가 있으면 설정이 무시될 수 있어요."),
  (q: "리뷰 스킬이 코드를 수정하려고 해요", a: "allowed-tools에서 Write와 Edit를 제거했는지 확인하세요. 또한 스킬 본문에 '코드를 직접 수정하지 마세요'라는 규칙을 명시적으로 적어주세요."),
  (q: "스킬이 세 개인데 자동 매칭이 자꾸 헷갈려요", a: "각 스킬의 description이 서로 겹치지 않도록 작성하세요. 커밋은 '저장/커밋/git', 리뷰는 '점검/리뷰/품질', 조합은 '리뷰 후 커밋'처럼 키워드를 구분하세요."),
  (q: "review-and-commit 스킬이 리뷰만 하고 커밋은 안 해요", a: "스킬 본문의 분기 조건을 확인하세요. '문제가 있으면 중단'이라는 조건 때문에 매번 중단될 수 있어요. 경미한 문제는 경고만 하고 진행하도록 조건을 조정해보세요."),
  (q: "context fork가 잘 적용되는지 모르겠어요", a: "현재 Claude Code 버전에서는 스킬의 서브에이전트 실행이 자동으로 처리되는 경우가 많아요. 차이를 확인하려면 복잡한 분석(10개 이상 파일 리뷰)을 시키면서 중간 출력이 얼마나 보이는지 비교해보세요."),
))

#practice-checklist(
  (
    [커밋 스킬에 allowed-tools를 설정했다],
    [코드 리뷰 스킬을 새로 작성했다],
    [자연어 요청으로 올바른 스킬이 매칭되는지 테스트했다],
    [리뷰+커밋 조합 스킬을 만들어봤다],
  ),
  (
    [allowed-tools를 변경하면서 도구 제한 효과를 확인했다],
    [context fork 설정을 적용해봤다],
    [자기 업무에 맞는 스킬 아이디어를 2개 이상 구상했다],
  ),
)

#next-preview(
  session-type: "실습",
  session-num: 11,
  title: "AI에게 큰 작업 시키기",
  description: "스킬 하나로 해결할 수 없는 대규모 작업이 있어요. 멀티파일 수정, 자동 테스트, 실패 시 재시도, 에이전트 루프의 진짜 위력을 체험해볼 거예요.",
)