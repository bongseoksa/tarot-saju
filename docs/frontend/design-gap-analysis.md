# 디자인-구현 갭 보완 HANDOFF

> 디자인 시안 HTML(`docs/frontend/stitch_jeomhana_tarot_ai/_*/code.html`)과 구현 코드를 CSS 속성 단위로 직접 대조한 결과.
> 일치하는 항목은 생략하고, **수정이 필요한 갭만 기재**한다.
> 작성일: 2026-05-03 | 기준 브랜치: feature/frontend

---

## 사전 지식

- 디자인 시스템: `docs/frontend/stitch_jeomhana_tarot_ai/mystic_dot_minimalism/DESIGN.md`
- 디자인 스크린 HTML+PNG: `_1/`~`_7/` (아래 매핑 참조)
- 초기 일치율: HistoryPage 99% / ErrorModal 95% / SharedResult 94% / Result·Reading 90% / Home 88% / Loading 80%
- TASK 1 완료 후: Home 95%↑ / HistoryPage 100%↑ (BottomNav 추가)
- TASK 2 완료 후: Result 92%↑ (InterpretationCard font-bold)
- TASK 3 완료 후: Result 93%↑ (AdviceCard font-bold)
- TASK 4 완료 후: Result 94%↑ (버튼 hover/duration 추가)
- TASK 5 완료 후: Result 95%↑ (mascot indicator mb-lg)

| 디자인 | 구현 파일 |
|---|---|
| `_1/` 카드 선택 | `pages/ReadingPage.tsx`, `reading/CardSlot.tsx`, `reading/CardGrid.tsx` |
| `_2/` 로딩 | `ui/LoadingScreen.tsx` |
| `_3/` 히스토리 | `pages/HistoryPage.tsx`, `history/HistoryCard.tsx` |
| `_4/` 에러 모달 | `ui/ErrorModal.tsx` |
| `_5/` 홈 | `pages/HomePage.tsx`, `ui/CategoryChip.tsx`, `ui/ThemeCard.tsx` |
| `_6/` 결과 | `pages/ResultPage.tsx`, `result/CardSummary.tsx`, `result/InterpretationCard.tsx`, `result/AdviceCard.tsx` |
| `_7/` 공유 결과 | `pages/SharedResultPage.tsx`, `shared/TimelineInterpretation.tsx` |

> 모든 파일 경로는 `apps/web/src/components/` 또는 `apps/web/src/pages/` 기준.

---

## TASK 1 — 바텀 네비게이션 바 (신규 컴포넌트)

**상태**: ✅ 완료
**디자인 출처**: `_3/code.html`, `_5/code.html` 하단 `<nav>`
**영향**: HomePage, HistoryPage에 표시 / ReadingPage, ResultPage, SharedResultPage에서 숨김

### 1-1. `components/ui/BottomNav.tsx` 신규 생성

```tsx
// 디자인 스펙 (code.html에서 추출)
<nav className="fixed bottom-0 left-0 right-0 z-50">
  <div className="max-w-md mx-auto bg-white rounded-t-3xl border-t border-zinc-100
                  shadow-[0_-4px_20px_rgba(139,92,246,0.06)]
                  flex justify-around items-center px-6 pb-6 pt-3">
    {/* 각 탭 */}
    <button className={active
      ? "flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl bg-violet-50 text-violet-500 transition-colors"
      : "flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-zinc-400 hover:text-violet-400 transition-colors"
    }>
      <Icon name="..." size={24} />
      <span className="text-[10px] font-medium">탭이름</span>
    </button>
  </div>
</nav>
```

- 4탭: 홈(`home`) / 탐색(`explore`) / 히스토리(`history`) / 설정(`settings`)
- `useLocation()`으로 현재 경로 매칭 → 활성 탭 결정
- 탭 클릭 → `useNavigate()`로 이동

### 1-2. `components/AppLayout.tsx` 수정

- BottomNav를 조건부 렌더링
- 표시 조건: pathname이 `/` 또는 `/history`일 때만
- 숨김 조건: `/reading/*`, `/result/*`, `/share/*`

### 1-3. 페이지 하단 패딩 조정

- `HomePage.tsx`: 메인 콘텐츠에 `pb-24` 추가 (BottomNav 높이 + 여백)
- `HistoryPage.tsx`: 동일하게 `pb-24` 추가

