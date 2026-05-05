# 디자인-구현 갭 분석

> **무효화됨** — 이 문서는 기존 Stitch HTML 기반 구현과의 비교 결과임.
> 프론트엔드를 deep-research-report 기반으로 전면 재작업하므로 이 문서의 내용은 더 이상 유효하지 않음.
> 재작업 완료 후 새 디자인 기준으로 갱신 예정.
>
> 이전 기록 (참고용, 최종 갱신: 2026-05-03 | 기준 브랜치: feature/frontend)

---

## 기준 소스

### Stitch MCP (디자인 기준점)

- 프로젝트: JeomHana Tarot AI (`1178828992586013718`)
- 디자인 시스템: Mystic Dot Minimalism (프로젝트 designTheme.designMd)
- 스크린 HTML: `docs/design/stitch/screens/*.html`
- 스크린샷: `docs/design/stitch/screenshots/*.png`

### 스크린 매핑

| # | Stitch 스크린 | HTML 파일 | 구현 파일 |
|---|-------------|-----------|---------|
| 1 | 홈 - 점하나 (`32f51da6`) | `01-home.html` | `pages/HomePage.tsx`, `ui/CategoryChip.tsx`, `ui/ThemeCard.tsx` |
| 2 | 카드 뽑기 - 점하나 (`16488b24`) | `02-card-draw.html` | `pages/ReadingPage.tsx`, `reading/CardSlot.tsx`, `reading/CardGrid.tsx` |
| 3 | 히스토리 - 점하나 (`25ff684b`) | `03-history.html` | `pages/HistoryPage.tsx`, `history/HistoryCard.tsx` |
| 4 | 결과 - 점하나 (`a3a7a4dd`) | `04-result.html` | `pages/ResultPage.tsx`, `result/CardSummary.tsx`, `result/InterpretationCard.tsx`, `result/AdviceCard.tsx` |
| 5 | 공유 결과 - 점하나 (`b1eae62a`) | `05-share-result.html` | `pages/SharedResultPage.tsx`, `shared/TimelineInterpretation.tsx` |
| 6 | 오류 안내 - 점하나 (`2f2fbc5e`) | `06-error.html` | `ui/ErrorModal.tsx` |
| 7 | 로딩 - 점하나 (`1d89cc83`) | `07-loading.html` | `ui/LoadingScreen.tsx` |

> 모든 구현 파일 경로는 `apps/web/src/components/` 또는 `apps/web/src/pages/` 기준.

---

## 전체 일치율 요약

| 스크린 | 일치율 | 비고 |
|--------|--------|------|
| 홈 | 95% | BottomNav 추가, 캐릭터는 CSS 도형 |
| 카드 뽑기 | 92% | 3장 선택 시 2버튼 (스펙 우선), 카드 뒷면 에셋 차이 |
| 히스토리 | 99% | 검색 아이콘 제거 (스펙 우선) |
| 결과 | 97% | 헤더 우측 share 아이콘 (스펙 우선), 마스코트 CSS 도형 |
| 공유 결과 | 97% | CTA hover 추가 |
| 오류 안내 | 98% | 캐릭터 CSS 도형 |
| 로딩 | 95% | 커스텀 bounce + shadow-pulse |

---

## 의도적 차이 (스펙 우선 결정)

> 스펙(`docs/specs/02-taro-mvp.md`)과 Stitch MCP가 불일치할 때, **스펙을 우선**한 항목.
> 이 항목들은 수정 대상이 아님.

| # | 항목 | Stitch MCP | React 구현 | 근거 |
|---|------|-----------|-----------|------|
| S1 | 결과 헤더 우측 아이콘 | `history` 아이콘 | `share` 아이콘 | 스펙 IA line 38: "공유 아이콘" |
| S2 | 히스토리 검색 아이콘 | `search` 아이콘 존재 | 없음 | 스펙 미정의 → 미구현 |
| S3 | 카드 뽑기 3장 선택 시 버튼 | 단일 disabled 버튼만 표시 | "다시 선택" + "결과 보기" 2버튼 | 스펙 line 104 |
| S4 | 미완료 세션 토스트 | `01-home.html`에 토스트 존재 | 미구현 | Phase 3 이관 (localStorage 의존) |

---

## 에셋 차이 (구조적 제약)

> Stitch MCP는 AI 생성 이미지를 사용하나, 실제 구현은 CSS 도형 또는 로컬 에셋 사용.
> 추후 실제 캐릭터 일러스트 확보 시 교체 대상.

