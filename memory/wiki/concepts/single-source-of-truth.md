---
id: single-source-of-truth
type: concept
aliases: [SSoT, SoT, Single Source of Truth, 단일 진실 소스]
created: 2026-04-12
updated: 2026-04-12
source_insights: [vibe-coding-pipeline, knowledge-base-strategy, vibe-coding-planning-importance]
related_entities: [cursor]
related_concepts: [harness-engineering, vibe-coding-pipeline, layered-context]
---

# Single Source of Truth (SSoT)

## 정의 (1~2문장)
- 모든 정보의 권위 있는 원본이 한 곳에만 존재하는 원칙. Yohan OS에서 memory/ 디렉터리가 에이전트와 사람 모두의 SoT 역할.

## Verified (소스 기반)
- SoT 디렉터리 구조화: 초기에는 Vector DB 대신 경량 MD 파일 트리 기반. [source: vibe-coding-pipeline]
- Yohan OS 구조: memory/rules/ (하네스·동기 규칙), docs/ (비전·부트스트랩), memory/inbox/ (노션 큐·임시 입력). [source: vibe-coding-pipeline]
- 모든 `.md` 상단에 YAML(tags, related, date 등) 기입 → 메타데이터로 관련 노트 탐색. [source: knowledge-base-strategy]
- Git 기반 버전 관리: 어제까지 진척 vs 오늘 변경점 명확 구분 → 낡은 정보 매몰 방지. [source: knowledge-base-strategy]
- 같은 SoT로 반복 호출해도 결과가 흔들리지 않게 하려면, 입력·출력·예외·비범위를 한 장에 적어둬야 함. [source: vibe-coding-planning-importance]
- 짧은 기획도 memory/·@ 참조에 넣으면 맥락 주입 비용이 줄고, Evaluator·리뷰 기준으로도 활용 가능. [source: vibe-coding-planning-importance]

## Inferred (추론/연결) — TTL 30일
- wiki/ 레이어는 SoT의 확장 — insights가 원본 SoT, wiki가 합성 SoT, 둘의 관계가 명확히 분리되어야 SoT 원칙이 유지됨.
- created: 2026-04-12, expires: 2026-05-12

## Owner Notes
- (Yohan이 직접 작성)

## 관련 소스
- [vibe-coding-pipeline](../../ingest/insights/vibe-coding-pipeline.md)
- [knowledge-base-strategy](../../ingest/insights/knowledge-base-strategy.md)
- [vibe-coding-planning-importance](../../ingest/insights/vibe-coding-planning-importance.md)