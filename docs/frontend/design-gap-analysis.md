# 디자인-구현 갭 분석 및 보완 계획

> Stitch 디자인 시안(`docs/frontend/stitch_jeomhana_tarot_ai/`)과 현재 구현(`apps/web/src/`) CSS/Tailwind 클래스 직접 대조 비교
> 작성일: 2026-05-03 | 기준 브랜치: feature/frontend

---

## 1. 디자인 시안-구현 매핑

| 디자인 스크린 | 대응 페이지 | 일치율 |
|---|---|---|
| `_1/` — 카드 선택 (오늘의 타로) | `ReadingPage.tsx` | ~90% |
| `_2/` — 로딩/스플래시 | `LoadingScreen.tsx` | ~80% |
| `_3/` — 히스토리 | `HistoryPage.tsx` | ~99% |
| `_4/` — 에러 모달 | `ErrorModal.tsx` | ~95% |
| `_5/` — 홈 | `HomePage.tsx` | ~88% |
| `_6/` — 결과 페이지 | `ResultPage.tsx` | ~90% |
| `_7/` — 공유 결과 | `SharedResultPage.tsx` | ~94% |

---

## 2. 공통 크로스 페이지 갭

### 2.1 바텀 네비게이션 바 — 미구현 (P1)

디자인 `_3/`, `_5/`에 존재하지만 현재 구현에 전혀 없음.

| 속성 | 디자인 값 |
|---|---|
| Position | `fixed bottom-0 left-0 right-0 z-50` |
| Layout | `flex justify-around items-center` |
| Padding | `px-6 pb-6 pt-3` |
| Max Width | `max-w-md mx-auto` |
| Background | `bg-white` |
| Border | `border-t border-zinc-100`, `rounded-t-3xl` |
| Shadow | `shadow-[0_-4px_20px_rgba(139,92,246,0.06)]` |
| Active Tab | `text-violet-500`, `bg-violet-50` |
| Inactive Tab | `text-zinc-400`, `hover:text-violet-400` |
| 표시 조건 | 홈/히스토리에서 표시, 결과/공유/리딩에서 숨김 |

### 2.2 미완료 세션 토스트 — 미구현 (P2, Phase 3 연계)

디자인 `_5/` 하단에 존재.

| 속성 | 디자인 값 |
|---|---|
| Position | `fixed bottom-28 left-0 right-0 z-50` |
| Inner | `bg-zinc-900 text-white px-lg py-sm rounded-full shadow-2xl` |
| Layout | `flex items-center gap-3 max-w-xs` |
| Animation | `animate-bounce` |

### 2.3 타이포그래피 font-family 적용 방식 차이 — 전체 (P3)

디자인 HTML은 Tailwind 커스텀 유틸리티 `font-display-title`, `font-sub-text` 등을 사용하여 fontFamily와 fontSize를 동시에 적용. 구현은 `text-[length:--font-size-*]`로 fontSize만 추출하고, fontFamily는 body 상속에 의존.

| 타이포 레벨 | 디자인 클래스 | 구현 클래스 | 차이 |
|---|---|---|---|
| display-title | `font-display-title text-display-title` | `text-[length:--font-size-display-title] leading-[1.4] tracking-[-0.02em] font-bold` | fontFamily 누락 (body 상속으로 동작) |
| section-header | `font-section-header text-section-header` | `text-[length:--font-size-section-header] leading-[1.4] tracking-[-0.01em] font-semibold` | fontFamily 누락 |
| body-main | `font-body-main text-body-main` | `text-[length:--font-size-body-main] leading-[1.6]` | fontFamily 누락 |
| sub-text | `font-sub-text text-sub-text` | `text-[length:--font-size-sub-text] leading-[1.5]` | fontFamily 누락 |
| caption | `font-caption text-caption` | `text-[length:--font-size-caption] leading-[1.4] tracking-[0.01em]` | fontFamily 누락 |

**영향도**: Pretendard가 body에 설정되어 있으므로 현재 동작에는 문제 없음. 단, body font가 변경되면 깨질 수 있는 잠재적 리스크.

---

## 3. 화면별 상세 CSS 대조

### 3.1 HomePage (디자인 `_5/`)