| # | 항목 | Stitch MCP | React 구현 | 비고 |
|---|------|-----------|-----------|------|
| A1 | 점하나 캐릭터 (홈 Hero) | AI 생성 이미지 (Google URL) | CSS 원형 도형 (`bg-primary rounded-full`) | 캐릭터 에셋 확보 시 교체 |
| A2 | 마스코트 아바타 (결과) | AI 생성 마스코트 이미지 | CSS 원형 + 눈/입 도형 | 동일 |
| A3 | 에러 캐릭터 (오류 모달) | AI 생성 슬픈 마스코트 | CSS 원형 + 눈/입 도형 | 동일 |
| A4 | 타로 카드 이미지 (결과/공유) | AI 생성 타로카드 일러스트 | 로컬 PNG 에셋 22장 | 자체 에셋 사용 |
| A5 | 카드 뒷면 (카드 뽑기) | 보라색 면 + 흰색 원 아이콘 | `card-back.png` 이미지 | 자체 에셋 사용 |

---

## 구조적 이슈

### I1. BottomNav 존재 — 스펙 불일치 (결정 필요)

**상태**: 결정 필요

- **스펙**: `02-taro-mvp.md` — "탭바 없음 — 선형 플로우에 탭바 불필요"
- **Stitch MCP**: 4탭 BottomNav 존재 (홈/타로/히스토리/내정보)
- **현재 구현**: BottomNav 존재 (홈/히스토리에서만 표시)
- **Phase 2 계획서**: "구현하지 않음"으로 명시

**선택지:**
1. BottomNav 제거 → 스펙 준수, 선형 플로우 원칙 유지
2. BottomNav 유지 → Stitch 디자인 채택, UX 편의 (홈↔히스토리 직접 이동)

### I2. AppLayout max-width 위치

**상태**: 기능 동일, 문서만 차이

- **Phase 1 계획서**: `AppLayout`에서 `max-w-md mx-auto` 제공
- **현재 구현**: 각 페이지에서 개별적으로 `max-w-[448px] mx-auto` 적용
- **영향**: 없음 (기능적으로 동일)

---

## 완료된 TASK 이력 (TASK 1~12)

> 이전 디자인 HTML 기반으로 수행한 미세 보정 작업.
> 모든 항목 완료됨.

| TASK | 내용 | 파일 | 변경 |
|------|------|------|------|
| 1 | BottomNav 신규 생성 | `ui/BottomNav.tsx`, `AppLayout.tsx` | 홈/히스토리에 BottomNav 추가 |
| 2 | InterpretationCard title weight | `result/InterpretationCard.tsx` | `font-semibold` → `font-bold` |
| 3 | AdviceCard title weight | `result/AdviceCard.tsx` | `font-semibold` → `font-bold` |
| 4 | ResultPage 버튼 hover | `pages/ResultPage.tsx` | `hover:bg-primary/90 duration-200` 추가 |
| 5 | ResultPage mascot mb-lg | `pages/ResultPage.tsx` | 마스코트 인디케이터 `mb-[--spacing-lg]` 추가 |
| 6 | ResultPage 스크롤바 숨김 | `pages/ResultPage.tsx` | `[&::-webkit-scrollbar]:hidden` 추가 |
| 7 | SharedResultPage leading-tight | `pages/SharedResultPage.tsx` | 한줄 요약 `leading-tight` 적용 |
| 8 | SharedResultPage CTA hover | `pages/SharedResultPage.tsx` | `hover:scale-[0.98]` 추가 |
| 9 | SharedResultPage 브랜딩 | `pages/SharedResultPage.tsx` | 이미 구현됨 (작업 불필요) |
| 10 | LoadingScreen 애니메이션 | `ui/LoadingScreen.tsx`, `index.css` | 커스텀 bounce + shadow-pulse + 도트 duration + footer |
| 11 | ErrorModal mouth 스타일 | `ui/ErrorModal.tsx` | 테두리형 → 채움형 (`bg-white/20`) |
| 12 | ReadingPage disabled shadow | `pages/ReadingPage.tsx` | `shadow-lg shadow-black/5` 추가 |

---

## 화면별 상세 대조 결과

### 홈 (`01-home.html` vs `HomePage.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| Hero 그래디언트 | `from-[#FFFDEB] to-[#FDF4FF]` | 동일 | ✅ |
| Hero 라운딩 | `rounded-[32px]` | 동일 | ✅ |
| CTA 버튼 | `bg-primary text-on-primary px-lg py-md rounded-full shadow-lg shadow-primary/20` | 동일 | ✅ |
| 카테고리 칩 active | `bg-primary text-on-primary rounded-full` | 동일 | ✅ |
| 카테고리 칩 inactive | `bg-surface-container-low text-on-surface-variant rounded-full hover:bg-surface-container-high` | 동일 | ✅ |
| 테마 카드 | `bg-white p-lg rounded-[24px] shadow-sm border border-zinc-100` | 동일 | ✅ |
| 테마 카드 hover | `hover:border-primary-fixed transition-colors` | 동일 | ✅ |
| 카테고리 태그 색상 | `#FCE7F3/#9D174D` (연애), `#E0F2FE/#075985` (직장) 등 | 동일 (getCategoryMeta) | ✅ |
| 푸터 | `border-t border-zinc-100 pt-lg` | 동일 | ✅ |
| 캐릭터 | AI 이미지 | CSS 도형 | ⚠️ A1 |

