# Phase 0: 프로젝트 초기 세팅

> 목표: 개발 가능한 프로젝트 뼈대 완성. 모노레포 구조, 패키지 설치, Tailwind 디자인 토큰 이전, 라우팅 스켈레톤.
> 완료 기준: `npm run dev`로 빈 페이지가 정상 렌더링되고, Tailwind 디자인 토큰이 적용된 상태.
> **상태: 완료** (chrome-devtools 검증 완료)

---

## 0-1. 모노레포 구조 생성

```
tarot-saju/
├── apps/
│   └── web/                      — React + Vite SPA
│       ├── public/
│       ├── src/
│       │   ├── assets/           — 카드 이미지, 로고 등 정적 에셋
│       │   │   └── cards/        — 22장 + 뒷면 PNG (stitch/cards에서 복사)
│       │   ├── components/       — 공용 UI 컴포넌트
│       │   │   └── ui/           — 기초 UI (Button, Modal 등)
│       │   ├── pages/            — 페이지 컴포넌트
│       │   ├── stores/           — Zustand 스토어
│       │   ├── utils/            — 유틸리티 (storageUtil 등)
│       │   ├── data/             — 정적 데이터 (카드, 테마)
│       │   ├── hooks/            — 커스텀 훅
│       │   ├── types/            — 프론트엔드 전용 타입
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css         — Tailwind 디렉티브 + 글로벌 스타일
│       ├── index.html
│       ├── tailwind.config.ts
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── functions/                — Edge Functions
│   └── migrations/               — DB 마이그레이션
├── packages/
│   └── shared/                   — 공유 타입/상수 (프론트+백엔드 공용)
│       ├── src/
│       │   ├── types.ts          — TarotCard, ReadingRequest 등
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── .env.example
├── .gitignore
├── package.json                  — 워크스페이스 루트
└── CLAUDE.md
```

**작업:**
- [x] `apps/web/` 디렉토리에 Vite + React + TypeScript 프로젝트 생성
- [x] `packages/shared/` 디렉토리에 공유 타입 패키지 생성
- [x] 루트 `package.json`에 npm workspaces 설정
- [x] `supabase/` 디렉토리 구조 생성 (빈 폴더)

**검증:** `cd apps/web && npm run dev` → Vite 기본 페이지 렌더링

---

## 0-2. 패키지 설치

### apps/web

| 패키지 | 용도 | 버전 참고 |
|---|---|---|
| `tailwindcss` + `@tailwindcss/vite` | 스타일링 | v4 (Vite 플러그인) |
| `react-router` | 라우팅 | v7 |
| `zustand` | 상태 관리 | latest |
| `framer-motion` | 애니메이션 | latest |
| `lz-string` | localStorage 압축 | latest |
| `crypto-js` | localStorage AES 암호화 | latest |

### devDependencies

| 패키지 | 용도 |
|---|---|
| `vitest` | 테스트 러너 |
| `@testing-library/react` | 컴포넌트 테스트 |
| `@testing-library/jest-dom` | DOM 매처 |
| `jsdom` | 테스트 환경 |
| `eslint` + `@eslint/js` | 린트 |
| `prettier` + `prettier-plugin-tailwindcss` | 포맷팅 |

**작업:**
- [x] 위 패키지 일괄 설치
- [x] `vitest.config.ts` 설정 (jsdom 환경)
- [x] `eslint.config.js` 설정 (ESLint v9 flat config)
- [x] `.prettierrc` 설정

**검증:** `cd apps/web && npm run lint` + `npm run test` 정상 실행

---

## 0-3. Tailwind 디자인 토큰 이전

Stitch HTML(`docs/design/stitch/screens/01-home.html`)의 Tailwind config 객체와 디자인 시스템(`docs/design/stitch/design-system.md`)을 `tailwind.config.ts`로 이전.

### 색상 토큰 (Material Design 3 기반)

```
primary:           #6b38d4     — 주요 인터랙션
on-primary:        #ffffff
primary-container: #8455ef
secondary:         #b90538     — CTA, 강조
on-secondary:      #ffffff
surface:           #fef7ff     — 페이지 배경
on-surface:        #1d1a23     — 본문 텍스트
on-surface-variant:#494454     — 부제/설명
outline:           #7b7486     — 구분선
outline-variant:   #cbc3d7     — 약한 구분선
surface-container: #f3ebf8     — 카드 배경
error:             #ba1a1a
```

### 타이포그래피

```
fontFamily: Pretendard (기본)
display-title:   20px / 700 / 1.4 / -0.02em
section-header:  18px / 600 / 1.4 / -0.01em
body-main:       16px / 400 / 1.6 / 0
sub-text:        14px / 400 / 1.5 / 0
caption:         12px / 400 / 1.4 / 0.01em
```

### 간격

```
base: 4px, xs: 8px, sm: 12px, md: 16px, lg: 24px, xl: 32px
container-padding: 20px, gutter: 12px
```

### 라운딩