#### Header (AppHeader home variant)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Background | `bg-white/80` | `bg-white/80` | O |
| Backdrop | `backdrop-blur-md` | `backdrop-blur-md` | O |
| Border | `border-b border-zinc-100` | `border-b border-zinc-100` | O |
| Position | `sticky top-0 z-50` | `sticky top-0 z-50` | O |
| Height | `h-16` | `h-16` | O |
| Width | `max-w-md` | `max-w-[448px]` | O (동일 값) |
| Padding | `px-4` | `px-4` | O |
| Logo font | `font-['Plus_Jakarta_Sans'] text-xl font-black` | `font-['Plus_Jakarta_Sans'] text-xl font-black` | O |
| Logo circle | `w-8 h-8 bg-primary rounded-full` | `w-8 h-8 bg-primary rounded-full` | O |
| Inner dot | `w-2 h-2 bg-white rounded-full` | `w-2 h-2 bg-white rounded-full` | O |
| History btn | `p-2 rounded-full hover:bg-zinc-50 transition-colors` | `p-2 rounded-full hover:bg-zinc-50 transition-colors` | O |

#### Hero Section

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Outer padding | `px-container-padding pt-lg pb-xl` | `px-[--spacing-container-padding] pt-[--spacing-lg] pb-[--spacing-xl]` | O |
| Inner padding | `p-lg` | `p-[--spacing-lg]` | O |
| Border radius | `rounded-[32px]` | `rounded-[32px]` | O |
| Gradient | `bg-gradient-to-br from-[#FFFDEB] to-[#FDF4FF]` | `bg-gradient-to-br from-[#FFFDEB] to-[#FDF4FF]` | O |
| Overflow | `overflow-hidden` | `overflow-hidden` | O |
| Subtitle color | `text-on-surface-variant` | `text-on-surface-variant` | O |
| Heading tracking | `-0.02em` | `tracking-[-0.02em]` | O |
| CTA bg/text | `bg-primary text-on-primary` | `bg-primary text-on-primary` | O |
| CTA padding | `px-lg py-md` | `px-[--spacing-lg] py-[--spacing-md]` | O |
| CTA radius | `rounded-full` | `rounded-full` | O |
| CTA shadow | `shadow-lg shadow-primary/20` | `shadow-lg shadow-primary/20` | O |
| CTA active | `active:scale-95 transition-transform` | `active:scale-95 transition-transform` | O |
| Character deco | `absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-20` | 동일 | O |
| **Character 렌더링** | `<img>` 태그 (이미지) | `<div> bg-primary rounded-full` (CSS 원형) | **X** |

#### Category Chips

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Container | `flex overflow-x-auto no-scrollbar gap-xs` | `flex overflow-x-auto gap-[--spacing-xs]` + 스크롤바 숨김 arbitrary | O |
| Active chip | `bg-primary text-on-primary` | `bg-primary text-on-primary` | O |
| Inactive chip | `bg-surface-container-low text-on-surface-variant` | `bg-surface-container-low text-on-surface-variant` | O |
| Hover | `hover:bg-surface-container-high transition-colors` | `hover:bg-surface-container-high transition-colors` | O |
| Padding | `px-md py-sm` | `px-[--spacing-md] py-[--spacing-sm]` | O |
| Radius | `rounded-full` | `rounded-full` | O |
| Flex | `flex-none` | `flex-none` | O |

#### Theme Cards (ThemeCard.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Grid | `grid grid-cols-1 gap-md` | `grid grid-cols-1 gap-[--spacing-md]` | O |
| Card bg | `bg-white` | `bg-white` | O |
| Card padding | `p-lg` | `p-[--spacing-lg]` | O |
| Card radius | `rounded-[24px]` | `rounded-[24px]` | O |
| Card shadow | `shadow-sm` | `shadow-sm` | O |
| Card border | `border border-zinc-100` | `border border-zinc-100` | O |
| Card hover | `hover:border-primary-fixed transition-colors` | `hover:border-primary-fixed transition-colors` | O |
| Tag colors (Love) | `bg-[#FCE7F3] text-[#9D174D]` | 데이터 기반 동적 적용 | O (값 일치 확인 필요) |
| Icon box | `w-10 h-10 bg-surface-container rounded-xl` | `w-10 h-10 bg-surface-container rounded-xl` | O |
| Icon hover | `group-hover:bg-primary-fixed transition-colors` | `group-hover:bg-primary-fixed transition-colors` | O |

