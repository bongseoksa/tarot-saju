# 인프라 스펙

---

## 1. 배포 구성

### 프론트엔드: Vercel

- **선정 이유**
  - 정적 SPA 호스팅에 최적: Vite 빌드 결과물 배포에 간단
  - 글로벌 CDN: 빠른 로딩 속도
  - GitHub 연동: push시 자동 배포
  - 무료 티어: MVP 검증에 충분

### 도메인

- MVP 도메인: `jeomhana.vercel.app` (Vercel 기본 도메인)
- 커스텀 도메인은 MVP 검증 후 검토
- DB/Auth/Functions: Supabase (기본 도메인 유지)

### 운영 비용

- **MVP 운영 비용: 0원** (모든 스택 무료 티어 또는 로컬 활용)

---

## 2. AI 서빙

### 모델: Gemma on Ollama

- 온디맨드 경량 모델 (Gemma 등) — 로컬 PC에서 Ollama로 서빙
- AI 역할은 **해석 문장 생성 한 가지**로 한정
  - 카드 뽑기: 클라이언트에서 랜덤 선택 (AI 불필요)
  - 카드 의미/스프레드 규칙: 정적 데이터로 DB/JSON 관리 (AI 불필요)
  - 해석 문장 생성: 정적 데이터 + 사용자 질문을 프롬프트로 전달 → 문장 생성 (AI 역할)
- 모델 크기보다 **프롬프트 설계가 핵심** (프롬프트 품질 = 서비스 품질)
- 비용: 0원 (PC 전기세만)
- 응답 속도는 백로그로 관리, 동작 우선

### 로컬 PC 서빙 방식 + Cloudflare Tunnel

- 본인 PC에서 Gemma 모델 실행 (Ollama)
- Cloudflare Tunnel로 외부에서 접근 가능하도록 노출
- Cloudflare Tunnel: Edge Function에서만 접근, 클라이언트 직접 접근 불가
- `OLLAMA_URL`은 Supabase Secret (백엔드 전용) — 프론트엔드 노출 원천 차단

### PC 사양별 가이드

| VRAM | 가능한 모델 | 예상 응답 속도 |
|---|---|---|
| 없음 (CPU only) | Gemma 2B (양자화) | 30초~1분+ |
| 4~6GB | Gemma 2B | 5~15초 |
| 8GB+ | Gemma 7B | 5~10초 |
| 16GB+ | Gemma 7B (고품질) | 3~5초 |

### Edge Function 스트리밍 중계 구조

- Edge Function이 프롬프트 조합 + Ollama 호출 + SSE 스트리밍 중계를 모두 담당
- Edge Function 스트리밍 타임아웃: 150초 (AI 생성 5~30초 충분 커버)
- MVP Edge Functions: **interpret** 1개 (프롬프트 조합 + Ollama 호출 + SSE 스트리밍 중계)

### 안정성 대책 (G-2)

- **자동 실행**: macOS `launchd` plist — 로그인 시 Ollama + Cloudflare Tunnel 자동 시작
- **Health check**: cron 스크립트 5분 간격 (`curl` Ollama `/api/tags`), 실패 시 자동 재시작 시도
- **다운 알림**: 텔레그램 봇 (무료, 즉시 수신), 3회 연속 실패 시 발송
- **PC 절전 방지**: macOS 에너지 설정에서 잠자기 비활성화 (수동 설정)

### 리스크

- PC 꺼지면 AI 서비스 중단 (MVP 100명 테스트에는 감당 가능)
- 동시 요청 1~2명이 한계 (대기열 관리는 P1 백로그)
- 한국어 타로 해석 품질은 프롬프트 튜닝으로 검증 필요

### 확장 계획

- 서비스 성장시 서버리스 GPU (Replicate, Modal, RunPod 등)로 이전
- 응답 속도 최적화: 모델 양자화, GPU 활용, 배치 처리

---

## 3. 모바일 래퍼: Capacitor

### 선정 이유

- **웹 코드 재사용**: React + Vite SPA를 그대로 네이티브 앱으로 패키징
- **네이티브 브릿지**: 푸시 알림, 인앱 결제 등 네이티브 API 접근 가능
- **단일 코드베이스**: 웹/Android/iOS 모두 동일 코드로 빌드
- **Cordova 플러그인 호환**: 기존 플러그인 생태계 활용 가능

### 검토했지만 제외한 대안

- **PWA 단독**: 인앱 결제 불가, 앱스토어 배포 불가
- **Tauri Mobile**: 아직 실험적 단계
- **React Native**: 웹앱 래핑이 아닌 네이티브 UI 프레임워크로 목적 불일치

---

## 4. 트래킹: GTM + GA4

### 선정 이유