---

## TASK 2 — InterpretationCard title weight 수정

**상태**: ✅ 완료
**파일**: `components/result/InterpretationCard.tsx`
**디자인**: `_6/code.html` — `font-bold` (700)
**현재**: ~~`font-semibold` (600)~~ → `font-bold` (700)

```diff
- font-semibold
+ font-bold
```

타이틀 `<h3>` 또는 제목 요소의 `font-semibold`를 `font-bold`로 변경.

---

## TASK 3 — AdviceCard title weight 수정

**상태**: ✅ 완료
**파일**: `components/result/AdviceCard.tsx`
**디자인**: `_6/code.html` — `font-bold` (700)
**현재**: ~~`font-semibold` (600)~~ → `font-bold` (700)

```diff
- font-semibold
+ font-bold
```

타이틀 요소의 `font-semibold`를 `font-bold`로 변경.

---

## TASK 4 — ResultPage primary 버튼 hover 추가

**상태**: ✅ 완료
**파일**: `pages/ResultPage.tsx`
**디자인**: `_6/code.html` — 하단 primary 버튼에 `hover:bg-primary/90 duration-200`
**현재**: ~~`hover` 없음, `duration` 없음~~ → 적용 완료

하단 footer의 primary 버튼(flex-[2])에 추가:

```diff
- active:scale-95 transition-colors
+ hover:bg-primary/90 active:scale-95 transition-colors duration-200
```

share 버튼에도 `duration-200` 추가:

```diff
- active:scale-95
+ active:scale-95 duration-200
```

---

## TASK 5 — ResultPage mascot indicator 하단 마진 추가

**상태**: ✅ 완료
**파일**: `pages/ResultPage.tsx`
**디자인**: `_6/code.html` — mascot indicator 컨테이너에 `mb-lg`
**현재**: ~~`mb` 없음~~ → `mb-[--spacing-lg]` 적용

마스코트 인디케이터(아바타 + 말풍선) 래핑 div에 추가:

```diff
- flex items-center gap-[--spacing-sm]
+ flex items-center gap-[--spacing-sm] mb-[--spacing-lg]
```

---

## TASK 6 — ResultPage 메인 영역 스크롤바 숨김

**파일**: `pages/ResultPage.tsx`
**디자인**: `_6/code.html` — `overflow-y-auto no-scrollbar`
**현재**: 스크롤바 표시됨

메인 스크롤 컨테이너에 스크롤바 숨김 클래스 추가:

```diff
- overflow-y-auto
+ overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
```

---

## TASK 7 — SharedResultPage 한줄 요약 line-height 수정

**파일**: `pages/SharedResultPage.tsx`
**디자인**: `_7/code.html` — 한줄 요약 제목에 `leading-tight` (1.25)
**현재**: `leading-[1.4]`

```diff
- leading-[1.4]
+ leading-tight
```

---

## TASK 8 — SharedResultPage CTA 버튼 hover 추가

**파일**: `pages/SharedResultPage.tsx`
**디자인**: `_7/code.html` — `hover:scale-[0.98] transition-transform`
**현재**: hover 없음

하단 CTA 버튼에 추가:

```diff
- active:scale-95 transition-transform
+ hover:scale-[0.98] active:scale-95 transition-transform
```

---

## TASK 9 — SharedResultPage 하단 브랜딩 추가

**파일**: `pages/SharedResultPage.tsx`
**디자인**: `_7/code.html` — CTA 버튼 아래에 브랜딩 텍스트
**현재**: 없음

CTA 버튼 아래에 추가:

```tsx
<p className="text-center text-[length:--font-size-caption] leading-[1.4]
              tracking-[0.01em] text-zinc-400 mt-[--spacing-sm]">
  JeomHana AI Tarot
</p>
```

---

## TASK 10 — LoadingScreen 바운스 커스텀 애니메이션

**파일**: `components/ui/LoadingScreen.tsx` + `tailwind.config.ts` (또는 CSS)
**디자인**: `_2/code.html` — 커스텀 bounce (0.8s, translateY -24px)
**현재**: 기본 `animate-bounce` (1s, translateY -25%)

### 10-1. tailwind.config.ts에 커스텀 keyframe 추가