#### Footer

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Border | `border-t border-zinc-100` | `border-t border-zinc-100` | O |
| Links color/hover | `text-on-surface-variant hover:text-primary` | `text-on-surface-variant hover:text-primary` | O |
| Copyright color | `text-zinc-400` | `text-zinc-400` | O |

#### 미구현 요소

| 요소 | 디자인 스펙 | 우선순위 |
|---|---|---|
| **Bottom Nav** | 4탭 바텀 내비게이션 (위 2.1 참조) | P1 |
| **미완료 세션 토스트** | 하단 고정, bg-zinc-900 (위 2.2 참조) | P2 |

---

### 3.2 ReadingPage (디자인 `_1/`)

#### Main Container

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Background | `bg-amber-50/30` | `bg-amber-50/30` | O |
| Overflow | `overflow-hidden` | `overflow-hidden` | O |
| **Height** | flex 기반 암시적 | `calc(100vh - 64px)` 명시적 | **X** (동작 동일) |

#### Card Slots

| 속성 | 디자인 | 구현 (CardSlot.tsx) | 일치 |
|---|---|---|---|
| Wrapper | `flex justify-between gap-gutter` | `flex justify-between gap-[--spacing-gutter]` | O |
| Slot flex | `flex-1` | `flex-1` | O |
| Slot aspect | `aspect-[2/3]` | `aspect-[2/3]` | O |
| Empty border | `border-2 border-dashed border-violet-200` | `border-2 border-dashed border-violet-200` | O |
| Empty bg | `bg-white/50` | `bg-white/50` | O |
| Empty icon | `add_circle text-3xl text-violet-100` | `add_circle size={30} text-violet-100` | O |
| Label color | `text-violet-300` | `text-violet-300` | O |
| **Filled: shadow** | 없음 | `shadow-lg` 추가됨 | **X** (구현에서 추가) |
| **Filled: border** | 없음 | `border-4 border-white` 추가됨 | **X** (구현에서 추가) |

#### Card Grid (CardGrid.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Grid | `grid grid-cols-4 gap-sm` | `grid grid-cols-4 gap-[--spacing-sm]` | O |
| Card aspect | `aspect-[2/3]` | `aspect-[2/3]` | O |
| Card radius | `rounded-lg` | `rounded-lg` | O |
| Card bg | `bg-white` | `bg-white` | O |
| Card border | `border border-zinc-100` | `border border-zinc-100` | O |
| Card shadow | `shadow-sm` | `shadow-sm` | O |
| Hover | `hover:shadow-md hover:-translate-y-1` | `hover:shadow-md hover:-translate-y-1` | O |
| Active | `active:scale-95` | `active:scale-95` | O |
| Selected opacity | `opacity-40` | `opacity-40` | O |
| Selected grayscale | `grayscale-[0.2]` | `grayscale-[0.2]` | O |
| Last 2 cards | `flex justify-center gap-sm`, `w-[calc(25%-9px)]` | 동일 | O |
| Mask image | `linear-gradient(transparent, black 5%, black 90%, transparent)` | 동일 | O |
| **Scrollbar width** | `4px` (custom CSS) | `[&::-webkit-scrollbar]:w-1` (4px) | O |
| **Scrollbar thumb color** | `rgba(139,92,246,0.1)` | `bg-violet-100` | **X** (미세 색상 차이) |
| **Scrollbar thumb radius** | `border-radius: 10px` | `rounded-full` (9999px) | **X** (시각 차이 미미) |
| **Card inner bg** | `bg-violet-50` (카드 뒷면 래퍼) | TarotCardImage 컴포넌트 위임 | **X** (확인 필요) |

#### Bottom Button Area

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Position | `fixed bottom-0 left-0 right-0` | `fixed bottom-0 left-0 right-0` | O |
| Gradient | `bg-gradient-to-t from-white via-white/90 to-transparent` | 동일 | O |
| Padding bottom | `pb-8` | `pb-8` | O |
| Disabled bg/text | `bg-zinc-200 text-zinc-400 cursor-not-allowed` | `bg-zinc-200 text-zinc-400 cursor-not-allowed` | O |
| Disabled radius | `rounded-2xl` | `rounded-2xl` | O |
| **Disabled shadow** | `shadow-lg shadow-black/5` | 없음 | **X** (누락) |
| **Enabled 레이아웃** | 단일 버튼 (bg-primary) | 2버튼 (다시 선택 + 결과 보기) | **X** (구현 확장) |
| **Enabled submit shadow** | `shadow-violet-200` | `shadow-primary/20` | **X** (미세 차이) |

