// practice-08.typ — 실습 8차시: MCP: 외부 도구 연결

// ━━━ 표지 ━━━
,
  badge-color: practice-color.primary,
  title-color: practice-color.primary,
  accent-color: practice-color.accent,
  box-bg: practice-color.bg,
  box-border: practice-color.border,
)

// ━━━ 핵심 질문 ━━━
> ***핵심 질문****: Claude는 똑똑하지만 혼자서는 파일을 검색하거나 외부 데이터를 가져올 수 없어요. 어떻게 하면 Claude에게 "눈과 손"을 달아줄 수 있을까요?

// ━━━ 배경지식 ━━━
# 0. 오늘 만들 결과물

이번 실습이 끝나면 Claude가 파일시스템 MCP 서버를 통해 여러분 컴퓨터의 파일을 직접 검색하고 읽을 수 있게 돼요. 전에는 "이 파일 좀 읽어줘"라고 일일이 복사해 붙여야 했다면, 이제는 "프로젝트에서 TODO가 포함된 파일을 찾아줘"라고 말하면 Claude가 알아서 찾아요.

#summary-box(title: "배경지식: MCP란 무엇인가")[
  이론편에서 MCP(Model Context Protocol)를 배웠어요. MCP는 AI 모델이 외부 도구와 통신하기 위한 표준 프로토콜이에요. USB가 주변기기를 컴퓨터에 연결하는 표준이듯, MCP는 도구를 AI에 연결하는 표준이에요.

  MCP에는 세 가지 핵심 요소가 있어요.

  - **리소스(Resources)**: AI가 읽을 수 있는 데이터 (파일, DB 레코드 등)
  - **도구(Tools)**: AI가 실행할 수 있는 기능 (파일 검색, API 호출 등)
  - **프롬프트(Prompts)**: 미리 정의된 대화 템플릿

  오늘은 이 중에서 **도구**를 중심으로 실습해볼 거예요.
]

#prep-box((
  [Claude Code (지난 실습에서 설치 완료)],
  [Node.js 18 이상],
  [실습용 프로젝트 폴더 (지난 실습의 practice-todo-app 재활용 가능)],
))

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. settings.json에 MCP 서버 추가
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(1, "MCP 서버를 Claude Code에 등록해요")[
  MCP 서버를 Claude Code에 연결하려면 설정 파일에 서버 정보를 추가해야 해요. Claude Code의 설정 파일은 `~/.claude/settings.json`이에요.

  먼저 이 파일이 있는지 확인해보세요.

  ```
  cat ~/.claude/settings.json
  ```

  파일이 없거나 비어 있어도 괜찮아요. 지금부터 만들 거예요.
]

오늘 사용할 MCP 서버는 **파일시스템 MCP 서버**예요. Anthropic이 공식으로 제공하는 기본 MCP 서버 중 하나예요. 이 서버를 통해 Claude가 지정된 폴더의 파일을 읽고, 검색하고, 목록을 조회할 수 있어요.

Claude Code에서 MCP 서버를 추가하는 가장 쉬운 방법은 `claude mcp add` 명령어를 사용하는 거예요.

```
claude mcp add filesystem -s user, npx -y @modelcontextprotocol/server-filesystem ~/practice-todo-app
```

이 명령어를 분해해볼게요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[부분],
    text(fill: color.white, weight: "bold")[의미],
  ),
  text(weight: "bold", fill: practice-color.primary)[`claude mcp add`], [MCP 서버를 추가하는 명령어],
  text(weight: "bold", fill: practice-color.primary)[`filesystem`], [이 MCP 서버의 이름 (우리가 정하는 별칭)],
  text(weight: "bold", fill: practice-color.primary)[`-s user`], [사용자 전역 설정에 추가 (`-s project`로 하면 프로젝트별 설정)],
  text(weight: "bold", fill: practice-color.primary)[`--`], [뒤에 오는 것이 실제 서버 실행 명령어라는 표시],
  text(weight: "bold", fill: practice-color.primary)[`npx -y @model...`], [파일시스템 MCP 서버 패키지를 다운로드해서 실행],
  text(weight: "bold", fill: practice-color.primary)[`~/practice-todo-app`], [Claude가 접근할 수 있는 폴더 경로],
)