```
sm: 0.25rem, DEFAULT: 0.5rem, md: 0.75rem, lg: 1rem, xl: 1.5rem, full: 9999px
```

**구현 참고:** Tailwind v4는 `tailwind.config.ts` 대신 `index.css`의 `@theme` 블록에서 CSS 변수로 토큰을 정의.

**작업:**
- [x] `index.css`에 `@theme` 블록으로 전체 색상/간격/라운딩/타이포 토큰 정의
- [x] `index.css`에 Tailwind 디렉티브 (`@import "tailwindcss"`)
- [x] Pretendard 폰트 CDN 링크 추가 (`index.html`)
- [x] Material Symbols Outlined 아이콘 폰트 CDN 추가 (`index.html`)

**검증:** chrome-devtools에서 `bg-background` (#fef7ff) 배경색 정상 적용 확인

---

## 0-4. 라우팅 스켈레톤

`react-router` v7로 기본 라우팅 구성. 각 페이지는 빈 컴포넌트.

| 경로 | 컴포넌트 | 비고 |
|---|---|---|
| `/` | `HomePage` | 홈 |
| `/reading/:themeId` | `ReadingPage` | 카드 뽑기 |
| `/result/:resultId` | `ResultPage` | 결과 |
| `/history` | `HistoryPage` | 히스토리 |
| `/shared/:shareId` | `SharedResultPage` | 공유 결과 |
| `*` | → `/` 리다이렉트 | 캐치올 |

**작업:**
- [x] `App.tsx`에 `BrowserRouter` + `Routes` 구성
- [x] `pages/` 디렉토리에 빈 페이지 컴포넌트 5개 생성 (HomePage, ReadingPage, ResultPage, HistoryPage, SharedResultPage)
- [x] 각 페이지에 "페이지명" 텍스트만 표시 (스켈레톤)

**검증:** chrome-devtools에서 6개 라우트 + 캐치올 리다이렉트 모두 확인 완료

---

## 0-5. 공유 타입 패키지 (`packages/shared`)

`docs/specs/02-taro-mvp.md`에 정의된 타입을 TypeScript로 구현.

```typescript
// packages/shared/src/types.ts

interface TarotCard { ... }
interface Spread { ... }
interface SpreadPosition { ... }
interface TarotTheme { ... }
interface ReadingRequest { ... }
interface DrawnCard { ... }
interface ReadingResult { ... }
interface PendingSession { ... }
```

**작업:**
- [x] `packages/shared/src/types.ts` — 8개 인터페이스 정의 (TarotCard, Spread, SpreadPosition, TarotTheme, ReadingRequest, DrawnCard, ReadingResult, PendingSession)
- [x] `packages/shared/src/index.ts` — re-export
- [x] `packages/shared/package.json` — name: `@tarot-saju/shared`
- [x] `apps/web/`에서 `@tarot-saju/shared` import 가능 확인

**검증:** `apps/web/`에서 `import { TarotCard } from '@tarot-saju/shared'` 정상 동작 (tsc 통과)

---

## 0-6. 환경 변수

`.env.example` 생성:

```
# Frontend (Vite)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GTM_ID=
VITE_ADSENSE_CLIENT_ID=
```

**작업:**
- [x] `.env.example` 생성 (git 포함)
- [x] `.gitignore`에 `.env*.local` 포함 확인

---

## 0-7. Git 설정

- [x] `.gitignore` 업데이트 (node_modules/, dist/, .env*.local, .DS_Store)
- [ ] 초기 커밋 (아직 미커밋)

---

## 완료 체크리스트

- [x] `npm run dev` → localhost에서 빈 페이지 렌더링 (chrome-devtools 확인)
- [x] Tailwind 디자인 토큰 적용 확인 (bg-background #fef7ff 적용)
- [x] Pretendard 폰트 CDN 링크 포함 (`index.html`)
- [x] 6개 라우트 정상 동작 + 캐치올 리다이렉트 (chrome-devtools 확인)
- [x] `@tarot-saju/shared` 타입 import 정상 (tsc 통과)
- [x] `npm run lint` 통과
- [x] `npm run test` 통과 (App 렌더링 테스트 1개)
- [x] `.env.example` 존재
- [x] 콘솔 에러/경고 없음 (chrome-devtools 확인)

---

## 구현 노트

- Tailwind v4 사용: `tailwind.config.ts` 없이 `index.css`의 `@theme` 블록에서 CSS 변수로 디자인 토큰 정의
- ESLint v9: `eslint.config.js` flat config 사용 (`.eslintrc` 아님)
- lint/test/build는 `apps/web/` 디렉토리에서 실행해야 함 (루트에서 실행 시 config 못 찾음)

## 참조

- Stitch Tailwind config: `docs/design/stitch/screens/01-home.html` (line 11~)
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 데이터 타입: `docs/specs/02-taro-mvp.md` (데이터 구조 섹션)
- 라우팅: `docs/specs/02-taro-mvp.md` (라우팅 섹션)
- 환경 변수: `CLAUDE.md` (환경 변수 섹션)
