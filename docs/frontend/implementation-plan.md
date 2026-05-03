# MVP 구현 계획

> 전체 서비스 구현 계획. 프론트엔드 배포는 모든 기능 구현 완료 후 최종 단계에서 진행한다.
> 각 Phase별 세부 계획서를 작성하며 순차 진행한다.

---

## 현재 상태 요약

- 기획/정의: 32개 항목 전체 완료 (`docs/기획-정의목록.md`)
- 프론트엔드: Phase 0~4 완료 (UI + 비즈니스 로직 + 애니메이션, 126 tests PASS)
- 백엔드/AI/인프라: 미착수
- 배포: 미착수

---

## 전제 조건

- 디자인 시안: Stitch HTML (`docs/design/stitch/screens/`) + 스크린샷 (`screenshots/`)
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 카드 에셋: `docs/design/stitch/cards/` (22장 + 뒷면 = 23장 PNG)
- 기술스택: React + Vite + TypeScript + Tailwind CSS + React Router + Zustand + Framer Motion
- 모바일 우선 반응형

---

## Phase 목록

### 프론트엔드 (완료)

| Phase | 제목 | 세부 계획서 | 상태 |
|---|---|---|---|
| 0 | 프로젝트 초기 세팅 | [phase-0-setup.md](./phase-0-setup.md) | 완료 |
| 1 | 정적 데이터 + 공용 컴포넌트 | [phase-1-data-components.md](./phase-1-data-components.md) | 완료 |
| 2 | 페이지 구현 | [phase-2-pages.md](./phase-2-pages.md) | 완료 |
| 3 | 비즈니스 로직 + 상태 관리 | [phase-3-logic.md](./phase-3-logic.md) | 완료 |
| 4 | 애니메이션 + 폴리싱 | [phase-4-polish.md](./phase-4-polish.md) | 완료 |

### 남은 작업 (우선순위순)

| 순위 | 영역 | 제목 | 세부 계획서 | 상태 |
|---|---|---|---|---|
| 1 | 백엔드 | Supabase 세팅 + Edge Function (interpret) | 미작성 | 대기 |
| 2 | AI | Ollama + Cloudflare Tunnel + 프롬프트 검증 | 미작성 | 대기 |
| 3 | 프론트-백 | 프론트엔드-백엔드 통합 (실제 AI 스트리밍 + 공유 API 연결) | 미작성 | 대기 |
| 4 | 프론트 | 광고 연동 (AdSense Interstitial + 배너) | 미작성 | 대기 |
| 5 | 프론트 | GTM + GA4 트래킹 | [phase-5-deploy.md](./phase-5-deploy.md) 5-1 | 대기 |
| 6 | 프론트 | SEO + 동적 OG 메타태그 | [phase-5-deploy.md](./phase-5-deploy.md) 5-2, 5-3 | 대기 |
| 7 | 인프라 | AI 서빙 안정성 (launchd, health check, 텔레그램 알림) | 미작성 | 대기 |
| 8 | 배포 | Vercel + Supabase 배포 + 최종 검증 | [phase-5-deploy.md](./phase-5-deploy.md) 5-4, 5-5 | 대기 |

---

## 실행 순서

```
[완료] Phase 0~4 (프론트엔드)
  → 모노레포, 컴포넌트, 페이지, 비즈니스 로직, 애니메이션 (126 tests)

[다음] 1. 백엔드 — Supabase 프로젝트 + DB 스키마 + interpret Edge Function
       2. AI — Ollama + Gemma 모델 + Cloudflare Tunnel + 프롬프트 품질 검증
       3. 통합 — 프론트엔드 ↔ 백엔드 실제 연결 (AI 스트리밍, 공유 API)
       4. 광고 — AdSense 계정 + Interstitial/배너 코드 삽입
       5. 트래킹 — GTM 스니펫 + GA4 이벤트 12종
       6. SEO — 메타태그 + sitemap + robots.txt + 동적 OG Edge Function
       7. 인프라 — AI 서빙 자동화 (launchd, health check, 텔레그램 알림)
       8. 배포 — Vercel 설정 + Supabase 배포 + Lighthouse 검증 + 프리뷰 QA
```

### 의존 관계

```
1 (백엔드) ← 3 (통합): Edge Function 필요
2 (AI)     ← 3 (통합): Ollama 엔드포인트 필요
3 (통합)   ← 8 (배포): 전체 흐름 동작 확인 후 배포
4 (광고)   ← 독립 (AdSense 승인에 시간 소요, 일찍 시작 가능)
5 (트래킹) ← 독립 (백엔드 없이 프론트만으로 구현 가능)
6 (SEO)    ← 독립 (정적 메타태그는 즉시, 동적 OG는 1 이후)
7 (인프라)  ← 2 (AI): Ollama 설정 완료 후
8 (배포)   ← 1~7 전체 완료 후 최종 단계
```

> **원칙: 프론트엔드 배포(Vercel)는 전체 기능 구현이 완료된 이후 최종 단계에서 진행한다.**

---

## 디자인 에셋 참조

| 에셋 | 경로 |
|---|---|
| UI 스크린 HTML | `docs/design/stitch/screens/*.html` |
| UI 스크린샷 | `docs/design/stitch/screenshots/*.png` |
| 타로 카드 이미지 | `docs/design/stitch/cards/*.png` |
| 디자인 시스템 | `docs/design/stitch/design-system.md` |
| 디자인 레퍼런스 | `docs/design/reference.md` |

## 테스트 인프라

| 도구 | 용도 |
|---|---|
| Vitest | 테스트 러너 |
| React Testing Library | 컴포넌트 테스트 |
| `@packages/msw-handler` | API 모킹 (MSW 기반). Supabase 등 외부 API 호출 테스트 시 네트워크 레벨에서 가로챔 |

API 테스트 작성 시 `vi.mock`으로 Supabase 클라이언트를 직접 모킹하지 않고, `@packages/msw-handler`의 `createMock`으로 핸들러를 정의하여 MSW Node 서버(`server.ts`)에서 요청을 가로채는 방식을 사용한다. 상세 사용법은 `packages/msw-handler/README.md` 참조.

## 관련 스펙 문서

| 문서 | 참조 내용 |
|---|---|
| `docs/specs/02-taro-mvp.md` | 사용자 흐름, IA, 데이터 구조, API, 상태 관리 |
| `docs/specs/03-ai-design.md` | 프롬프트 설계, 심리 기법 |
| `docs/specs/tech-decisions.md` | 기술스택 근거, SEO 전략, 테스트 전략 |
| `docs/specs/specs.md` | 서비스 개요, 수익모델, 배포 타겟 |
| `docs/기획-정의목록.md` | 전체 32개 사전 정의 항목 (모두 완료) |