#screenshot[터미널에서 claude mcp add 명령어를 실행하는 화면]

명령어가 성공하면 `~/.claude/settings.json`에 서버 정보가 추가돼요. 확인해볼게요.

```
cat ~/.claude/settings.json
```

아래와 비슷한 내용이 보여야 해요.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/사용자이름/practice-todo-app"
      ]
    }
  }
}
```

> ****핵심****: MCP 서버 설정은 JSON 파일에 저장돼요. 서버 이름, 실행 명령어, 인자, 이 세 가지가 핵심이에요. 수동으로 JSON을 편집해도 되지만, `claude mcp add` 명령어가 훨씬 편해요.

## settings.json의 범위

settings.json도 CLAUDE.md처럼 두 가지 위치에 둘 수 있어요.

#table(
  columns: (auto, auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[위치],
    text(fill: color.white, weight: "bold")[범위],
    text(fill: color.white, weight: "bold")[플래그],
  ),
  text(weight: "bold", fill: practice-color.primary)[`~/.claude/settings.json`], [모든 프로젝트], [`-s user`],
  text(weight: "bold", fill: practice-color.primary)[프로젝트/.claude/settings.json], [해당 프로젝트], [`-s project`],
)

개인적으로 항상 사용하는 MCP 서버는 user 범위에, 특정 프로젝트에서만 쓰는 서버는 project 범위에 등록하면 돼요.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. 파일시스템 MCP 연결 확인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(2, "MCP 서버가 제대로 연결되었는지 확인해요")[
  이제 Claude Code를 실행해서 MCP 서버가 잘 연결되었는지 확인해볼게요.

  ```
  cd ~/practice-todo-app
  claude
  ```

  Claude Code가 시작되면서 MCP 서버에 연결을 시도해요. 시작 메시지에서 MCP 서버 목록이 표시되는지 확인하세요.
]

#screenshot[Claude Code 시작 화면에서 MCP 서버 연결 상태가 표시되는 화면]

MCP 서버가 잘 연결되면 Claude에게 도구 목록을 물어볼 수 있어요.

```
> 지금 사용할 수 있는 MCP 도구 목록을 보여줘
```

파일시스템 MCP 서버가 제공하는 도구들이 목록으로 나와요. 주요 도구는 아래와 같아요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[도구],
    text(fill: color.white, weight: "bold")[기능],
  ),
  text(weight: "bold", fill: practice-color.primary)[`read_file`], [지정한 파일의 내용을 읽어요],
  text(weight: "bold", fill: practice-color.primary)[`write_file`], [파일에 내용을 써요],
  text(weight: "bold", fill: practice-color.primary)[`list_directory`], [폴더 안의 파일 목록을 조회해요],
  text(weight: "bold", fill: practice-color.primary)[`search_files`], [파일 이름이나 내용으로 검색해요],
  text(weight: "bold", fill: practice-color.primary)[`get_file_info`], [파일 크기, 수정 시간 등 메타데이터를 조회해요],
)

간단한 테스트를 해볼게요. Claude에게 프로젝트 구조를 물어보세요.

```
> 이 프로젝트의 파일 구조를 보여줘
```

#screenshot[Claude가 MCP를 통해 파일 목록을 조회하고 결과를 보여주는 화면]

Claude가 `list_directory` 도구를 사용해서 파일 목록을 가져온 뒤, 트리 구조로 정리해서 보여줄 거예요.

> ****핵심****: Claude Code 자체도 파일을 읽을 수 있지만, MCP는 "어떤 도구를 어떤 범위에서 사용할 수 있는지"를 명확하게 정의하는 프로토콜이에요. 이 표준화가 핵심이에요.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. MCP로 파일 검색/읽기
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(3, "MCP 도구를 활용해서 실제 작업을 해봐요")[
  이제 MCP 도구를 사용해서 실제로 유용한 작업을 해볼 거예요. 먼저 프로젝트에 파일 몇 개를 더 만들어서 검색할 내용을 추가할게요.

  Claude Code에서 아래와 같이 요청하세요.

  ```
  > src/main.py에 TODO 주석을 3개 추가하고,
  > src/models.py에 Todo 클래스를 작성하고 TODO 주석을 2개 추가해줘
  ```
]

파일이 준비되면 MCP 검색 기능을 테스트해볼게요.

```
> 프로젝트 전체에서 TODO가 포함된 파일을 찾아줘
```

Claude가 `search_files` 도구를 사용해서 TODO가 포함된 모든 파일과 해당 줄을 찾아줄 거예요.

#screenshot[Claude가 MCP search_files로 TODO를 검색한 결과를 보여주는 화면]

더 복잡한 요청도 해볼게요.

```
> src 폴더에서 함수 정의를 모두 찾아서, 각 함수의 이름과 파라미터를 정리해줘
```

이번에는 Claude가 여러 도구를 조합해요. 먼저 `list_directory`로 src 폴더의 파일을 확인하고, 각 파일을 `read_file`로 읽은 뒤, 함수 정의를 추출해서 정리해요.

#try-it[
  아래 요청들을 순서대로 해보면서 Claude가 어떤 MCP 도구를 사용하는지 관찰해보세요.

  1. "README.md의 내용을 읽어줘", `read_file` 사용
  2. "tests 폴더에 어떤 파일이 있어?", `list_directory` 사용
  3. ".py 확장자 파일을 모두 찾아줘", `search_files` 사용
  4. "main.py의 파일 크기와 마지막 수정 시간을 알려줘", `get_file_info` 사용

  Claude가 도구를 호출할 때 어떤 도구를 선택하는지, 파라미터로 무엇을 넘기는지 주의 깊게 살펴보세요. 이것이 MCP의 작동 원리를 이해하는 핵심이에요.
]

## MCP 도구 호출 과정 이해하기

Claude가 MCP 도구를 사용하는 과정을 단계별로 살펴볼게요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[단계],
    text(fill: color.white, weight: "bold")[설명],
  ),
  text(weight: "bold", fill: practice-color.primary)[1. 요청 분석], [사용자의 자연어 요청을 분석해서 어떤 도구가 필요한지 판단해요],
  text(weight: "bold", fill: practice-color.primary)[2. 도구 선택], [사용 가능한 MCP 도구 중 적합한 것을 선택해요],
  text(weight: "bold", fill: practice-color.primary)[3. 파라미터 구성], [도구에 넘길 파라미터를 JSON으로 구성해요],
  text(weight: "bold", fill: practice-color.primary)[4. 도구 실행], [MCP 서버에 요청을 보내고 결과를 받아요],
  text(weight: "bold", fill: practice-color.primary)[5. 결과 해석], [도구의 반환값을 자연어로 정리해서 사용자에게 보여줘요],
)

이 과정이 자동으로 일어나기 때문에 사용자 입장에서는 그냥 "찾아줘"라고 말하면 되는 거예요. 하지만 이 과정을 이해하고 있으면 더 정확한 요청을 할 수 있어요.

> ****핵심****: MCP 도구를 효과적으로 사용하려면 "어떤 도구가 있는지"를 알고 있는 것이 중요해요. Claude에게 "사용 가능한 도구를 보여줘"라고 물어보면 현재 연결된 모든 도구를 확인할 수 있어요.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. MCP 도구 목록 확인 및 관리
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#practice-step(4, "등록된 MCP 서버를 관리하는 방법을 알아봐요")[
  MCP 서버를 추가했으면, 목록을 확인하고 필요 없는 서버를 제거하는 방법도 알아야 해요.

  Claude Code를 종료한 상태에서 아래 명령어를 실행해보세요.

  ```
  claude mcp list
  ```

  현재 등록된 모든 MCP 서버 목록이 표시돼요.
]

#screenshot[claude mcp list 명령어 결과로 등록된 서버 목록이 표시되는 화면]

MCP 서버 관리에 사용하는 명령어를 정리해볼게요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[명령어],
    text(fill: color.white, weight: "bold")[기능],
  ),
  text(weight: "bold", fill: practice-color.primary)[`claude mcp list`], [등록된 MCP 서버 목록 조회],
  text(weight: "bold", fill: practice-color.primary)[`claude mcp add <이름> ...`], [새 MCP 서버 추가],
  text(weight: "bold", fill: practice-color.primary)[`claude mcp remove <이름>`], [MCP 서버 제거],
)

#try-it[
  다른 MCP 서버도 추가해볼까요? 메모리 MCP 서버를 추가하면 Claude가 대화 간에 정보를 기억할 수 있어요.

  ```
  claude mcp add memory -s user, npx -y @modelcontextprotocol/server-memory
  ```

  추가 후 `claude mcp list`로 두 개의 서버가 등록되어 있는지 확인해보세요.

  Claude Code를 실행하고 아래처럼 테스트해보세요.

  ```
  > 내 이름은 김지은이고, 파이썬을 주로 사용해. 이걸 기억해줘
  ```

  새 세션에서 다시 시작하고 물어보세요.

  ```
  > 내 이름이 뭐였지?
  ```

  메모리 MCP가 잘 작동하면 이전 대화에서 저장한 정보를 기억하고 있을 거예요.
]

## MCP 생태계 탐색

파일시스템과 메모리 외에도 다양한 MCP 서버가 있어요. 커뮤니티에서 만든 서버도 많아요.

#table(
  columns: (auto, 1fr, auto),
  fill: (x, y) => if y == 0 { practice-color.primary } else if calc.rem(y, 2) == 1 { practice-color.bg } else { color.white },
  stroke: 0.5pt + practice-color.border,
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[서버],
    text(fill: color.white, weight: "bold")[기능],
    text(fill: color.white, weight: "bold")[제공],
  ),
  text(weight: "bold", fill: practice-color.primary)[filesystem], [파일 읽기/쓰기/검색], [공식],
  text(weight: "bold", fill: practice-color.primary)[memory], [영구 기억 저장], [공식],
  text(weight: "bold", fill: practice-color.primary)[brave-search], [웹 검색], [공식],
  text(weight: "bold", fill: practice-color.primary)[github], [GitHub 이슈/PR 관리], [공식],
  text(weight: "bold", fill: practice-color.primary)[postgres], [PostgreSQL DB 쿼리], [공식],
  text(weight: "bold", fill: practice-color.primary)[slack], [Slack 메시지 읽기/쓰기], [커뮤니티],
  text(weight: "bold", fill: practice-color.primary)[notion], [Notion 페이지 관리], [커뮤니티],
)

MCP 서버 목록은 https://github.com/modelcontextprotocol/servers에서 확인할 수 있어요. 필요한 도구가 있으면 같은 방식(`claude mcp add`)으로 추가하면 돼요.

> ****핵심****: MCP의 강력함은 "표준"에 있어요. 누구나 MCP 서버를 만들 수 있고, 같은 방식으로 Claude에 연결할 수 있어요. 마치 USB 포트에 어떤 기기든 꽂을 수 있는 것처럼요.

## MCP 보안 고려사항

MCP는 편리하지만 보안에 주의해야 해요. MCP 서버에 부여한 권한은 Claude가 자유롭게 사용할 수 있거든요.

#table(
  columns: (auto, 1fr),
  fill: (x, y) => if y == 0 { rgb("#dc2626") } else if calc.rem(y, 2) == 1 { rgb("#fef2f2") } else { color.white },
  stroke: 0.5pt + rgb("#fca5a5"),
  inset: 10pt,
  table.header(
    text(fill: color.white, weight: "bold")[주의 사항],
    text(fill: color.white, weight: "bold")[설명],
  ),
  text(weight: "bold", fill: rgb("#dc2626"))[경로 제한], [파일시스템 MCP에 `~` (홈 전체)를 주지 마세요. 필요한 폴더만 지정하세요],
  text(weight: "bold", fill: rgb("#dc2626"))[신뢰할 수 있는 서버만], [커뮤니티 MCP 서버는 소스 코드를 확인한 후 사용하세요],
  text(weight: "bold", fill: rgb("#dc2626"))[민감한 데이터], [API 키, 비밀번호가 있는 폴더를 MCP에 노출하지 마세요],
  text(weight: "bold", fill: rgb("#dc2626"))[쓰기 권한], [읽기만 필요한 경우 쓰기 권한을 제한하세요],
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. 정리 및 다음 단계
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#summary-box(title: "이번 실습 핵심 정리")[
  - **MCP*는 AI가 외부 도구와 통신하는 표준 프로토콜이에요
  - `claude mcp add` 명령어로 MCP 서버를 등록하고, `settings.json`에 저장돼요
  - 파일시스템 MCP를 통해 Claude가 파일을 읽고, 검색하고, 관리할 수 있어요
  - MCP 서버는 user(전역) 또는 project(프로젝트별) 범위로 설정할 수 있어요
  - 보안을 위해 최소 권한 원칙을 지키세요
]

#troubleshoot((
  (q: "claude mcp add 실행 시 에러가 나요", a: "Node.js 버전이 18 이상인지 확인하세요. `node --version`으로 확인할 수 있어요. 또한 npx가 설치되어 있는지 `npx --version`으로 확인하세요."),
  (q: "MCP 서버가 연결되었는데 도구를 사용하지 못해요", a: "Claude Code를 완전히 종료하고 다시 시작해보세요. MCP 설정 변경은 재시작 후 적용되는 경우가 있어요. `/mcp` 명령어로 현재 연결 상태를 확인할 수도 있어요."),
  (q: "파일시스템 MCP에서 permission denied 에러가 나요", a: "MCP 서버에 지정한 경로에 읽기 권한이 있는지 확인하세요. 심볼릭 링크나 네트워크 드라이브는 추가 설정이 필요할 수 있어요."),
  (q: "MCP 서버가 너무 많아서 Claude가 혼란스러워하는 것 같아요", a: "사용하지 않는 MCP 서버는 `claude mcp remove <이름>`으로 제거하세요. 도구가 너무 많으면 Claude가 적절한 도구를 선택하는 데 방해가 될 수 있어요."),
  (q: "settings.json을 직접 편집해도 되나요?", a: "네, JSON 형식만 올바르면 직접 편집해도 돼요. 하지만 JSON 문법 오류(쉼표 누락, 따옴표 불일치 등)가 있으면 Claude Code가 시작되지 않을 수 있으니 주의하세요."),
))

#practice-checklist(
  (
    [파일시스템 MCP 서버를 `claude mcp add`로 추가했다],
    [Claude Code에서 MCP 서버가 연결된 것을 확인했다],
    [MCP 도구로 파일을 검색하거나 읽어봤다],
    [`claude mcp list`로 등록된 서버 목록을 확인했다],
  ),
  (
    [메모리 MCP 서버를 추가로 설치해봤다],
    [MCP 도구 호출 과정(도구 선택 → 파라미터 → 실행 → 결과)을 관찰했다],
    [settings.json의 내용을 직접 열어서 구조를 확인했다],
  ),
)

#next-preview(
  session-type: "실습",
  session-num: 9,
  title: "Skills 기초: 나만의 전문가",
  description: "MCP가 Claude에게 도구를 연결해줬다면, Skills는 Claude에게 전문 지식을 주입해요. 나만의 스킬을 만들어서 Claude를 특정 분야의 전문가로 만들어볼 거예요.",
)