#### Background Decorations

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Top-right orb | `w-64 h-64 bg-violet-100/40 blur-3xl -translate-y-1/2 translate-x-1/2` | 동일 | O |
| Bottom-left orb | `w-80 h-80 bg-amber-100/40 blur-3xl translate-y-1/3 -translate-x-1/3` | 동일 | O |

---

### 3.3 ResultPage (디자인 `_6/`)

#### Card Summary (CardSummary.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Container bg | `bg-white` | `bg-white` | O |
| Container radius | `rounded-[32px]` | `rounded-[32px]` | O |
| Container padding | `p-md` | `p-[--spacing-md]` | O |
| Container shadow | `shadow-[0_4px_20px_rgba(139,92,246,0.04)]` | 동일 | O |
| Container border | `border border-violet-50` | `border border-violet-50` | O |
| Inner flex | `flex justify-between items-end gap-xs` | `flex justify-between items-end gap-[--spacing-xs]` | O |
| Non-current label | `bg-surface-container-low text-on-surface-variant` | 동일 | O |
| Current label | `bg-primary-fixed text-primary font-bold` | 동일 | O |
| Label padding/radius | `px-2 py-0.5 rounded-full` | `px-2 py-0.5 rounded-full` | O |
| Non-current card | `shadow-sm border border-zinc-100 rounded-xl` | 동일 | O |
| Current card border | `border-2 border-primary-fixed` | 동일 | O |
| Current card ring | `ring-4 ring-primary-fixed/20` | 동일 | O |
| Current card offset | `pb-4` | `pb-4` | O |
| Card name weight | `font-bold` | `font-bold` | O |
| Current name color | `text-primary` | `text-primary` | O |

#### Mascot Indicator

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Container | `flex items-center gap-sm` | `flex items-center gap-[--spacing-sm]` | O |
| Avatar size | `w-12 h-12` | `w-12 h-12` | O |
| Avatar bg | `bg-primary-fixed` | `bg-primary-fixed` | O |
| Avatar border | `border-2 border-white` | `border-2 border-white` | O |
| Avatar shadow | `shadow-sm` | `shadow-sm` | O |
| **Avatar 내부** | `<img>` (실제 이미지) | `<div> bg-primary rounded-full` (CSS 원형) | **X** |
| Bubble bg | `bg-white` | `bg-white` | O |
| Bubble radius | `rounded-tr-2xl rounded-br-2xl rounded-bl-2xl` | 동일 | O |
| Bubble border | `border border-zinc-100` | 동일 | O |
| Bubble shadow | `shadow-sm` | `shadow-sm` | O |
| **Container mb** | `mb-lg` | 없음 | **X** (누락) |

#### Interpretation Cards (InterpretationCard.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Card bg | `bg-white` | `bg-white` | O |
| Card padding | `p-lg` | `p-[--spacing-lg]` | O |
| Card radius | `rounded-[24px]` | `rounded-[24px]` | O |
| Card shadow | `shadow-sm` | `shadow-sm` | O |
| Non-highlight border | `border border-zinc-100` | 동일 | O |
| Highlight border | `border border-primary-fixed/50` | 동일 | O |
| Highlight ring | `ring-1 ring-primary-fixed/20` | 동일 | O |
| Title color | `text-primary` | `text-primary` | O |
| Title gap | `flex items-center gap-2` | 동일 | O |
| Body color | `text-on-surface-variant` | `text-on-surface-variant` | O |
| **Title weight** | `font-bold` (700) | `font-semibold` (600) | **X** |
| **Section position** | `relative` | 없음 | **X** (누락) |

