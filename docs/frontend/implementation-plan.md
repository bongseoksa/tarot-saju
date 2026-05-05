# MVP 구현 계획

> 전체 서비스 구현 계획. 프론트엔드 배포는 모든 기능 구현 완료 후 최종 단계에서 진행한다.
> 각 Phase별 세부 계획서를 작성하며 순차 진행한다.

---

## 현재 상태 요약

- 기획/정의: 32개 항목 전체 완료 (`docs/기획-정의목록.md`)
- 레이아웃 리서치: 완료 (`docs/specs/deep-research-report.md`)
- **프론트엔드: 재작업 필요** — deep-research-report 기반 반응형 레이아웃으로 전면 재구현
- 백엔드/AI/인프라: 미착수
- 배포: 미착수

### 재작업 배경

기존 Phase 0~4 (Stitch HTML 기반 모바일 전용 UI, 126 tests)를 deep-research-report의 반응형 레이아웃 체계로 전면 교체한다.

**주요 변경점:**
- KRDS 표준형 반응형 그리드 (360/768/1024/1280px 브레이크포인트)
- 허브형 홈 → 집중형 카드 뽑기 → 리포트형 결과 레이아웃 조합
- 데스크톱: 중앙 본문 + 보조 패널 적응형 구조
- KWCAG 2.2 접근성 기준 적용
- 광고와 콘텐츠의 명확한 시각 분리

---

## 전제 조건

- 레이아웃 리서치: `docs/specs/deep-research-report.md`
- 기술스택: React + Vite + TypeScript + Tailwind CSS + React Router + Zustand + Framer Motion
- 모바일 우선 반응형 (KRDS 브레이크포인트)
- 기존 비즈니스 로직(storageUtil, Zustand 스토어, SSE 클라이언트 등)은 재활용 가능

---

## Phase 목록

### 프론트엔드 (재작업 필요)

| Phase | 제목 | 세부 계획서 | 상태 |
|---|---|---|---|
| 0 | 프로젝트 초기 세팅 | [phase-0-setup.md](./phase-0-setup.md) | 재작업 필요 |
| 1 | 정적 데이터 + 공용 컴포넌트 | [phase-1-data-components.md](./phase-1-data-components.md) | 재작업 필요 |
| 2 | 페이지 구현 | [phase-2-pages.md](./phase-2-pages.md) | 재작업 필요 |
| 3 | 비즈니스 로직 + 상태 관리 | [phase-3-logic.md](./phase-3-logic.md) | 재작업 필요 |
| 4 | 애니메이션 + 폴리싱 | [phase-4-polish.md](./phase-4-polish.md) | 재작업 필요 |

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
[재작업] Phase 0~4 (프론트엔드)
  → deep-research-report 기반 반응형 레이아웃 전면 재구현
  → 기존 비즈니스 로직(storageUtil, 스토어, SSE)은 가능한 재활용

[다음] 1. 백엔드 — Supabase 프로젝트 + DB 스키마 + interpret Edge Function
       2. AI — Ollama + Gemma 모델 + Cloudflare Tunnel + 프롬프트 품질 검증
       3. 통합 — 프론트엔드 ↔ 백엔드 실제 연결 (AI 스트리밍, 공유 API)
       4. 광고 — AdSense 계정 + Interstitial/배너 코드 삽입
       5. 트래킹 — GTM 스니펫 + GA4 이벤트 12종
       6. SEO — 메타태그 + sitemap + robots.txt + 동적 OG Edge Function
       7. 인프라 — AI 서빙 자동화 (launchd, health check, 텔레그램 알림)
       8. 배포 — Vercel 설정 + Supabase 배포 + Lighthouse 검증 + 프리뷰 QA
```

---

## 테스트 인프라

| 도구 | 용도 |
|---|---|
| Vitest | 테스트 러너 |
| React Testing Library | 컴포넌트 테스트 |
| `@packages/msw-handler` | API 모킹 (MSW 기반) |

## 관련 스펙 문서

| 문서 | 참조 내용 |
|---|---|
| `docs/specs/deep-research-report.md` | 레이아웃 리서치, 반응형 브레이크포인트, 접근성, KPI |
| `docs/specs/02-taro-mvp.md` | 사용자 흐름, IA, 데이터 구조, API, 상태 관리 |
| `docs/specs/03-ai-design.md` | 프롬프트 설계, 심리 기법 |
| `docs/specs/tech-decisions.md` | 기술스택 근거, SEO 전략, 테스트 전략 |
| `docs/specs/specs.md` | 서비스 개요, 수익모델, 배포 타겟 |
| `docs/기획-정의목록.md` | 전체 32개 사전 정의 항목 (모두 완료) |