```js
keyframes: {
  'bounce-custom': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-24px)' },
  },
  'shadow-pulse': {
    '0%, 100%': { transform: 'scaleX(1)', opacity: '0.3' },
    '50%': { transform: 'scaleX(0.7)', opacity: '0.15' },
  },
},
animation: {
  'bounce-custom': 'bounce-custom 0.8s ease-in-out infinite',
  'shadow-pulse': 'shadow-pulse 0.8s ease-in-out infinite',
},
```

### 10-2. LoadingScreen.tsx 수정

캐릭터 바운스:

```diff
- animate-bounce
+ animate-bounce-custom
```

### 10-3. shadow pulse 요소 추가

캐릭터 아래에 그림자 요소 추가:

```tsx
<div className="w-16 h-3 bg-black/10 blur-sm rounded-[100%] mt-4 animate-shadow-pulse" />
```

### 10-4. 로딩 도트 duration 수정

```diff
- animate-pulse
+ animate-[pulse_1.5s_ease-in-out_infinite]
```

3개 도트 모두 동일 적용 (delay는 기존 유지: 0ms, 200ms, 400ms).

### 10-5. footer 텍스트 추가

컴포넌트 하단에 추가:

```tsx
<div className="fixed bottom-12 left-0 right-0 flex justify-center opacity-40">
  <span className="text-[length:--font-size-caption] leading-[1.4]
                    tracking-[0.01em] text-on-surface-variant">
    JeomHana AI Tarot System
  </span>
</div>
```

---

## TASK 11 — ErrorModal mouth 스타일 수정

**파일**: `components/ui/ErrorModal.tsx`
**디자인**: `_4/code.html` — `w-8 h-3 bg-white/20 rounded-full` (채움형)
**현재**: `w-6 h-2 border-b-2 border-white/60 rounded-full` (테두리형)

```diff
- w-6 h-2 border-b-2 border-white/60 rounded-full
+ w-8 h-3 bg-white/20 rounded-full
```

---

## TASK 12 — ReadingPage disabled 버튼 shadow 추가

**파일**: `pages/ReadingPage.tsx`
**디자인**: `_1/code.html` — disabled 상태 버튼에 `shadow-lg shadow-black/5`
**현재**: shadow 없음

비활성 상태 버튼에 추가:

```diff
- bg-zinc-200 text-zinc-400 cursor-not-allowed
+ bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-lg shadow-black/5
```

---

## 판단 필요 (의도적 개선 가능성)

아래 3건은 디자인에 없지만 구현에서 추가된 스타일. 시각적으로 나을 수 있으므로 유지/제거를 판단할 것.

| # | 파일 | 현재 (디자인에 없음) | 판단 |
|---|---|---|---|
| A | `CardSlot.tsx` (filled 상태) | `shadow-lg border-4 border-white` 추가됨 | 카드에 입체감 부여 — **유지 권장** |
| B | `ErrorModal.tsx` (눈) | `-translate-y-1` 추가됨 | 눈 위치 미세 보정 — **유지 권장** |
| C | `AdviceCard.tsx` (body) | `opacity-90` 추가됨 | 본문 대비 살짝 낮춤 — **유지 권장** |

---

## 보류 (Phase 3~4 연계)

| # | 항목 | 연계 Phase | 비고 |
|---|---|---|---|
| D | 미완료 세션 토스트 (HomePage) | Phase 3 | localStorage 세션 상태에 의존 |
| E | AI 스트리밍 타이핑 효과 (ResultPage) | Phase 4 | 마스코트 말풍선 타이핑 애니메이션 |

---

## 참고: 무시해도 되는 차이

아래는 표기법 차이이거나 동작에 영향 없는 항목이므로 수정 불필요.

| 항목 | 디자인 | 구현 | 이유 |
|---|---|---|---|
| max-width 표기 | `max-w-md` | `max-w-[448px]` | 동일 값 (448px) |
| spacing 표기 | `gap-sm` | `gap-[--spacing-sm]` | CSS var로 동일 값 해소 |
| font-family 적용 | `font-display-title` | `text-[length:--font-size-*]` | body에 Pretendard 설정되어 상속 동작 |
| ReadingPage height | flex 암시적 | `calc(100vh - 64px)` | 결과 동일 |
| scrollbar thumb color | `rgba(139,92,246,0.1)` | `bg-violet-100` | 미세 차이, 시각적 동일 |
| scrollbar thumb radius | `10px` | `rounded-full` | 시각적 동일 |