### 카드 뽑기 (`02-card-draw.html` vs `ReadingPage.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 배경 | `bg-amber-50/30` | 동일 | ✅ |
| 빈 슬롯 | `border-2 border-dashed border-violet-200 bg-white/50` | 동일 | ✅ |
| 선택 슬롯 | `bg-primary shadow-lg rounded-lg border-4 border-white` | 동일 | ✅ |
| 카드 그리드 | `grid grid-cols-4 gap-sm` | 동일 | ✅ |
| 마지막 2장 | `col-span-4 flex justify-center gap-sm` | 동일 | ✅ |
| 카드 hover | `hover:shadow-md hover:-translate-y-1 transition-all active:scale-95` | 동일 | ✅ |
| 선택 dimmed | `opacity-40 grayscale-[0.2]` | 동일 | ✅ |
| disabled 버튼 | `bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-lg shadow-black/5` | 동일 | ✅ |
| 스크롤 마스크 | `mask-image: linear-gradient(...)` | 동일 | ✅ |
| 배경 데코 | `bg-violet-100/40 blur-3xl` + `bg-amber-100/40 blur-3xl` | 동일 | ✅ |
| 3장 선택 시 | 단일 버튼 | 2버튼 (스펙 우선) | ⚠️ S3 |
| 카드 뒷면 | 보라색+원 아이콘 | card-back.png | ⚠️ A5 |

### 결과 (`04-result.html` vs `ResultPage.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 카드 요약 컨테이너 | `bg-white rounded-[32px] p-md shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-violet-50` | 동일 | ✅ |
| 현재 카드 강조 | `shadow-md border-2 border-primary-fixed ring-4 ring-primary-fixed/20` | 동일 | ✅ |
| 마스코트 말풍선 | `rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm border border-zinc-100` | 동일 | ✅ |
| 해석 카드 | `bg-white p-lg rounded-[24px] border border-zinc-100 shadow-sm` | 동일 | ✅ |
| 현재 해석 강조 | `border border-primary-fixed/50 ring-1 ring-primary-fixed/20` | 동일 | ✅ |
| 조언 카드 | `bg-primary-container p-lg rounded-[24px] text-on-primary-container shadow-md` | 동일 | ✅ |
| 광고 배너 | `bg-zinc-100 rounded-xl h-24 border border-zinc-200 border-dashed` | 동일 | ✅ |
| 공유 버튼 | `flex-1 h-14 bg-white border border-violet-200 text-primary rounded-2xl` | 동일 | ✅ |
| CTA 버튼 | `flex-[2] h-14 bg-primary text-white rounded-2xl shadow-[0_8px_16px_rgba(107,56,212,0.2)]` | 동일 | ✅ |
| 헤더 우측 | `history` 아이콘 | `share` 아이콘 (스펙 우선) | ⚠️ S1 |

### 공유 결과 (`05-share-result.html` vs `SharedResultPage.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 로고 헤더 | 중앙 정렬, `flex justify-center items-center h-16` | 동일 | ✅ |
| 인사 말풍선 | `rounded-2xl rounded-tl-none shadow-sm max-w-[85%]` | 동일 | ✅ |
| 카드 그리드 | `grid grid-cols-3 gap-gutter` | 동일 | ✅ |
| 현재 카드 확대 | `scale-110 z-10` | 동일 | ✅ |
| 한줄 요약 | `bg-primary-fixed-dim/20 border border-primary-fixed-dim rounded-2xl p-lg text-center` | 동일 | ✅ |
| 타임라인 과거/미래 | `border-l-2 border-zinc-100` + `bg-zinc-200 border-4 border-white` | 동일 | ✅ |
| 타임라인 현재 | `border-l-2 border-primary-fixed-dim` + `bg-primary border-4 border-white` | 동일 | ✅ |
| 조언 카드 | `bg-surface-container rounded-2xl p-lg` + `lightbulb` 아이콘 | 동일 | ✅ |
| CTA 버튼 | `w-full h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20` | 동일 | ✅ |
| CTA hover | `hover:scale-[0.98] active:scale-95 transition-transform` | 동일 | ✅ |
| 서비스 캡션 | "AI 타로 서비스 점하나(JeomHana)" | 동일 | ✅ |

