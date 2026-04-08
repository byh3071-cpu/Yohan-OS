---

id: supabase-naver-oidc-proxy-github-why-how
date: 2026-04-08
domain: devtools
tags: [github, supabase, oauth, naver, oidc]
related: [knowledge-base-strategy]
status: draft

# archive_tier: standard   # 선택: light | standard | long_term — `archiving-appraisal-feynman.md`

---

# supabase-naver-oidc-proxy — 왜 쓰는지 · 어떻게 쓰는지

## 원본·긴 문서

- **GitHub:** [sapsaldog/supabase-naver-oidc-proxy](https://github.com/sapsaldog/supabase-naver-oidc-proxy)
- **README 인제스트:** `memory/ingest/url/url-3d22403c3d5a828b.md` — Naver 앱 설정·Supabase Custom Provider 필드·트러블슈팅 상세는 여기 기준으로 본다.

## 한 줄로 하는 일

- Supabase Auth가 기대하는 OIDC `userinfo` 형식과 Naver 응답 포맷 차이를, Supabase Edge Function 프록시로 중간 변환해 로그인 실패를 줄이는 레포다.

## 파인만 3단

### 쉬운 설명

- Supabase는 표준 OIDC 모양의 사용자 정보를 기대하는데, Naver는 응답을 `response` 안에 감싸서 준다. 이 레포는 그 포장을 벗겨 Supabase가 이해하는 형태로 다시 전달한다.

### 실생활(또는 내 일) 예시

- **내 일:** 한국 사용자 로그인에서 Naver를 붙여야 하는데 Supabase Custom Provider가 바로 동작하지 않을 때, 백엔드 전체를 갈아엎기보다 Edge Function 하나로 우회해 인증 플로우를 맞출 수 있다.

### 궁금한 점

- 배포 환경에서 `--no-verify-jwt`를 쓰는 구성과 스코프(`profile`만) 제약이 보안·운영 정책과 어떻게 충돌하지 않는지, 실제 서비스 기준 점검 항목을 따로 정리할 필요가 있다.

## 왜 쓰는지

- **상황 1:** Supabase + Naver OAuth를 연결했는데 `Error getting user email from external provider` 같은 오류가 날 때.
- **상황 2:** Naver OIDC 자동 디스커버리 대신 수동 설정으로 정확히 제어하고 싶을 때.
- **상황 3:** 기존 Supabase Auth 흐름을 유지한 채 Userinfo 단계만 보정하고 싶을 때.
- **안 맞을 때:** Naver 로그인이 필요 없거나, 이미 다른 인증 브로커에서 표준 OIDC 변환을 해결했다면 과하다.

## 실무에서 어떻게 쓰이는지

- **들어가는 것:** Supabase 프로젝트, Naver Developers 앱(Client ID/Secret), Supabase CLI.
- **하는 행동:** 함수 배포(`naver-userinfo`) → Supabase Custom Provider 수동 필드 입력 → 클라이언트에서 `custom:naver` 로그인 호출.
- **나오는 것:** Supabase Auth가 읽을 수 있는 표준화된 userinfo 응답과 로그인 성공 경로.
- **버전:** 인제스트 `ingested_at` 2026-04-06 기준 README 요약본이라, 설정 화면 문구·SDK 타입 지원 상태는 최신 문서 대조가 필요하다.

## 트레이드오프·전제

- 스코프를 `openid`로 두면 프록시가 우회되어 의도와 다르게 동작할 수 있고, 설정을 수동으로 정확히 유지해야 하는 운영 부담이 있다.

## Yohan OS 안 위치

- **인제스트:** `url-3d22403c3d5a828b.md` — 원문 스냅샷.
- **이 파일:** 적용 판단 카드. 실제 채택 확정은 별도 decision 로그에서 관리.

## 다음 액션 (검증용)

- Supabase 테스트 프로젝트에서 Naver 로그인 1회만 끝까지 돌려 보고, 에러 로그·함수 호출 유무·email 매핑 성공 여부를 체크리스트로 남긴다.