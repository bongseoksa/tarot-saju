# Phase 1: 정적 데이터 + 공용 컴포넌트

> 목표: 정적 데이터 JSON 정의, Stitch HTML을 React 공용 컴포넌트로 전환, 앱 레이아웃 구성.
> 완료 기준: 공용 컴포넌트가 개별 렌더링되고, 테마/카드 데이터가 import 가능한 상태.
> **상태: 완료** (tsc/eslint/vitest/build 통과 확인)

---

## 1-1. 정적 데이터 정의

### 테마 데이터 (`src/data/themes.ts`)

`docs/specs/02-taro-mvp.md`의 테마 콘텐츠 테이블 기반 11개 테마 정의.

```typescript
const THEMES: TarotTheme[] = [
  { id: "daily-today", category: "daily", title: "오늘의 타로", ... },
  // 11개
];
```

카테고리별 아이콘/색상 매핑도 함께 정의:

| 카테고리 | 아이콘 (Material Symbols) | 태그 배경 | 태그 텍스트 |
|---|---|---|---|
| daily | `auto_awesome` | `#F3E8FF` | `#7C3AED` |
| love | `favorite` | `#FCE7F3` | `#9D174D` |
| career | `work` | `#E0F2FE` | `#075985` |
| wealth | `payments` | `#FEF3C7` | `#92400E` |
| study | `school` | `#D1FAE5` | `#065F46` |
| general | `chat_bubble` | `#F3F4F6` | `#374151` |

### 스프레드 데이터 (`src/data/spreads.ts`)

MVP는 쓰리카드 고정이므로 단일 스프레드 정의.

### 카드 이미지 에셋 복사

`docs/design/stitch/cards/*.png` → `src/assets/cards/` 복사. `tarot-cards.json`의 `imageUrl` 경로와 매핑.

**작업:**
- [x] `src/data/themes.ts` — 11개 테마 + 카테고리 메타 정의 (`THEMES`, `CATEGORIES`, `getCategoryMeta()`)
- [x] `src/data/spreads.ts` — 쓰리카드 스프레드 정의 (`THREE_CARD_SPREAD`)
- [x] `src/assets/cards/` — 카드 이미지 23장 복사 완료
- [x] `src/data/cards.ts` — `packages/shared/data/tarot-cards.json` re-export (`TAROT_CARDS`, `getCardById()`)

**검증:** tsc 통과, 모든 데이터 파일 import 시 타입 에러 없음

---

## 1-2. 공용 레이아웃

Stitch HTML의 공통 구조 추출: 헤더, max-width 컨테이너.

### `AppHeader` (`src/components/AppHeader.tsx`)

참조: `01-home.html` (line 108~122), `02-card-draw.html` (line 124~132)

- 홈: 로고(점하나 아이콘 + 텍스트) + 히스토리 아이콘
- 서브페이지: 뒤로가기 + 페이지 제목 + 우측 액션(선택)
- props: `variant: "home" | "sub"`, `title?`, `onBack?`, `rightAction?`
- 스타일: sticky top-0, backdrop-blur, max-w-md mx-auto

### `AppLayout` (`src/components/AppLayout.tsx`)

- 공통 wrapper: max-w-md mx-auto, min-h-screen, bg-background
- children 렌더링

**작업:**
- [x] `src/components/AppHeader.tsx` — 두 가지 variant (`home` / `sub`)
- [x] `src/components/AppLayout.tsx` — 공통 래퍼 (`bg-background text-on-background min-h-screen`)
- [x] `App.tsx`에 AppLayout 적용

**검증:** tsc/build 통과. 컴포넌트는 아직 페이지에서 사용하지 않음 (Phase 2에서 적용 예정)

---

## 1-3. 기초 UI 컴포넌트

Stitch HTML에서 반복 사용되는 패턴을 컴포넌트로 추출.

### `Icon` (`src/components/ui/Icon.tsx`)

Material Symbols Outlined 아이콘 래퍼.

```tsx
<Icon name="favorite" filled size={20} />
// → <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; font-size: 20px;">favorite</span>
```

### `CategoryChip` (`src/components/ui/CategoryChip.tsx`)

참조: `01-home.html` (line 143~151)

- props: `label`, `active`, `onClick`
- active: `bg-primary text-on-primary`
- inactive: `bg-surface-container-low text-on-surface-variant`

### `ThemeCard` (`src/components/ui/ThemeCard.tsx`)

참조: `01-home.html` (line 161~198)

- props: `theme: TarotTheme`, `onClick`
- 카테고리 태그 + 아이콘 + 제목 + 설명
- 카테고리별 색상 매핑 적용

### `TarotCardImage` (`src/components/ui/TarotCardImage.tsx`)

카드 이미지 표시 컴포넌트. 앞면/뒷면 전환용.

- props: `cardId?`, `showBack?`, `className?`
- 뒷면: `card-back.png` 표시
- 앞면: cardId로 이미지 경로 매핑

### `ErrorModal` (`src/components/ui/ErrorModal.tsx`)

참조: `07-error.html` (line 149~174)

- props: `onHome`, `onRetry`
- 캐릭터 일러스트 + 에러 메시지 + 버튼 2개

### `LoadingScreen` (`src/components/ui/LoadingScreen.tsx`)

참조: `06-loading.html` (line 121~147)

- 전체화면 점하나 캐릭터 바운스 애니메이션
- 터치/뒤로가기 차단 (pointer-events-none)

**작업:**
- [x] `Icon.tsx` — Material Symbols Outlined 래퍼 (name, filled, size props)
- [x] `CategoryChip.tsx` — 카테고리 필터 칩 (active/inactive 스타일)
- [x] `ThemeCard.tsx` — 테마 카드 (카테고리 태그 색상 매핑 포함)
- [x] `TarotCardImage.tsx` — 카드 이미지 (앞면/뒷면, `import.meta.url` 기반 경로)
- [x] `ErrorModal.tsx` — 에러 모달 (점하나 캐릭터 CSS + 버튼 2개)
- [x] `LoadingScreen.tsx` — 로딩 화면 (점하나 바운스 애니메이션)

**검증:** tsc/build 통과. 시각적 검증은 Phase 2에서 페이지 적용 후 진행

---

## 완료 체크리스트

- [x] 테마 11개 데이터 정의 + 타입 정합성 (tsc 통과)
- [x] 카드 이미지 23장 `src/assets/cards/`에 존재
- [x] AppHeader 홈/서브 variant 생성
- [x] AppLayout 적용 (`App.tsx`에서 Routes 감싸기)
- [x] UI 컴포넌트 6개 생성
- [x] `npm run lint` 통과
- [x] `npm run test` 통과
- [x] `npm run build` 통과

---

## 참조

- Stitch 스크린: `docs/design/stitch/screens/*.html`
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 테마 콘텐츠: `docs/specs/02-taro-mvp.md` (테마 콘텐츠 섹션)
- 카드 데이터: `packages/shared/data/tarot-cards.json`
