# 기술스택 선정 근거

## 프론트엔드: React + Vite

### 선정 이유
- **Capacitor 호환성**: SPA 빌드 결과물을 그대로 WebView에 로드 가능. Next.js는 `output: 'export'` 설정이 필요하며 이 경우 SSR, 미들웨어, API Routes 등 핵심 기능을 사용할 수 없음
- **빌드 속도**: Vite의 ESBuild 기반 빌드가 Next.js 대비 빠름. MVP 개발 사이클에 유리
- **단순한 구조**: 서버/클라이언트 컴포넌트 경계 구분 불필요. 모든 코드가 클라이언트에서 실행됨
- **번들 사이즈**: Next.js 프레임워크 오버헤드 없이 가벼운 결과물

### Next.js를 선택하지 않은 이유
| Next.js 장점 | 이 프로젝트에서의 필요성 |
|---|---|
| SSR/SSG | Capacitor WebView 안에서 실행 → SSR 무의미. SEO 필요 페이지는 프리렌더로 대응 |
| SEO | SPA + 프리렌더 + Edge 동적 OG로 충분. 아래 SEO 전략 참조 |
| API Routes | Supabase Edge Functions로 대체 |
| 서버 컴포넌트 | 카드 뽑기, AI 응답 등 클라이언트 인터랙션 중심 |

> 웹 서비스 병행이 결정되었으나, SEO가 필요한 페이지가 제한적이므로 Next.js 전환 비용 대비 효과가 낮다고 판단. 검색 유입이 유의미해지는 시점에 재검토.

### 검토했지만 제외한 대안
- **Flutter Web**: 웹 성능 이슈, 번들 사이즈 큼, 웹 생태계 활용 어려움
- **React Native (Expo)**: 웹 지원이 부차적, 네이티브 UI 컴포넌트 불필요

### SEO 대응 전략 (SPA + 프리렌더)

웹 서비스를 병행하므로 SEO가 필요하나, SSR 프레임워크(Next.js) 없이 대응 가능.

#### SEO가 필요한 페이지 vs 불필요한 페이지

| 페이지 | SEO 필요 | 이유 |
|---|---|---|
| 홈 (테마 목록) | O | "타로 운세", "오늘의 타로" 검색 유입 |
| 테마별 랜딩 | O | "연애 타로", "이직 타로" 롱테일 키워드 |
| 공유 결과 페이지 | O | 카카오/인스타 공유 시 OG 메타태그 필수 |
| 카드 뽑기 | X | 인터랙션 중심, 크롤러 불필요 |
| AI 해석 결과 | X | 동적 생성, 개인화 콘텐츠 |

#### MVP 대응 방식

1. **정적 프리렌더** — vite-ssg로 홈/테마 랜딩 페이지를 빌드 타임에 HTML 생성
2. **동적 OG 메타태그** — 공유 결과 페이지는 Vercel Edge Middleware 또는 Supabase Edge Function에서 OG 태그만 동적 주입 (HTML 전체 SSR 불필요)
3. **기본 SEO** — sitemap.xml, robots.txt, 구조화 데이터(JSON-LD) 설정

#### Next.js 전환을 하지 않는 이유

- Capacitor 호환을 위해 `output: 'export'` 필수 → SSR/미들웨어/API Routes 사용 불가, 사실상 SPA와 동일
- Supabase Edge Functions와 Next.js API Routes 역할 중복
- 서버/클라이언트 컴포넌트 경계 관리로 개발 복잡도 증가
- MVP 속도 목표에 역행

#### 전환 기준 (Phase 2 재검토)

- 검색 유입이 전체 트래픽의 30% 이상을 차지할 경우
- 프리렌더로 대응 불가능한 동적 SEO 페이지가 다수 필요해질 경우

---

## 백엔드: Supabase Edge Functions + SDK (RLS)

### 설계 원칙
무료 티어 Edge Function 개수 제한(10~15개)이 있으므로, **서버 검증이 필수인 로직만** Edge Function으로 처리. CRUD 작업은 Supabase SDK + RLS로 클라이언트에서 직접 DB 접근.

### Edge Function 사용 기준
| 처리 방식 | 기준 | 예시 |
|---|---|---|
| Edge Function | 서버에서 검증해야 하는 로직 | 프롬프트 조합, 결제 검증 (Phase 2) |
| Supabase SDK + RLS | 단순 CRUD, 사용자 본인 데이터 | 결과 저장/조회, 기회 조회 |
| 클라이언트 자체 처리 | 서버 불필요 | 카드 랜덤 뽑기 |

### MVP Edge Functions (1개)
1. **interpret** — 프롬프트 조합 (카드 정적 데이터 + 테마 정보 → 프롬프트 생성)

> 기회 차감/광고 검증 로직 제거 — 매회 무료 + 클라이언트 광고 시청 방식으로 전환. 상세: [01-benchmark.md](./01-benchmark.md)

### 선정 이유
- **서버 관리 불필요**: MVP 단계에서 별도 서버 운영/배포 부담 제거
- **Supabase 통합**: DB, Auth, Storage와 동일 플랫폼에서 함수 실행
- **TypeScript 지원**: 프론트엔드와 언어 통일 (Deno 런타임)
- **무료 티어**: MVP 검증에 충분한 사용량 제공
- **RLS 활용**: Edge Function 개수 최소화하면서도 보안 유지

