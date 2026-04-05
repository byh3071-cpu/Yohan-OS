# 구현 킥오프 — 확정 사항 (v0)

## 1. 스택


| 항목     | 선택                                      |
| ------ | --------------------------------------- |
| 런타임    | **Node.js 20+**                         |
| 언어     | **TypeScript**                          |
| MCP    | `**@modelcontextprotocol/sdk`** (stdio) |
| SoT 파일 | **YAML** (`yaml` 패키지)                   |
| 도구 스키마 | **Zod 4** (`zod/v4`)                    |


이유: Cursor·클로드 MCP 생태계와 호환, 단일 레포에서 빌드·배포 단순.

## 2. v0 범위

- **저장소 레이아웃**: 레포 루트 아래 `memory/` = 에이전트가 읽는 SoT 루트.
- **파일**: `memory/profile.yaml`, `memory/active-project.yaml`, `memory/decisions/*.md`
- **MCP 도구**:
  - `get_context` — 위 내용을 하나의 JSON으로 반환 (최근 결정 N개 포함)
  - `append_decision` — 결정 로그 md 파일 추가 (P/G/E 통과 후 쓰기 용도로 확장 가능)

인제스천·벡터·노션 동기는 **다음 마일스톤**.

## 3. 저장 위치 (진실의 원천 경로)

- **기본**: MCP 프로세스의 `**cwd` = 이 레포 루트** (`Yohan OS`).
- SoT 디렉터리 = `{루트}/memory/`
- **오버라이드**: 환경 변수 `**YOHAN_OS_ROOT`** = 절대 경로로 레포 루트를 지정하면, `memory`는 `{YOHAN_OS_ROOT}/memory/`

Cursor MCP 설정 시 `**cwd`를 이 레포로 두는 것**이 가장 단순하다.