# 점하나 스펙 문서 인덱스

## 서비스 개요

- 서비스명: **점하나** (JeomHana)
- 타로 카드를 통한 타로점 제공 (MVP). 확장기능으로 사주 기능 추가
- 타로 = 진입 훅 (무료 중심), 사주 = 수익화 핵심 (유료 중심, Phase 2)

## 문서 구조

### 스펙 (`docs/specs/`)

| 문서 | 설명 | 개발 단계 |
|---|---|---|
| [01-benchmark.md](./01-benchmark.md) | 경쟁 서비스 벤치마킹 분석 (점신/헬로우봇/보라/coto) | 기획 |
| [02-product-spec.md](./02-product-spec.md) | 제품 스펙: 사용자 흐름, IA, 화면 정의, 에지 케이스, 데이터 구조, MVP 범위 | 기획 |
| [03-frontend-spec.md](./03-frontend-spec.md) | 프론트엔드: 라우팅, 상태관리, 반응형 레이아웃, 접근성, 디자인 가이드 | FE |
| [04-backend-spec.md](./04-backend-spec.md) | 백엔드: API 설계, DB 스키마, 인증 (Supabase는 옵션) | BE |
| [05-ai-spec.md](./05-ai-spec.md) | AI: 심리 설계, 프롬프트, 모델, 테스트, 하네스 | AI |
| [06-infra-spec.md](./06-infra-spec.md) | 인프라: 배포, AI 서빙, 트래킹, 환경 변수, CI/CD | Infra |
| [07-worldview.md](./07-worldview.md) | "점" 세계관: 캐릭터 가문, 확장 시나리오 | 기획 |
| [backlog.md](./backlog.md) | 백로그: P0/P1/P2 우선순위별 항목 | 전체 |

### 디자인 (`docs/design/`)

| 문서/디렉토리 | 설명 |
|---|---|
| [design-system.md](../design/stitch/design-system.md) | 디자인 시스템: 컬러, 타이포, 컴포넌트, 마스코트, 셰이프 |
| [card-prompts.md](../design/stitch/card-prompts.md) | 타로 카드 22장 이미지 생성 프롬프트 |
| [figma-prompts.md](../design/stitch/figma-prompts.md) | Figma Make 화면별 프롬프트 (STEP 1-10) |
| [layout-research.md](../design/layout-research.md) | 레이아웃 리서치 + 반응형 개선 제안 (KRDS, 접근성, KPI) |
| `stitch/cards/` | 타로 카드 이미지 에셋 (22장 + 뒷면) |
| `stitch/mascot/` | 마스코트 이미지 에셋 |

### 참고 자료

| 디렉토리 | 설명 |
|---|---|
| `docs/reference/` | 타로 기초 지식, Waite Pictorial Key 한글 번역, Cloudflare Tunnel 설정 가이드 |
| `docs/benchmark/` | 경쟁 서비스 스크린샷 |
| `docs/legal/` | 개인정보처리방침, 이용약관 |

## 개발 계획 (FE / BE / AI 병렬)

### 트랙 간 의존 관계

```
packages/shared (공유 타입 + 정적 데이터)
    ↓               ↓               ↓
   FE              BE              AI
(화면 구현)    (API + DB)    (프롬프트 + 모델)
    │               │               │
    │     MSW mock  │               │
    │◄─────────────►│               │
    │               │  prompt-builder│
    │               │◄─────────────►│
    │               │               │
    └───────────────┴───────────────┘
              통합 (Sprint 2)
```

### Sprint 0: 공통 기반 (병렬 선행 조건)

모든 트랙이 독립적으로 작업하기 위한 계약(contract)을 먼저 확정한다.

| 작업 | 산출물 | 참조 스펙 |
|---|---|---|
| 모노레포 셋업 | `apps/web/`, `packages/shared/`, `supabase/functions/` | 03-frontend-spec |
| 공유 타입 정의 | `packages/shared/types/` — TarotCard, Spread, DrawnCard, ReadingRequest, ReadingResult, TarotTheme, PendingSession | 02-product-spec (데이터 구조) |
| 정적 데이터 | `packages/shared/data/` — 카드 22장, 테마 11개, 스프레드 | 02-product-spec (테마 콘텐츠) |
| API 계약 | interpret endpoint 요청/응답 타입, SSE 이벤트 포맷 | 04-backend-spec (API 설계) |
| MSW mock handler | `packages/msw-handler/` — interpret mock (정적 해석 반환) | 03-frontend-spec (테스트 전략) |

> Sprint 0 완료 = 3개 트랙 동시 착수 가능

---

### Sprint 1: 독립 개발 (병렬)

각 트랙이 mock/stub에 의존하여 독립적으로 개발한다.

#### FE 트랙 — `03-frontend-spec.md`

MSW mock으로 API를 대체하여 전체 화면을 구현한다.

| 순서 | 작업 | 검증 |
|---|---|---|
| 1-1 | 프로젝트 셋업 (Vite + Tailwind + Router + Zustand) | `pnpm dev` 정상 실행 |
| 1-2 | 홈 화면 (테마 목록 + 카테고리 필터 + 퀵 진입) | 정적 데이터 렌더링 확인 |
| 1-3 | 카드 뽑기 화면 (22장 그리드 + 슬롯 + 선택 로직) | 카드 3장 선택 → 슬롯 배치 |
| 1-4 | 결과 화면 (카드 요약 + AI 스트리밍 영역 + 아코디언) | MSW mock 스트리밍 수신 표시 |
| 1-5 | 히스토리 (localStorage CRUD + 빈 상태) | 저장/조회/만료 테스트 통과 |
| 1-6 | 로딩/에러/광고 게이트 (공통 오버레이) | 에지 케이스 흐름 확인 |