### Python 백엔드를 선택하지 않은 이유
- 별도 서버 인프라 필요 (배포, 모니터링, 스케일링)
- MVP 단계에서 과도한 인프라 복잡도
- 프론트엔드(TypeScript)와 언어 분리로 인한 개발 속도 저하
- AI 서빙은 Ollama가 담당하므로 Python 서버 불필요

### 확장 계획
- 트래픽 증가 또는 복잡한 비즈니스 로직 필요시 Node.js (NestJS) 도입 검토

---

## 데이터베이스: Supabase (PostgreSQL)

### 선정 이유
- **관계형 DB + 실시간 기능**: PostgreSQL 기반으로 안정적이며 Realtime 구독 지원
- **인증 내장**: Supabase Auth로 소셜 로그인 등 별도 인증 서버 불필요
- **Row Level Security**: DB 레벨 접근 제어로 보안 확보
- **pgvector 확장**: 사주 확장시 벡터 검색 동일 DB에서 처리 가능
- **무료 티어**: 500MB 스토리지, 50K 월간 활성 유저

### 검토했지만 제외한 대안
- **Firebase**: NoSQL 구조가 사주 데이터(관계 많음)에 부적합
- **PlanetScale**: MySQL 기반, 벡터 검색 미지원

---

## AI 모델: 온디맨드 경량 모델 (Gemma 등)

### AI 역할 범위 정의
AI는 **해석 문장 생성**만 담당한다. 나머지는 정적 데이터로 처리.

| 영역 | 처리 방식 | AI 필요 여부 |
|---|---|---|
| 카드 뽑기 | 랜덤 선택 | X |
| 카드 의미 | 정적 데이터 (DB/JSON) | X |
| 스프레드 규칙 | 정적 데이터 | X |
| 해석 문장 생성 | 프롬프트 + 카드 데이터 → 문장 | O (유일한 AI 역할) |

### MVP 서빙 방식: 로컬 PC
- 본인 PC에서 Gemma 모델 실행 (Ollama 등)
- Cloudflare Tunnel로 외부에서 접근 가능하도록 노출
- 비용: 0원 (PC 전기세만)
- 응답 속도는 백로그로 관리, 동작 우선

### 선정 이유
- **비용 0원**: MVP 단계에서 투자 비용 없이 운영 가능
- **역할이 한정적**: 문장 생성만 수행하므로 대형 모델이 불필요
- **프롬프트가 핵심**: 카드 의미 데이터를 프롬프트에 함께 전달하면 모델이 별도 분석할 필요 없음. 모델 크기보다 프롬프트 설계가 서비스 품질을 결정

### 외부 API (Claude / Gemini)를 선택하지 않은 이유
- 호출당 과금 → 비용 0원 원칙에 위배
- 문장 생성만 필요한 역할에 대형 모델은 과잉 스펙
- 외부 서비스 의존으로 장애/정책 변경 리스크

### PC 사양별 가이드
| VRAM | 가능한 모델 | 예상 응답 속도 |
|---|---|---|
| 없음 (CPU only) | Gemma 2B (양자화) | 30초~1분+ |
| 4~6GB | Gemma 2B | 5~15초 |
| 8GB+ | Gemma 7B | 5~10초 |
| 16GB+ | Gemma 7B (고품질) | 3~5초 |

### 클라이언트 직접 호출 구조
- Edge Function에서 AI를 호출하지 않음 (타임아웃 위험 회피)
- Edge Function은 프롬프트 조합만 수행, 프롬프트를 클라이언트에 반환
- 클라이언트가 Ollama API를 직접 호출하여 스트리밍 응답 수신

### 리스크
- PC 꺼지면 AI 서비스 중단 (MVP 100명 테스트에는 감당 가능)
- 동시 요청 1~2명이 한계
- 한국어 타로 해석 품질은 프롬프트 튜닝으로 검증 필요

### 확장 계획
- 서비스 성장시 서버리스 GPU (Replicate, Modal, RunPod 등)로 이전
- 응답 속도 최적화: 모델 양자화, GPU 활용, 배치 처리

---

## 모바일 래퍼: Capacitor

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

## 배포: Vercel

### 선정 이유
- **정적 SPA 호스팅에 최적**: Vite 빌드 결과물 배포에 간단
- **글로벌 CDN**: 빠른 로딩 속도
- **GitHub 연동**: push시 자동 배포
- **무료 티어**: MVP 검증에 충분

---

## 트래킹: Google Tag Manager + Google Analytics 4

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
- GTM 컨테이너 스니펫을 `index.html`에 삽입
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

## 스타일링: Tailwind CSS

### 선정 이유
- **빠른 UI 개발**: 클래스 기반으로 별도 CSS 파일 관리 불필요
- **일관된 디자인 시스템**: 기본 제공되는 spacing, color, typography 스케일
- **번들 최적화**: 사용하지 않는 스타일 자동 제거 (PurgeCSS)
- **v0/AI 도구 호환**: AI 기반 UI 생성 도구들이 Tailwind 코드를 출력
