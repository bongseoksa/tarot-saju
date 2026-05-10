# Sprint 3: 폴리싱 + 인프라

> [← 진행 관리](../PROGRESS.md)

---

## Task 3-1: 광고 연동 (AdSense)

**상태**: TODO
**의존**: Task 2-2
**담당**: FE

**작업 내용:**

1. Google AdSense 계정 설정 + 사이트 승인
2. `index.html`에 AdSense 스크립트 삽입
3. 전면 광고 (Interstitial) 구현
   - 결과 보기 클릭 → 로딩 화면 → 광고 로드(5초 타임아웃) → 성공: 광고 시청 / 실패: 조용히 스킵
   - `useAdGate` 훅 수정 (현재 stub 상태)
4. 결과 화면 하단 배너 광고 1개

**검증:**
- [ ] 광고 로드 성공 → 광고 표시 → 닫기 → 결과 페이지 이동
- [ ] 광고 로드 실패 → 5초 후 자동 스킵 → 결과 페이지 이동
- [ ] GA4 `ad_failed` 이벤트 발생 확인

---

## Task 3-2: 카드 선택 애니메이션 폴리싱

**상태**: PARTIAL (기본 구현 존재)
**의존**: Task 1-FE-1
**담당**: FE

**현재 상태:**
- Framer Motion 의존성 설치됨
- `motionConfig.ts` 존재
- 기본 애니메이션 구현됨

**작업 내용:**

03-frontend-spec.md의 4단계 카드 선택 경험과 현재 구현 비교:

1. **1단계 (기대감)**: 호버/터치 시 카드 살짝 떠오름 + 빛남
2. **2단계 (몰입)**: 터치 → 뒤집기 + 주변 어두워짐 + 스케일 펄스
3. **3단계 (설렘)**: 앞면 글로우 + 카드명 페이드인 + 역방향 보라 글로우
4. **4단계 (완성감)**: 슬롯으로 스프링 이동 + 바운스 + 라벨 활성화

각 단계별 현재 구현 상태 확인 → 미비 사항 보완

**검증:**
- [ ] chrome-devtools로 카드 선택 → 4단계 애니메이션 동작 확인
- [ ] 모바일 뷰포트에서 햅틱/시각 피드백 확인
- [ ] 3장 선택 완료까지 매끄러운 흐름

---

## Task 3-3: 반응형 레이아웃 최종 검증

**상태**: TODO
**의존**: Task 2-2
**담당**: FE

**작업 내용:**

chrome-devtools MCP로 4개 브레이크포인트 검증:

| 뷰포트 | 디바이스 | 브레이크포인트 | 확인 |
|---|---|---|---|
| 360x640 | Galaxy S8 | sm (360px+) | 최소 너비, 1열 중심 |
| 390x844 | iPhone 14 | sm (360px+) | 기준 디바이스 |
| 768x1024 | iPad | md (768px+) | 2영역 분할 |
| 1024x768 | iPad 가로 | lg (1024px+) | 결과 본문+요약 패널, 필터+콘텐츠 |
| 1280x800 | Desktop | xl (1280px+) | 중앙 max-width, 좌우 보조 패널 |

각 뷰포트에서 모든 페이지 (홈/카드 뽑기/결과/히스토리) 스크린샷 캡처 + 문제 수정

**검증:**
- [ ] 5개 뷰포트 x 4개 페이지 = 20개 스크린샷 확인
- [ ] 터치 타깃 44x44px 이상
- [ ] 텍스트 대비 4.5:1 이상

---

## Task 3-4: Vercel 배포 + Cloudflare Tunnel

**상태**: TODO
**의존**: Task 2-2
**담당**: Infra

**작업 내용:**

### Vercel 배포

1. Vercel에 GitHub 리포지토리 연결
2. 빌드 설정:
   - Framework: Vite
   - Root Directory: `apps/web`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
3. 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GTM_ID=GTM-549LQWSC`
   - `VITE_SENTRY_DSN` (Task 3-6 후)
   - `VITE_ADSENSE_CLIENT_ID`
4. 배포 확인: `https://jeomhana.vercel.app`

### Cloudflare Tunnel

1. cloudflared 설치
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. 터널 생성
   ```bash
   cloudflared tunnel create ollama-tunnel
   cloudflared tunnel route dns ollama-tunnel <subdomain>.cfargotunnel.com
   ```

3. config 설정 (`~/.cloudflared/config.yml`)
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: ~/.cloudflared/<tunnel-id>.json
   ingress:
     - hostname: <subdomain>.cfargotunnel.com
       service: http://localhost:11434
     - service: http_status:404
   ```

4. Supabase Secret 설정
   ```bash
   supabase secrets set OLLAMA_URL=https://<subdomain>.cfargotunnel.com
   ```

### launchd 자동 실행

1. Ollama 자동 시작 plist (`~/Library/LaunchAgents/com.ollama.serve.plist`)
2. Cloudflare Tunnel 자동 시작 plist (`~/Library/LaunchAgents/com.cloudflare.tunnel.plist`)
3. 헬스체크 스크립트 (5분 간격, 3회 실패 시 텔레그램 알림)

**검증:**
- [ ] `https://jeomhana.vercel.app` 접속 → 홈 화면 표시
- [ ] Vercel → Supabase Edge Function → Cloudflare Tunnel → 로컬 Ollama → 해석 결과 수신
- [ ] PC 재시작 후 Ollama + Tunnel 자동 실행 확인

---

## Task 3-5: GA4 이벤트 트래킹

**상태**: TODO
**의존**: Task 3-4
**담당**: Infra