#### Advice Card (AdviceCard.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Background | `bg-primary-container` | `bg-primary-container` | O |
| Text color | `text-on-primary-container` | `text-on-primary-container` | O |
| Padding | `p-lg` | `p-[--spacing-lg]` | O |
| Radius | `rounded-[24px]` | `rounded-[24px]` | O |
| Shadow | `shadow-md` | `shadow-md` | O |
| Divider | `bg-white/20 h-px w-full` | 동일 | O |
| Summary icon | `verified text-[24px]` | `verified size={24}` | O |
| Summary weight | `font-bold` | `font-bold` | O |
| **Title weight** | `font-bold` (700) | `font-semibold` (600) | **X** |
| **Body opacity** | 없음 | `opacity-90` 추가됨 | **X** (구현에서 추가) |

#### Footer Buttons

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Position | `fixed bottom-0 left-0 right-0 z-50` | 동일 | O |
| Background | `bg-white/95 backdrop-blur-md` | 동일 | O |
| Radius | `rounded-t-[32px]` | `rounded-t-[32px]` | O |
| Shadow | `shadow-[0_-8px_30px_rgba(0,0,0,0.05)]` | 동일 | O |
| Border | `border-t border-zinc-50` | 동일 | O |
| Share btn | `flex-1 h-14 bg-white border border-violet-200 text-primary rounded-2xl` | 동일 | O |
| Share hover | `hover:bg-violet-50` | `hover:bg-violet-50` | O |
| Primary btn | `flex-[2] h-14 bg-primary text-white rounded-2xl` | 동일 | O |
| Primary shadow | `shadow-[0_8px_16px_rgba(107,56,212,0.2)]` | 동일 | O |
| **Primary hover** | `hover:bg-primary/90` | 없음 | **X** (누락) |
| **Active duration** | `active:scale-95 duration-200` | `active:scale-95` (duration 없음) | **X** (미세) |
| **Main scrollbar** | `overflow-y-auto no-scrollbar` | `no-scrollbar` 누락 | **X** |

---

### 3.4 SharedResultPage (디자인 `_7/`)

#### Greeting Bubble

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Avatar | `w-10 h-10 bg-surface-container` | 동일 | O |
| Avatar dot | `w-2.5 h-2.5` | 동일 | O |
| Message border | `border border-zinc-100` | 동일 | O |
| Message padding | `p-md` | `p-[--spacing-md]` | O |
| Message radius | `rounded-2xl rounded-tl-none` | 동일 | O |
| Message shadow | `shadow-sm` | `shadow-sm` | O |

#### Card Grid

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Grid | `grid-cols-3 gap-gutter` | `grid-cols-3 gap-[--spacing-gutter]` | O |
| Label color | `text-zinc-500` | `text-zinc-500` | O |
| Card radius/border | `rounded-xl border border-zinc-100` | 동일 | O |
| Center card | `scale-110 z-10` | 동일 | O |
| Name current color | `text-zinc-900` | 동일 | O |
| Name other color | `text-zinc-700` | 동일 | O |

#### Summary Card

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Background | `bg-primary-fixed-dim/20` | 동일 | O |
| Border | `border border-primary-fixed-dim` | 동일 | O |
| Padding/radius | `p-lg rounded-2xl` | `p-[--spacing-lg] rounded-2xl` | O |
| Label | `font-bold text-primary` | 동일 | O |
| **Title line-height** | `leading-tight` (1.25) | `leading-[1.4]` | **X** |

#### Timeline (TimelineInterpretation.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Non-highlight border | `border-l-2 border-zinc-100` | 동일 | O |
| Highlight border | `border-l-2 border-primary-fixed-dim` | 동일 | O |
| Dot position | `absolute -left-[9px] top-0` | 동일 | O |
| Dot size | `w-4 h-4` | 동일 | O |
| Dot border | `border-4 border-white` | 동일 | O |
| Dot non-highlight | `bg-zinc-200` | 동일 | O |
| Dot highlight | `bg-primary` | 동일 | O |
| Title highlight color | `text-primary` | 동일 | O |
| Body color | `text-on-surface-variant` | 동일 | O |

#### Bottom CTA

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Position | `fixed bottom-0 left-1/2 -translate-x-1/2` | 동일 | O |
| Button | `h-14 w-full bg-primary text-white rounded-2xl` | 동일 | O |
| Shadow | `shadow-lg shadow-primary/20` | 동일 | O |
| **Hover** | `hover:scale-[0.98]` | 없음 | **X** (누락) |
| **Footer branding** | 하단 `text-caption text-zinc-400` + "JeomHana AI Tarot" | 없음 | **X** (누락) |

---

