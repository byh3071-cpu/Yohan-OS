#!/usr/bin/env bash
# Yohan OS — Claude Code Stop hook
# 세션 종료 시 오늘 변경된 ADR·세션 로그·트러블슈팅을 노션에 자동 동기화한다.
#
# 등록(.claude/settings.json):
#   {
#     "hooks": {
#       "Stop": [
#         { "matcher": "*", "hooks": [{ "type": "command", "command": "bash .claude/hooks/post-session.sh" }] }
#       ]
#     }
#   }
#
# 실패해도 세션 종료를 막지 않는다(`exit 0` 보장).

set -u

# 레포 루트로 이동 (git이 없으면 그냥 종료)
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "${ROOT}" ]; then
  exit 0
fi
cd "${ROOT}" || exit 0

# 환경 변수 로드 (.env)
if [ -f ".env" ]; then
  # 따옴표·공백 안전하게 export
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

# NOTION_TOKEN이 없으면 조용히 종료 (노션 미설정 환경)
if [ -z "${NOTION_TOKEN:-}" ] || [ -z "${NOTION_KNOWLEDGE_HUB_DB_ID:-}" ] || [ -z "${NOTION_EXECUTION_LOG_DB_ID:-}" ]; then
  exit 0
fi

# 빠른 사전 점검: 마지막 커밋이 기록 디렉터리를 건드렸나?
# (sync 스크립트 자체도 git log를 보지만, 여기서 한 번 더 걸러 호출 자체를 줄인다.)
if ! git diff --name-only HEAD~1 -- docs/adr/ docs/troubleshooting/ memory/logs/sessions/ 2>/dev/null | grep -q .; then
  # 단일 커밋 레포(HEAD~1 부재)일 수도 있으므로 폴백: 오늘 커밋 전체
  if ! git log --since=midnight --name-only --pretty=format: 2>/dev/null \
      | grep -E '^(docs/adr/|docs/troubleshooting/|memory/logs/sessions/)' \
      | grep -q .; then
    exit 0
  fi
fi

# 비차단 실행: 스크립트 결과를 prefix와 함께 stdout으로
{
  npm run --silent sync:notion:records -- --since today 2>&1 || true
} | sed 's/^/[notion-sync] /'

exit 0
