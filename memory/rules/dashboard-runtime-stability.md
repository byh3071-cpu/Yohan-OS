---
id: dashboard-runtime-stability
date: 2026-04-10
domain: dashboard
tags: [dashboard, runtime, node, debugging, prevention]
related: [dashboard-spec, dashboard-quick-actions, agent-harness]
status: active
---

# 대시보드 런타임 안정화 규칙

## 1. 목적

- 로컬 대시보드 실행 시 Node 프로세스 폭증, `tailwindcss resolve` 오류, 포트 충돌(`EADDRINUSE`) 재발 방지
- 장애 발생 시 3분 내 복구 가능한 표준 절차를 SoT로 고정

---

## 2. 표준 실행 원칙

- 기본 실행은 `dev`가 아니라 `start`를 우선한다 (워처/HMR 부하 최소화).
- `dev`는 UI 수정 등 개발이 필요한 경우에만 1개 프로세스로 실행한다.
- 루트에서 `npm run dev`를 치지 않는다. 대시보드는 `dashboard/` 또는 루트 스크립트(`dashboard:*`)만 사용한다.

### 표준 명령

- 개발 모드(필요 시): `npm run dashboard:dev:4000`
- 개발 모드(권장 단일 실행): `npm run dashboard:dev:safe` (4000 점유 PID 정리 + `--webpack` + `--max-old-space-size=3072`)
- 개발 모드(진단): `npm run dashboard:dev:diag` (`--trace-gc`, `--trace-gc-verbose`, `--heapsnapshot-near-heap-limit=2`, dump dir=`dashboard/.debug/heap`)
- 안정 모드(권장): `npm run dashboard:build` 후 `npm run dashboard:start:4000`
- 원클릭 실행(비-CLI): 바탕화면 `Yohan-Dashboard.bat` (좀비 정리 → 빌드 캐시 없으면 자동 빌드 → `start:4000` + 브라우저 자동 오픈)

---

## 3. 금지/주의

- `dev`를 여러 터미널에서 중복 실행 금지
- 포트 점유 확인 없이 재실행 금지
- `Get-NetTCPConnection` 실패 시 WMI 문제일 수 있으므로 `netstat -ano | findstr :4000`를 우선 사용

---

## 4. 장애 시그니처와 원인

- 시그니처 A: `Error: Can't resolve 'tailwindcss' in '<repo-root>'`
  - 원인: 모듈 해석 기준이 루트로 잡혀 `tailwindcss`를 루트에서 찾음
  - 조치: 루트/대시보드 의존성 정합 확인 + 캐시 정리 후 재기동

- 시그니처 B: `listen EADDRINUSE :::4000`
  - 원인: 기존 서버 프로세스가 이미 4000 점유
  - 조치: 점유 PID 종료 후 단일 프로세스 재실행

- 시그니처 C: 브라우저 무한 로딩 + Node 다수 생성
  - 원인: dev 워처/HMR 중복, 에러 루프 재컴파일
  - 조치: 전체 Node 종료 후 `start` 모드로 복구

---

## 5. 3분 복구 절차 (운영 표준)

1. Node 프로세스 정리
   - `taskkill /F /IM node.exe`
2. 캐시 정리
   - `Remove-Item -Recurse -Force "dashboard/.next"`
3. 대시보드 재기동(권장)
   - `npm run dashboard:build`
   - `npm run dashboard:start:4000`
4. 검증
   - 브라우저 `http://localhost:4000`
   - 필요 시 `Invoke-WebRequest http://localhost:4000/ -UseBasicParsing`

---

## 6. 디버깅 체크리스트

- 포트 확인: `netstat -ano | findstr :4000`
- 프로세스 개수: `tasklist /FI "IMAGENAME eq node.exe"`
- 서버 응답: `/` + `/api/docs` 상태코드 확인
- 같은 증상 2회 반복 시:
  - `dashboard` 의존성 재설치 (`npm --prefix dashboard install`)
  - 루트 스크립트로만 실행했는지 확인

---

## 7. 재발 방지 선언

- 대시보드 실행은 `dashboard:*:4000` 스크립트를 표준으로 사용한다.
- 장애 복구 후 반드시 이 문서 절차로 재실행한다.
- 동일 장애 재발 시, 임시 대응(`taskkill`)만 반복하지 말고 원인 로그를 세션에 남긴다.
