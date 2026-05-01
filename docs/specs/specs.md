## 문서 목록 (docs/specs)
- specs.md — 서비스 스펙 정의 (현재 문서)
- tech-decisions.md — 기술스택 선정 근거
- 00-brainstorming.md — 브레인스토밍 / 초기 아이디어 정리
- 01-taro-mvp.md — 타로 MVP 기능 설계
- backlog.md — 백로그 (동작 우선, 최적화는 나중에)
- 02-ai-design.md — (예정) AI 해석 품질 설계
- 03-experiment-plan.md — (예정) 결제 검증 실험

## 서비스
타로 카드를 통한 타로점 제공(MVP).
확장기능으로 사주 기능 추가.

- 타로 = 진입 훅 (무료 중심): 빠른 체험, 감정 자극, 공유 유도
- 사주 = 수익화 핵심 (유료 중심): 깊은 해석, 신뢰 기반 결제

## 수익모델
- 광고 배너
- 1회 무료 기회 제공 이후 광고를 통한 기회 추가
- 결제를 통한 기회권 제공

## 배포 타겟
1. 웹 브라우저 (우선)
2. 안드로이드 어플리케이션
3. iOS 어플리케이션

## 개발 방식
- 웹앱 어플리케이션으로 개발
- 어플리케이션은 껍데기(WebView) 역할을 하며 내부적으로 모두 웹앱 구조
- 모바일 래퍼: Capacitor (Ionic) — React + Vite 웹앱을 네이티브 앱으로 패키징
- 디자인: v0 (Vercel) 또는 Sketch AI 활용
- 문서 먼저, 코드는 나중에 (설계 -> 검증 -> 개발)

## 기술스택

### 프론트엔드
- 프레임워크: React + Vite
- 언어: TypeScript
- 라우팅: React Router
- 스타일링: Tailwind CSS
- 상태관리: Zustand (필요시)

### 백엔드
- Supabase Edge Functions (Deno/TypeScript)
- 별도 백엔드 서버 없이 Supabase 기능으로 MVP 구성
- 확장 필요시 Node.js (NestJS) 도입 검토

### 데이터베이스
- Supabase (PostgreSQL)
- Supabase Auth (인증)
- 벡터DB: Supabase pgvector (확장시)

### AI 모델
- 온디맨드 경량 모델 (Gemma 등) — 로컬 PC에서 직접 서빙
- MVP에서는 본인 PC에서 모델 실행, Cloudflare Tunnel로 외부 노출
- AI 역할은 **해석 문장 생성 한 가지**로 한정
  - 카드 뽑기: 랜덤 선택 (AI 불필요)
  - 카드 의미/스프레드 규칙: 정적 데이터로 DB/JSON 관리 (AI 불필요)
  - 해석 문장 생성: 정적 데이터 + 사용자 질문을 프롬프트로 전달 → 문장 생성 (AI 역할)
- 모델 크기보다 **프롬프트 설계가 핵심** (프롬프트 품질 = 서비스 품질)
- 응답 속도 최적화는 백로그 처리, 동작 우선

### 모바일 앱 래퍼
- Capacitor — 웹앱을 Android/iOS 네이티브 앱으로 빌드
- 푸시 알림, 인앱 결제 등 네이티브 기능 브릿지 제공

### 인프라/배포
- 프론트엔드: Vercel (정적 SPA 호스팅)
- DB/Auth/Functions: Supabase
- AI 서빙: 로컬 PC + Cloudflare Tunnel
- CI/CD: GitHub Actions
- **MVP 운영 비용: 0원** (모든 스택 무료 티어 또는 로컬 활용)

> 기술스택 선정 근거: [docs/specs/tech-decisions.md](./tech-decisions.md)

## 개발 전략

### Phase 1 (MVP 필수)
- 타로 MVP 출시
- 결제 테스트
- 목표: 100명 유저 확보, 첫 결제 1건

### Phase 2 (조건부 — 유료 전환 발생시)
- 사주 MVP 개발
- AI 모델 고도화

## 리스크
1. **AI 품질 의존** — 카드/사주 해석 모두 AI 품질에 좌우됨. 프롬프트 실패시 서비스 가치 없음
2. **로컬 서빙 안정성** — PC 꺼지면 AI 서비스 중단. MVP 100명 테스트에는 감당 가능
3. **사주 난이도** — 계산 로직 + 데이터 구조 + 해석까지 필요. 타로 대비 2~3배 복잡
4. **유료 전환 불확실** — "재미"는 쉽지만 "결제"는 어렵다. 실험 설계 필수

## 백로그
> 상세 목록: [docs/specs/backlog.md](./backlog.md)