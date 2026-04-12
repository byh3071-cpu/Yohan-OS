---

## id: vibe-coding-planning-importance

date: 2026-04-08
domain: ai-engineering
tags: [vibe-coding, planning, product, context-engineering]
related: [vibe-coding-pipeline, single-source-of-truth]
status: insight

# 바이브 코딩에서 기획의 중요성

- 자연어로 빠르게 돌리는 만큼, **무엇을 만들지·완료 조건이 무엇인지**가 문서에 없으면 AI가 구멍을 임의로 메워 속도만 빨라진다.
- **입력·출력·예외·비범위**를 한 장에 적어 두면, 같은 SoT로 반복 호출해도 결과가 흔들리지 않는다.
- 바이브 코딩은 **실험 루프**에 강하지만, **우선순위와 트레이드오프**는 사람이 기획으로 고정해야 나중에 되돌리기 비용이 줄어든다.
- 짧은 기획(한 페이지)도 `memory/`·`@` 참조에 넣으면 **맥락 주입 비용**이 줄고, Evaluator·리뷰 기준으로도 쓸 수 있다.