**완료된 사항:**
- GTM 컨테이너 ID 확보: `GTM-549LQWSC`
- `index.html`에 GTM 스니펫 삽입 완료 (`<head>` 스크립트 + `<body>` noscript)
- `.env.example`에 `VITE_GTM_ID=GTM-549LQWSC` 설정 완료

**작업 내용:**

1. GA4 속성 생성 → GTM에 GA4 태그 추가
2. GTM에서 SPA History Change 트리거 설정
3. 이벤트 구현 (`dataLayer.push`):

| 이벤트 | 트리거 | 파라미터 |
|---|---|---|
| `page_view` | SPA 라우팅 변경 (History Change) | 자동 |
| `select_theme` | 테마 카드 클릭 | themeId, category |
| `cards_selected` | 3장 선택 완료 | themeId, cardIds |
| `ad_impression` | 광고 노출 | ad_type |
| `ad_completed` | 광고 시청 완료 | ad_type |
| `ad_failed` | 광고 로드 실패 | error_type |
| `view_result` | 결과 페이지 도달 | themeId |
| `ai_stream_start` | SSE 스트리밍 시작 | themeId |
| `ai_stream_complete` | SSE 완료 | themeId, duration_ms |
| `ai_stream_error` | SSE 에러 | themeId, error |
| `share_result` | 공유 클릭 | method (clipboard) |
| `return_user` | 재방문 감지 | sessionCount |

4. Vercel 환경 변수에 `VITE_GTM_ID` 추가

**검증:**
- [ ] GTM 미리보기 모드에서 이벤트 발화 확인
- [ ] GA4 실시간 리포트에서 이벤트 수신 확인
- [ ] 퍼널 (홈→테마→카드→광고→결과→공유) 전환율 추적 가능

---

## Task 3-6: Sentry 에러 트래킹

**상태**: TODO
**의존**: Task 2-2 (FE+BE 연결 후)
**담당**: Infra + FE + BE

**목표:** API 오류, JS 예외, AI 타임아웃 등 운영 에러를 추적하고 알림 받는 체계 구축. GTM/GA4는 사용자 행동 분석, Sentry는 에러/장애 추적으로 역할 분담.

**작업 내용:**

### 1. Sentry 프로젝트 생성

- sentry.io 계정 생성 (무료 티어: 5K 에러/월)
- React 프로젝트 생성 → DSN 획득
- `.env.local`에 `VITE_SENTRY_DSN` 설정

### 2. 프론트엔드 Sentry 설정

```bash
cd apps/web && pnpm add @sentry/react @sentry/vite-plugin
```

- `src/main.tsx`에서 `Sentry.init()` 호출
- App 최상위에 `Sentry.ErrorBoundary` 래핑
- `vite.config.ts`에 `@sentry/vite-plugin` 추가 (소스맵 업로드)
- SSE 스트리밍 에러는 `Sentry.captureException()`으로 수동 캡처

**프론트엔드 추적 대상:**

| 항목 | 심각도 | 수집 방식 |
|---|---|---|
| 미처리 예외 (unhandled rejection) | error | 자동 (SDK) |
| SSE 스트리밍 실패/타임아웃 | error | 수동 (`captureException`) |
| localStorage 암호화/복호화 실패 | warning | 수동 (`captureException`) |
| 네트워크 오프라인 API 호출 | warning | 수동 (`captureException`) |

### 3. Edge Function Sentry 설정

- `supabase secrets set SENTRY_DSN=<dsn>`
- interpret 함수에 try/catch + `Sentry.captureException()`
- Ollama 연결 실패와 타임아웃을 구분하여 태그 부착

**Edge Function 추적 대상:**

| 항목 | 심각도 | 설명 |
|---|---|---|
| Ollama 연결 실패 (PC 다운) | critical | 텔레그램 알림 연동 |
| Ollama 응답 타임아웃 (150초 초과) | error | 느린 응답 vs 완전 실패 구분 |
| 프롬프트 조합 실패 (잘못된 입력) | error | 400 응답 원인 추적 |

### 4. 알림 설정

- Sentry → 텔레그램 봇 웹훅 (기존 Ollama health check 알림 채널과 통합)
- critical 이벤트: 즉시 알림
- error 이벤트: 1시간 내 동일 에러 5건 이상 시 알림

### 5. Phase 2 추가 예정

| 항목 | 심각도 |
|---|---|
| 결제 검증 실패 | critical |
| 구독 상태 불일치 | error |

**검증:**
- [ ] 프론트엔드: 의도적 에러 throw → Sentry 대시보드에 이벤트 수신
- [ ] 프론트엔드: 소스맵으로 원본 코드 위치 표시 확인
- [ ] Edge Function: Ollama 중지 상태에서 호출 → Sentry에 critical 이벤트 수신
- [ ] 텔레그램 알림 수신 확인

---

## Task 3-7: test:ai:full 실행

**상태**: TODO
**의존**: Task 2-1, Task 1-AI-4
**담당**: AI

**작업 내용:**

1. `pnpm test:ai:full` 실행 (813회, ~7시간, 백그라운드)
2. 결과 분석
   - 전체 통과율 확인 (목표: 95% 이상)
   - 카테고리별 통과율 분석
   - 실패 패턴 분류
3. 실패 케이스 기반 프롬프트 최종 튜닝
4. 재테스트 (실패 카테고리만)

**검증:**
- [ ] 전체 통과율 95% 이상
- [ ] 즉시 탈락 케이스 0건
- [ ] 3회 반복 일관성 검증 통과