#### BE 트랙 — `04-backend-spec.md`

interpret Edge Function과 DB를 구현한다. AI 호출은 stub으로 대체.

| 순서 | 작업 | 검증 |
|---|---|---|
| 1-1 | DB 셋업 (shared_readings 테이블 + RLS) | 마이그레이션 적용 성공 |
| 1-2 | interpret Edge Function 스켈레톤 (프롬프트 조합 + SSE 응답) | curl로 SSE 스트림 수신 |
| 1-3 | Ollama 호출 stub (고정 문자열 스트리밍 반환) | interpret → stub → SSE 정상 |
| 1-4 | 공유 결과 저장/조회 (Supabase SDK + RLS) | insert → select → 30일 만료 |
| 1-5 | 동적 OG 태그 Edge Function (/shared/:shareId) | OG meta 반환 확인 |

#### AI 트랙 — `05-ai-spec.md`

로컬 Ollama에서 프롬프트를 개발하고 품질을 검증한다.

| 순서 | 작업 | 검증 |
|---|---|---|
| 1-1 | prompt-builder 구현 (`packages/shared/prompts/`) | buildPrompt 유닛 테스트 |
| 1-2 | 시스템 프롬프트 v1 작성 (심리 설계 6개 규칙 반영) | 로컬 Ollama 수동 테스트 |
| 1-3 | 쓰리카드 프롬프트 템플릿 구현 | 카테고리별 샘플 해석 생성 |
| 1-4 | 응답 파싱 (parseResponse) + 출력 가드레일 | 형식/길이/금칙어 검증 |
| 1-5 | test:ai:quick (25회) 통과 | 통과율 90% 이상 |
| 1-6 | 프롬프트 튜닝 (실패 케이스 기반) | 재테스트 통과 |

---

### Sprint 2: 통합 (싱크 포인트)

Mock/stub을 실제 구현으로 교체하고 E2E 흐름을 검증한다.

| 순서 | 작업 | 관련 트랙 | 검증 |
|---|---|---|---|
| 2-1 | BE에 prompt-builder 연결 (stub → 실제 Ollama 호출) | BE + AI | interpret → Ollama → SSE 정상 |
| 2-2 | FE에 실제 API 연결 (MSW mock → Supabase Edge Function) | FE + BE | 카드 선택 → API 호출 → 스트리밍 표시 |
| 2-3 | 공유 기능 E2E (공유 저장 → URL 생성 → OG 태그 → 랜딩) | FE + BE | 공유 링크 클릭 → 결과 표시 |
| 2-4 | 에지 케이스 통합 테스트 (AI 다운, 광고 실패, 미완료 세션) | 전체 | 02-product-spec 에지 케이스 시나리오 통과 |

---

### Sprint 3: 폴리싱 + 인프라 — `06-infra-spec.md`

| 순서 | 작업 | 검증 |
|---|---|---|
| 3-1 | 광고 연동 (AdSense Interstitial + 배너) | 광고 로드/실패/스킵 흐름 |
| 3-2 | 카드 선택 애니메이션 (Framer Motion 4단계) | 시각 피드백 + 햅틱 |
| 3-3 | 반응형 레이아웃 검증 (360px ~ 1440px) | 브레이크포인트별 UI 확인 |
| 3-4 | Vercel 배포 + Cloudflare Tunnel + launchd 설정 | 프로덕션 E2E 통과 |
| 3-5 | GTM + GA4 이벤트 트래킹 | 퍼널 이벤트 수신 확인 |
| 3-6 | test:ai:full (813회) 실행 | 통과율 95% 이상 |

---

### 싱크 규칙

| 규칙 | 설명 |
|---|---|
| **계약 변경 시 전 트랙 공유** | `packages/shared/`의 타입이나 API 계약이 변경되면, 변경 사유와 함께 관련 스펙 문서를 즉시 갱신한다 |
| **Sprint 경계에서 통합 테스트** | Sprint 1 완료 후 반드시 Sprint 2 통합을 수행한다. 독립 개발만으로 넘어가지 않는다 |
| **MSW mock은 API 계약의 거울** | FE가 사용하는 MSW mock 응답은 BE의 실제 응답 포맷과 항상 일치해야 한다. 계약 변경 시 mock도 갱신한다 |
| **prompt-builder는 단일 소스** | BE(Edge Function)와 AI(테스트)가 동일한 `packages/shared/prompts/`를 import한다. 복사본을 만들지 않는다 |

## 핵심 설계 원칙

- **AI 역할은 해석 문장 생성에만 한정.** 카드 뽑기는 랜덤, 카드 의미/스프레드 규칙은 정적 데이터
- **프롬프트 품질 = 서비스 품질.** 모델 크기보다 프롬프트 설계가 핵심
- **MVP 운영 비용 목표: 0원.** 모든 인프라는 무료 티어 또는 로컬 자원 활용
- **문서 먼저, 코드는 나중에.** 설계 → 검증 → 개발 순서 유지