### 3.5 HistoryPage (디자인 `_3/`)

#### Summary Stats

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Grid | `grid-cols-2 gap-sm` | `grid-cols-2 gap-[--spacing-sm]` | O |
| Card bg/padding | `bg-white p-md` | `bg-white p-[--spacing-md]` | O |
| Card radius | `rounded-xl` | `rounded-xl` | O |
| Card shadow | `shadow-[0_4px_20px_rgba(139,92,246,0.04)]` | 동일 | O |
| Card border | `border border-zinc-50` | 동일 | O |
| Stat label | `text-caption text-zinc-500` | `text-[length:--font-size-caption] text-zinc-500` | O |
| Stat value primary | `text-primary font-bold` | 동일 | O |
| Stat value secondary | `text-secondary` | 동일 | O |

#### History Card (HistoryCard.tsx)

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Card bg | `bg-white` | `bg-white` | O |
| Card padding | `p-md` | `p-[--spacing-md]` | O |
| Card radius | `rounded-2xl` | `rounded-2xl` | O |
| Card shadow | `shadow-[0_8px_30px_rgba(0,0,0,0.04)]` | `shadow-[0_8px_30px_rgba(0,0,0,0.04)]` | O |
| Card border | `border border-white` | `border border-white` | O |
| Active | `active:scale-[0.98] transition-transform` | 동일 | O |
| Badge padding | `px-2 py-0.5 rounded-full` | 동일 | O |
| Badge font | `text-[10px] font-bold` | 동일 | O |
| Badge colors | `bg-pink-50 text-secondary` 등 | 동일 | O |
| Date color | `text-zinc-400` | 동일 | O |
| Chevron | `text-zinc-300` | 동일 | O |
| Thumbnail | `w-14 h-20 rounded-lg bg-zinc-100 border border-zinc-50` | 동일 | O |

> HistoryPage는 바텀 네비 외에 CSS 차이가 거의 없음 (~99% 일치).

---

### 3.6 LoadingScreen (디자인 `_2/`)

#### Container

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Position | `fixed inset-0 z-[100]` | 동일 | O |
| Background | `bg-[#FAFAF9]` | 동일 | O |
| Layout | `flex flex-col items-center justify-center` | 동일 | O |
| Touch | `touch-none pointer-events-none select-none` | 동일 | O |

#### Character

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Outer container | `w-32 h-32` | 동일 | O |
| Circle | `w-24 h-24 bg-primary rounded-full` | 동일 | O |
| Eyes | `absolute top-1/2 left-1/4 (right-1/4) w-3 h-3 bg-white` | 동일 | O |
| Mouth | `absolute bottom-6 w-8 h-3 bg-white/20 rounded-full` | 동일 | O |
| Highlight | `absolute -top-4 -right-4 w-12 h-12 bg-white/10 blur-md` | 동일 | O |
| **Bounce animation** | `animate-bounce-custom` (커스텀 0.8s, -24px) | `animate-bounce` (기본 1s) | **X** |

#### Shadow Pulse

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| **Shadow element** | `w-16 h-3 bg-black/10 blur-sm rounded-[100%] mt-4` | 없음 | **X** (미구현) |
| **Shadow animation** | `animate-shadow-pulse` (scaleX 진동) | 없음 | **X** (미구현) |

#### Text Section

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Gap | `gap-xs` | `gap-[--spacing-xs]` | O |
| Title color | `text-on-surface` | 동일 | O |
| Subtitle color | `text-on-surface-variant opacity-80` | 동일 | O |

#### Loading Dots

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Dot size | `w-1.5 h-1.5` | 동일 | O |
| Dot color | `bg-primary-fixed-dim` | 동일 | O |
| Dot radius | `rounded-full` | 동일 | O |
| **Dot animation duration** | `1.5s infinite` | `animate-pulse` (기본 2s) | **X** |
| Dot delay (2nd) | `200ms` | `[animation-delay:200ms]` | O |
| Dot delay (3rd) | `400ms` | `[animation-delay:400ms]` | O |

#### Footer

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| **Footer text** | `fixed bottom-12` + `opacity-40` + "JeomHana AI Tarot System" | 없음 | **X** (미구현) |

---

### 3.7 ErrorModal (디자인 `_4/`)