- **GTM (Google Tag Manager)**: 코드 배포 없이 태그(GA, 광고 픽셀 등)를 관리. 이벤트 추가/수정 시 개발자 개입 불필요
- **GA4 (Google Analytics 4)**: 이벤트 기반 분석으로 사용자 행동 퍼널 추적에 적합. 무료

### 추적 대상

| 구분 | 이벤트 | 목적 |
|---|---|---|
| 페이지 뷰 | page_view (자동) | 트래픽/유입 경로 분석 |
| 테마 선택 | select_theme (themeId, category) | 인기 테마/카테고리 파악 |
| 카드 뽑기 완료 | cards_selected (themeId, cardIds) | 뽑기 완료율 측정 |
| 광고 시청 | ad_impression, ad_completed, ad_failed | 광고 수익 + 이탈 분석 |
| 결과 도달 | view_result (themeId) | 전체 퍼널 전환율 |
| AI 스트리밍 | ai_stream_start, ai_stream_complete, ai_stream_error | AI 안정성 모니터링 |
| 공유 | share_result (method) | 바이럴 효과 측정 |
| 재방문 | return_user (sessionCount) | 리텐션 추적 |

### 핵심 퍼널

```
홈 진입 → 테마 선택 → 카드 뽑기 완료 → 광고 시청 → 결과 도달 → 공유
```

각 단계별 전환율을 GA4 Funnel Exploration으로 분석. 이탈 지점 파악이 MVP 개선의 핵심 데이터.

### 구현 방식

- GTM 컨테이너 ID: `GTM-549LQWSC`
- GTM 스니펫은 `apps/web/index.html`에 직접 삽입 (환경 변수 치환 아닌 하드코딩)
  - `<head>`: GTM 스크립트 (`gtm.js` 로드)
  - `<body>` 최상단: GTM noscript fallback (`<noscript><iframe>`)
- 앱 내 이벤트는 `dataLayer.push()`로 GTM에 전달
- GTM에서 GA4 태그로 라우팅
- SPA 라우팅 변경 시 History Change 트리거로 page_view 자동 추적

### 검토했지만 제외한 대안

- **Mixpanel/Amplitude**: 무료 티어 제한, MVP 단계에서 GA4로 충분
- **Plausible/Umami**: 프라이버시 중심이나 이벤트 퍼널 분석 기능 부족
- **Firebase Analytics**: Capacitor 앱 전환 시 도입 검토 (앱 + 웹 통합 분석)

### 확장 계획

- Capacitor 앱 출시 시 Firebase Analytics 병행 검토 (앱 내 이벤트 + 크래시 리포트)
- 광고 최적화를 위한 Google Ads 전환 추적 태그 GTM에 추가

---

## 5. 에러 트래킹: Sentry

### 선정 이유

GTM/GA4는 사용자 행동 분석용이며, API 오류·결제 실패·JS 예외 등 운영 에러 추적에는 부적합하다. Sentry를 에러 트래킹 전용으로 도입한다.

- **SaaS 무료 티어**: 5K 에러/월 — MVP 100명 규모에 충분
- **React SDK 내장**: ErrorBoundary, 소스맵, Session Replay
- **Deno 지원**: `@sentry/deno`로 Edge Function 에러 수집
- **알림 연동**: 텔레그램/Slack 웹훅으로 즉시 알림

### 검토했지만 제외한 대안

- **SigNoz**: OpenTelemetry 기반 풀 옵저버빌리티 플랫폼. 셀프호스팅 필요 (Docker 4~5개 컨테이너, ClickHouse). Ollama와 동일 PC에서 실행 시 RAM/CPU 경합. MVP 규모에서 과도
- **BetterStack (Logtail)**: 로그 검색 강력하나 에러 컨텍스트(스택트레이스, 소스맵) 약함
- **자체 DB 로깅**: 대시보드/알림을 직접 구축해야 함. MVP에서 비효율

### 역할 분담

| 도구 | 역할 | 추적 대상 |
|---|---|---|
| GTM + GA4 | 사용자 행동 분석 | 퍼널 전환율, 테마 인기도, 리텐션 |
| Sentry | 에러/장애 추적 | JS 예외, API 실패, AI 타임아웃, 결제 오류 |
| Supabase 내장 로그 | Edge Function 실행 로그 | 보조 디버깅 (보존 기간 짧음) |

### 추적 대상

#### 클라이언트 (프론트엔드)

| 항목 | 심각도 | 설명 |
|---|---|---|
| 미처리 예외 (unhandled rejection) | error | `@sentry/react` 자동 수집 |
| SSE 스트리밍 실패/타임아웃 | error | AI 해석 요청 실패 시 수동 캡처 |
| localStorage 암호화/복호화 실패 | warning | 데이터 손상 감지 |
| 네트워크 오프라인 API 호출 | warning | 오프라인 상태에서 요청 시도 |

#### Edge Function (백엔드)

