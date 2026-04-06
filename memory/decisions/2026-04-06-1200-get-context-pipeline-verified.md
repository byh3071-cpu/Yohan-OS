---
title: get_context 및 append_decision 파이프 검증
created: '2026-04-06T12:00:00.000Z'
source: manual.seed
---

선택 사항으로 첫 결정 로그를 남김. MCP `get_context`가 워크스페이스 `memory`와 일치함을 확인한 뒤, `recent_decisions`에 항목이 쌓이는지 검증하기 위함.

- **다음 확인**: Cursor에서 `get_context` 재호출 시 본 파일이 `recent_decisions`에 포함되는지 볼 것.