#### Overlay

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Position | `fixed inset-0 z-[100]` | 동일 | O |
| Background | `bg-zinc-900/40` | 동일 | O |
| Backdrop | `backdrop-blur-sm` | 동일 | O |
| Layout | `flex items-center justify-center` | 동일 | O |

#### Modal

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Width | `w-full max-w-xs` | 동일 | O |
| Radius | `rounded-[32px]` | 동일 | O |
| Shadow | `shadow-[0_20px_50px_rgba(107,56,212,0.15)]` | 동일 | O |
| Padding | `p-xl` | `p-[--spacing-xl]` | O |
| Overflow | `overflow-hidden` | 동일 | O |

#### Character

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Container | `w-32 h-32 mb-lg` | `w-32 h-32 mb-[--spacing-lg]` | O |
| Glow bg | `bg-primary-container/10 rounded-full blur-2xl` | 동일 | O |
| Circle | `w-24 h-24 bg-primary rounded-full relative z-10` | 동일 | O |
| Eyes position | `absolute top-1/2 left-1/4 (right-1/4)` | 동일 | O |
| Eyes size | `w-3 h-3 bg-white rounded-full` | 동일 | O |
| **Eyes transform** | 없음 | `-translate-y-1` 추가됨 | **X** (구현 추가) |
| **Mouth** | `w-8 h-3 bg-white/20 rounded-full` (채움) | `w-6 h-2 border-b-2 border-white/60` (테두리) | **X** |

#### Buttons

| 속성 | 디자인 | 구현 | 일치 |
|---|---|---|---|
| Primary bg/text | `bg-primary text-on-primary` | 동일 | O |
| Primary padding | `py-md` | `py-[--spacing-md]` | O |
| Primary radius | `rounded-xl` | `rounded-xl` | O |
| Primary active | `active:scale-95 transition-transform` | 동일 | O |
| Secondary color | `text-outline hover:text-primary` | 동일 | O |
| Secondary transition | `transition-colors` | 동일 | O |
| **Body px** | 없음 | `px-[--spacing-sm]` 추가됨 | **X** (구현 추가) |

---

## 4. 갭 종합 목록 (우선순위별)

### P1 — 구조적 누락 (즉시 보완)

| # | 항목 | 위치 | 디자인 값 | 현재 | 작업 |
|---|---|---|---|---|---|
| 1 | **바텀 네비게이션 바** | 전역 | 4탭 fixed bottom, `shadow-[0_-4px_20px_rgba(139,92,246,0.06)]`, `rounded-t-3xl` | 없음 | `BottomNav.tsx` 신규 생성 + AppLayout 통합 |

### P2 — 기능적 차이 (Phase 3~4 연계)

| # | 항목 | 위치 | 디자인 값 | 현재 | Phase |
|---|---|---|---|---|---|
| 2 | 미완료 세션 토스트 | HomePage | `bg-zinc-900 rounded-full animate-bounce` | 없음 | Phase 3 |
| 3 | AI 스트리밍 타이핑 | ResultPage | 마스코트 말풍선 타이핑 | 없음 | Phase 4 |

### P3 — CSS 차이 (폴리싱)

