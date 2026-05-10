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
| `docs/reference/` | 타로 기초 지식, Waite Pictorial Key 한글 번역 |
| `docs/benchmark/` | 경쟁 서비스 스크린샷 |
| `docs/legal/` | 개인정보처리방침, 이용약관 |

## 개발 순서

```
1. Frontend — 03-frontend-spec.md 기반
2. Backend  — 04-backend-spec.md 기반
3. AI      — 05-ai-spec.md 기반
4. Infra   — 06-infra-spec.md 기반
```

## 핵심 설계 원칙

- **AI 역할은 해석 문장 생성에만 한정.** 카드 뽑기는 랜덤, 카드 의미/스프레드 규칙은 정적 데이터
- **프롬프트 품질 = 서비스 품질.** 모델 크기보다 프롬프트 설계가 핵심
- **MVP 운영 비용 목표: 0원.** 모든 인프라는 무료 티어 또는 로컬 자원 활용
- **문서 먼저, 코드는 나중에.** 설계 → 검증 → 개발 순서 유지