| 항목 | 심각도 | 설명 |
|---|---|---|
| Ollama 연결 실패 (PC 다운) | critical | 텔레그램 알림 연동 |
| Ollama 응답 타임아웃 (150초 초과) | error | 느린 응답 vs 완전 실패 구분 |
| 프롬프트 조합 실패 (잘못된 입력) | error | 400 응답 원인 추적 |

#### Phase 2 (결제)

| 항목 | 심각도 | 설명 |
|---|---|---|
| 결제 검증 실패 | critical | 결제 시도 → 검증 실패 원인 |
| 구독 상태 불일치 | error | 결제 완료인데 구독 미반영 |

### 구현 방식

#### 프론트엔드

- `@sentry/react` 설치
- App 최상위에 `Sentry.ErrorBoundary` 래핑
- Vite 빌드 시 소스맵 업로드 (`@sentry/vite-plugin`)
- SSE 스트리밍 에러는 `Sentry.captureException()`으로 수동 캡처
- 환경 변수: `VITE_SENTRY_DSN`

#### Edge Function

- `@sentry/deno` 설치
- interpret 함수에 try/catch + `Sentry.captureException()`
- Ollama 연결 실패와 타임아웃을 구분하여 태그 부착
- 환경 변수: `SENTRY_DSN` (Supabase Secret)

#### 알림

- Sentry → 텔레그램 봇 웹훅 (기존 Ollama health check 알림 채널과 통합)
- critical 이벤트: 즉시 알림
- error 이벤트: 1시간 내 동일 에러 5건 이상 시 알림

---

## 6. 환경 변수

### 프론트엔드 (`VITE_` 접두사, Vite 규칙)

| 변수 | 용도 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `VITE_GTM_ID` | Google Tag Manager 컨테이너 ID |
| `VITE_ADSENSE_CLIENT_ID` | Google AdSense 클라이언트 ID |
| `VITE_SENTRY_DSN` | Sentry 프론트엔드 DSN |

### Edge Function (Supabase Secrets)

| 변수 | 용도 |
|---|---|
| `OLLAMA_URL` | Ollama 엔드포인트 (백엔드 전용) |
| `SENTRY_DSN` | Sentry Edge Function DSN |

### 로컬 개발

- `.env.local` — 로컬 환경 변수 (git 제외)
- `.env.example` — 템플릿 (git 포함)

### 프로덕션

- 프론트엔드: Vercel 환경 변수
- Edge Function: Supabase Secrets

---

## 7. 개발 시점 하네스

> 출처: 04-harness-engineering.md 섹션 1

Claude Code가 이 저장소에서 작업할 때 올바른 방향으로 동작하도록 감싸는 구조.

### 현재 적용된 하네스

| 하네스 요소 | 구현 위치 | 역할 |
|---|---|---|
| 시스템 프롬프트 | `CLAUDE.md` | 프로젝트 구조, 설계 원칙, 언어 규칙 전달 |
| 스펙 문서 | `docs/specs/*.md` | 기능 요구사항과 설계 결정의 컨텍스트 제공 |
| 문서 최신화 규칙 | `CLAUDE.md` > 작업 후 문서 최신화 | 코드-문서 불일치 방지를 위한 피드백 루프 |

### CLAUDE.md 고도화

현재 `CLAUDE.md`는 프로젝트 개요 수준. 코드가 작성되기 시작하면 다음을 추가한다.

- **빌드/테스트/린트 명령어** — Claude Code가 변경 후 즉시 검증할 수 있도록
- **코드 컨벤션** — 파일 네이밍, 컴포넌트 구조, 상태 관리 패턴 등
- **금지 사항** — 직접 DB 스키마 변경 금지 (마이그레이션 필수), env 파일 커밋 금지 등

### 가드레일 (Pre-commit Hook)

Claude Code가 생성한 코드가 자동으로 검증되는 구조.

```
코드 생성 → lint (ESLint) → 타입 체크 (tsc) → 테스트 → 커밋
```

- **ESLint + Prettier** — 코드 스타일 강제
- **TypeScript strict mode** — 타입 안전성 보장
- **Pre-commit hook (husky + lint-staged)** — 커밋 전 자동 검증

### 피드백 루프

Claude Code 작업 결과를 평가하고 개선하는 순환 구조.

```
작업 요청 → Claude Code 실행 → 테스트/빌드 검증 → 실패시 자동 수정 → docs/ 최신화
```

- 테스트 실패 시 Claude Code가 원인을 분석하고 수정하는 루프
- 작업 완료 후 관련 스펙 문서 변경 여부 확인 (이미 CLAUDE.md에 명시)

---

## 8. CI/CD

- **GitHub Actions** 사용
- GitHub push 시 Vercel 자동 배포 연동
- Pre-commit hook (husky + lint-staged)으로 커밋 전 로컬 검증
- 배포 파이프라인: `push → GitHub Actions → Vercel 배포`
