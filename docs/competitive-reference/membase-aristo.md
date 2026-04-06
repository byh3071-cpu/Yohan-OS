---

## title: "Membase / Aristo Technologies — 경쟁사 레퍼런스"

collected_at: "2026-04-06"
source:

- [https://aristo.so](https://aristo.so)
- [https://membase.so](https://membase.so)
tags: [competitive-reference, universal-memory, mcp, knowledge-graph]

## 회사 개요

- 회사명: Aristo Technologies
- 제품명: Membase (membase.so)
- 포지셔닝: "AI 에이전트를 위한 개인 메모리 레이어"
- 현황: Private Beta 운영 중, 무료 시작 가능

## 핵심 기능

1. Knowledge Graph — 메모리를 자동으로 구조화·연결
2. 외부 앱 컨텍스트 수집 — Gmail, Slack, Notion, Google Drive, GitHub 등
3. MCP로 모든 에이전트에 컨텍스트 공급 — ChatGPT, Claude, Cursor, Gemini 등
4. 대시보드 — 메모리 시각화 및 직접 관리
5. 프라이버시 — 엔드투엔드 암호화, 모델 학습 미사용, 데이터 소유권 보장

## Yohan OS와 차이점


| 항목     | Membase              | Yohan OS            |
| ------ | -------------------- | ------------------- |
| 데이터 위치 | 클라우드 (암호화)           | 로컬 파일 SoT           |
| 데이터 소유 | 서비스 종속 가능성           | 완전 로컬 소유            |
| 인풋 수집  | 앱 자동 연동              | 텔레그램 봇 + RSS + URL  |
| 메모리 구조 | Knowledge Graph (자동) | 파일 MD + 키워드 검색 (수동) |
| 타겟     | B2C 일반 유저            | 개인 병목 해결 → 조직 확장    |


## Yohan OS 설계 시 참고할 점

1. Knowledge Graph 개념
  → 향후 온톨로지/벡터 레이어 설계 시 "개념 간 관계 자동 연결" 패턴 참고
2. 외부 앱 통합 패턴 (Gmail, Slack, Notion)
  → 인제스트 어댑터 확장 시 우선순위 참고
3. "5분 안에 세컨드 브레인" UX 목표
  → Yohan OS 장기 UX 방향: 설정 복잡도 최소화
4. 대시보드 메모리 시각화
  → memory/ SoT에 데이터 쌓인 후 UI 레이어 설계 시 참고

## 관련 경쟁사 (추후 문서화)

- Supermemory (supermemory.ai)
- Mem0 (mem0.ai)
- OpenMemory (mem0.ai/openmemory)

---