| # | 항목 | 파일 | 디자인 값 | 현재 값 | 비고 |
|---|---|---|---|---|---|
| 4 | InterpretationCard title weight | `InterpretationCard.tsx` | `font-bold` (700) | `font-semibold` (600) | 수정 필요 |
| 5 | AdviceCard title weight | `AdviceCard.tsx` | `font-bold` (700) | `font-semibold` (600) | 수정 필요 |
| 6 | ResultPage primary btn hover | `ResultPage.tsx` | `hover:bg-primary/90` | 없음 | 추가 |
| 7 | ResultPage btn duration | `ResultPage.tsx` | `duration-200` | 없음 | 추가 |
| 8 | ResultPage mascot mb | `ResultPage.tsx` | `mb-lg` | 없음 | 추가 |
| 9 | ResultPage scrollbar | `ResultPage.tsx` | `no-scrollbar` | 없음 | 추가 |
| 10 | SharedResult summary line-height | `SharedResultPage.tsx` | `leading-tight` (1.25) | `leading-[1.4]` | 수정 |
| 11 | SharedResult CTA hover | `SharedResultPage.tsx` | `hover:scale-[0.98]` | 없음 | 추가 |
| 12 | SharedResult footer branding | `SharedResultPage.tsx` | `text-caption text-zinc-400` 점하나 로고 | 없음 | 추가 |
| 13 | LoadingScreen bounce timing | `LoadingScreen.tsx` | 커스텀 0.8s, -24px | 기본 `animate-bounce` (1s) | 커스텀 keyframe |
| 14 | LoadingScreen shadow pulse | `LoadingScreen.tsx` | `w-16 h-3 bg-black/10 blur-sm animate-shadow-pulse` | 없음 | 추가 |
| 15 | LoadingScreen dot duration | `LoadingScreen.tsx` | `1.5s` | 기본 `2s` | tailwind config 또는 arbitrary |
| 16 | LoadingScreen footer text | `LoadingScreen.tsx` | `fixed bottom-12 opacity-40` "JeomHana AI Tarot System" | 없음 | 추가 |
| 17 | ErrorModal mouth | `ErrorModal.tsx` | `w-8 h-3 bg-white/20 rounded-full` | `w-6 h-2 border-b-2 border-white/60` | 디자인 값으로 수정 |
| 18 | ErrorModal eye transform | `ErrorModal.tsx` | 없음 | `-translate-y-1` | 의도적 개선? 유지 가능 |
| 19 | ReadingPage disabled btn shadow | `ReadingPage.tsx` | `shadow-lg shadow-black/5` | 없음 | 추가 |
| 20 | ReadingPage filled slot | `CardSlot.tsx` | border/shadow 없음 | `shadow-lg border-4 border-white` 추가됨 | 의도적 개선? 유지 가능 |
| 21 | AdviceCard body opacity | `AdviceCard.tsx` | 없음 | `opacity-90` | 의도적 개선? 유지 가능 |
| 22 | ReadingPage scrollbar thumb | `CardGrid.tsx` | `rgba(139,92,246,0.1)` | `bg-violet-100` | 미세 차이 |
| 23 | ReadingPage main height | `ReadingPage.tsx` | flex 암시적 | `calc(100vh - 64px)` | 동작 동일, 유지 가능 |

---

## 5. 종합 평가

### 화면별 일치율

| 화면 | 일치율 | 주요 갭 |
|---|---|---|
| HistoryPage | ~99% | 바텀 내비만 누락 |
| ErrorModal | ~95% | 캐릭터 mouth 디테일 |
| SharedResultPage | ~94% | CTA hover, footer branding, summary leading |
| ResultPage | ~90% | font-weight, btn hover, mascot mb, scrollbar |
| ReadingPage | ~90% | filled slot 스타일 차이, disabled btn shadow |
| HomePage | ~88% | 바텀 내비, 토스트 누락 |
| LoadingScreen | ~80% | shadow pulse 미구현, 애니메이션 타이밍, footer text |

### 주요 패턴 요약

1. **구조적 누락 1건**: 바텀 네비게이션 바 (P1)
2. **font-weight 불일치 2건**: InterpretationCard/AdviceCard title이 semibold(600)인데 디자인은 bold(700)
3. **hover 상태 누락 2건**: ResultPage primary btn, SharedResult CTA
4. **애니메이션 차이 3건**: LoadingScreen bounce/dot/shadow pulse 타이밍
5. **의도적 개선 3건**: CardSlot filled 스타일, ErrorModal eye offset, AdviceCard opacity — 디자인에 없지만 시각적으로 나은 경우, 유지 판단 가능
6. **font-family 적용 방식**: body 상속으로 동작하므로 현재 문제 없으나 잠재 리스크

---

## 6. 디자인 에셋 참조

| 항목 | 경로 |
|---|---|
| UI 스크린 HTML + PNG (7종) | `docs/frontend/stitch_jeomhana_tarot_ai/_1/` ~ `_7/` |
| 디자인 시스템 | `docs/frontend/stitch_jeomhana_tarot_ai/mystic_dot_minimalism/DESIGN.md` |
| 타로 카드 일러스트 | `docs/frontend/stitch_jeomhana_tarot_ai/a_cute_tarot_card_*` |
| 카드 뒷면 디자인 | `docs/frontend/stitch_jeomhana_tarot_ai/a_tarot_card_back_*` |
| 카드 앞면 예시 (교황) | `docs/frontend/stitch_jeomhana_tarot_ai/v/` |
