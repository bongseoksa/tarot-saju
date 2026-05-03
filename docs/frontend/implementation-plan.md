# 프론트엔드 구현 계획

> Stitch 디자인 시안 기반 React + Vite SPA 구현 계획
> 각 Phase별 세부 계획서를 작성하며 순차 진행한다.

---

## 전제 조건

- 디자인 시안: Stitch HTML (`docs/design/stitch/screens/`) + 스크린샷 (`screenshots/`)
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 카드 에셋: `docs/design/stitch/cards/` (22장 + 뒷면 = 23장 PNG)
- 기술스택: React + Vite + TypeScript + Tailwind CSS + React Router + Zustand + Framer Motion
- 모바일 우선 반응형

---

## Phase 목록

| Phase | 제목 | 세부 계획서 | 상태 |
|---|---|---|---|
| 0 | 프로젝트 초기 세팅 | [phase-0-setup.md](./phase-0-setup.md) | 완료 |
| 1 | 정적 데이터 + 공용 컴포넌트 | [phase-1-data-components.md](./phase-1-data-components.md) | 완료 |
| 2 | 페이지 구현 | [phase-2-pages.md](./phase-2-pages.md) | 완료 |
| 3 | 비즈니스 로직 + 상태 관리 | [phase-3-logic.md](./phase-3-logic.md) | 대기 |
| 4 | 애니메이션 + 폴리싱 | [phase-4-polish.md](./phase-4-polish.md) | 대기 |
| 5 | 트래킹 + 배포 | [phase-5-deploy.md](./phase-5-deploy.md) | 대기 |

---

## 실행 순서

```
Phase 0 (세팅)           → 모노레포, 패키지 설치, Tailwind 디자인 토큰 이전
Phase 1 (데이터+컴포넌트) → 정적 데이터 JSON, Stitch HTML → React 컴포넌트, 레이아웃
Phase 2 (페이지)          → 홈 → 카드 뽑기 → 로딩 → 결과 → 공유 → 히스토리 → 오류
Phase 3 (로직)            → Zustand 스토어, storageUtil, 카드 로직, 광고, AI 스트리밍, 공유
Phase 4 (폴리싱)          → 카드 4단계 애니메이션, 페이지 전환, 타이핑 효과, 반응형
Phase 5 (배포)            → GTM/GA4, SEO 프리렌더, Vercel/Supabase 배포
```

---

## 디자인 에셋 참조

| 에셋 | 경로 |
|---|---|
| UI 스크린 HTML | `docs/design/stitch/screens/*.html` |
| UI 스크린샷 | `docs/design/stitch/screenshots/*.png` |
| 타로 카드 이미지 | `docs/design/stitch/cards/*.png` |
| 디자인 시스템 | `docs/design/stitch/design-system.md` |
| 디자인 레퍼런스 | `docs/design/reference.md` |

## 관련 스펙 문서

| 문서 | 참조 내용 |
|---|---|
| `docs/specs/02-taro-mvp.md` | 사용자 흐름, IA, 데이터 구조, API, 상태 관리 |
| `docs/specs/03-ai-design.md` | 프롬프트 설계, 심리 기법 |
| `docs/specs/tech-decisions.md` | 기술스택 근거, SEO 전략 |
| `docs/specs/specs.md` | 서비스 개요, 수익모델, 배포 타겟 |
| `docs/기획-정의목록.md` | 전체 32개 사전 정의 항목 (모두 완료) |