### 히스토리 (`03-history.html` vs `HistoryPage.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 요약 통계 카드 | `bg-white p-md rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-zinc-50` | 동일 | ✅ |
| 히스토리 카드 | `bg-white p-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white` | 동일 | ✅ |
| 카테고리 태그 | `bg-pink-50 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold` | 동일 | ✅ |
| 카드 썸네일 | `w-14 h-20 rounded-lg border border-zinc-50` | 동일 | ✅ |
| 빈 상태 | HTML 주석 처리 | EmptyState 컴포넌트 구현 | ✅ 개선 |
| 검색 아이콘 | `search` 아이콘 존재 | 없음 (스펙 우선) | ⚠️ S2 |

### 오류 안내 (`06-error.html` vs `ErrorModal.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 오버레이 | `bg-zinc-900/40 backdrop-blur-sm` | 동일 | ✅ |
| 모달 | `max-w-xs rounded-[32px] shadow-[0_20px_50px_rgba(107,56,212,0.15)]` | 동일 | ✅ |
| 제목 | "죄송해요!" | 동일 | ✅ |
| 메시지 | "일시적으로 해석을 불러오지 못했어요..." | 동일 | ✅ |
| 주 버튼 | `bg-primary text-on-primary rounded-xl` "홈으로 돌아가기" | 동일 | ✅ |
| 보조 버튼 | `bg-transparent text-outline` "다시 시도" | 동일 | ✅ |
| 캐릭터 | AI 생성 이미지 | CSS 도형 (눈+입) | ⚠️ A3 |

### 로딩 (`07-loading.html` vs `LoadingScreen.tsx`)

| 요소 | Stitch MCP 클래스 | React 구현 | 판정 |
|------|------------------|-----------|------|
| 배경 | `bg-[#FAFAF9]` | 동일 | ✅ |
| 바운스 | `bounce-custom 0.8s ease-in-out infinite` | 동일 | ✅ |
| 그림자 펄스 | `shadow-pulse 0.8s ease-in-out infinite` | 동일 | ✅ |
| 캐릭터 | `w-24 h-24 bg-primary rounded-full` + 눈/입 | 동일 | ✅ |
| 텍스트 | "점하나" + "당신을 위한 점, 하나 준비 중" | 동일 | ✅ |
| 도트 | 3개, `pulse 1.5s infinite` + 200ms/400ms delay | 동일 | ✅ |
| 하단 | "JeomHana AI Tarot System" | 동일 | ✅ |
| 터치 차단 | `touch-none pointer-events-none select-none` | 동일 | ✅ |

---

## 의도적 구현 개선 (디자인에 없으나 유지)

| # | 파일 | 추가된 스타일 | 판단 |
|---|------|-------------|------|
| A | `CardSlot.tsx` (filled) | `shadow-lg border-4 border-white` | 카드 입체감 — **유지** |
| B | `ErrorModal.tsx` (눈) | `-translate-y-1` | 눈 위치 미세 보정 — **유지** |
| C | `AdviceCard.tsx` (body) | `opacity-90` | 본문 대비 미세 조정 — **유지** |

---

## 보류 (Phase 3~4 연계)

| # | 항목 | 연계 Phase | 비고 |
|---|------|-----------|------|
| D | 미완료 세션 토스트 (HomePage) | Phase 3 | localStorage 세션 상태에 의존 |
| E | AI 스트리밍 타이핑 효과 (ResultPage) | Phase 4 | 마스코트 말풍선 타이핑 애니메이션 |
| F | 카드 4단계 애니메이션 (ReadingPage) | Phase 4 | 기대감→몰입→설렘→완성감 |
| G | 광고 게이트 (Loading → 광고 → 결과) | Phase 3 | 광고 로드 로직에 의존 |

---

## 무시해도 되는 차이 (표기법/동작 동일)

| 항목 | Stitch MCP | React 구현 | 이유 |
|------|-----------|-----------|------|
| max-width 표기 | `max-w-md` | `max-w-[448px]` | 동일 값 (448px) |
| spacing 표기 | `gap-sm`, `px-container-padding` | `gap-[--spacing-sm]`, `px-[--spacing-container-padding]` | Tailwind v3 vs v4 CSS var 문법 차이 |
| font-family 적용 | `font-display-title` | `text-[length:--font-size-*]` | body에 Pretendard 설정되어 상속 동작 |
| ReadingPage height | flex 암시적 | `calc(100vh - 64px)` | 결과 동일 |
| dark mode 클래스 | `dark:bg-zinc-950/80` 등 포함 | 미포함 | 스펙에 "dark mode 제외" 명시 |
| Plus Jakarta Sans | 헤더 `font-['Plus_Jakarta_Sans']` | 동일 | ✅ |
