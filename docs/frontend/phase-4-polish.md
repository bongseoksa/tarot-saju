# Phase 4: 애니메이션 + 폴리싱

> 목표: Phase 3까지 완성된 기능 코드에 Framer Motion 기반 애니메이션과 UX 폴리싱을 적용한다. 카드 선택 4단계 경험, 페이지 전환, 모달 진입, 해석 타이핑 효과를 구현한다.
> 완료 기준: 스펙(`02-taro-mvp.md` 카드 선택 경험 4단계)이 모두 구현되고, 모든 애니메이션이 `prefers-reduced-motion` 시 비활성화되며, tsc/lint/test/build 통과. chrome-devtools 모바일(390x844) 검증 완료.
> **상태: 코드 완료** (4-1 ~ 4-7 전체 구현, 126 tests PASS, chrome-devtools 검증 완료)

---

## 전제

- Phase 3 완료: 전체 비즈니스 로직(Zustand, AI 스트리밍, 공유, 미완료 세션) 연결 완료, 113 tests PASS
- framer-motion v12 설치 완료 (Phase 0), 아직 미사용
- 기존 CSS 애니메이션: `bounce-custom`, `shadow-pulse` (LoadingScreen), `active:scale-95` (버튼), `hover:-translate-y-1` (카드)
- 스펙 참조: `docs/specs/02-taro-mvp.md` 594~622줄 (카드 선택 경험 4단계)
- 이 Phase에서는 **애니메이션/폴리싱만** 추가. 비즈니스 로직 변경 없음
- TDD: 애니메이션 로직이 포함된 컴포넌트는 테스트 갱신. 순수 시각 효과는 chrome-devtools 검증

---

## TDD 및 검증 프로토콜

### TDD 사이클

애니메이션 Phase는 시각적 결과물이 핵심이므로 TDD와 chrome-devtools 검증을 병행한다.

```
1. 기존 테스트 통과 확인 (regression 방지)
2. 컴포넌트 Props/상태 변경이 있는 경우 → 테스트 먼저 수정 → RED → 구현 → GREEN
3. 순수 시각 효과 → chrome-devtools 스크린샷 + 콘솔 에러 0건 확인
4. LINT → `pnpm run lint` 통과
```

### context7 MCP — API 확인

| 서브스텝 | 확인 대상 | 확인 항목 |
|---|---|---|
| 4-1 | `framer-motion` v12 | `motion`, `AnimatePresence`, `useAnimate`, `spring` 설정 |
| 4-2 | `framer-motion` v12 | `layoutId`, `layout` prop, `LayoutGroup` |
| 4-5 | `framer-motion` v12 | `AnimatePresence` + `mode="wait"` 라우트 전환 패턴 |

### chrome-devtools MCP — 런타임 검증

모든 서브스텝 완료 후 검증:

```
1. 개발 서버 실행 확인 (pnpm run dev)
2. chrome-devtools: 모바일 에뮬레이션 (390x844, 3x DPR)
3. chrome-devtools: 해당 페이지 네비게이션
4. chrome-devtools: 콘솔 에러/경고 0건 확인
5. chrome-devtools: 애니메이션 동작 스크린샷 확인
6. chrome-devtools: prefers-reduced-motion 에뮬레이션 → 애니메이션 비활성화 확인
```

---

## 4-1. 모션 기반 설정 + 접근성

> Framer Motion 공통 설정과 `prefers-reduced-motion` 접근성 대응

### 구현 대상

**`src/utils/motionConfig.ts`** — 공통 모션 프리셋

```ts
// Spring presets
export const SPRING_CARD = { type: "spring", stiffness: 300, damping: 24 };
export const SPRING_BOUNCE = { type: "spring", stiffness: 400, damping: 20 };
export const SPRING_GENTLE = { type: "spring", stiffness: 200, damping: 30 };

// Duration presets
export const DURATION_FAST = 0.15;
export const DURATION_NORMAL = 0.3;
export const DURATION_SLOW = 0.5;

// Fade preset
export const FADE_IN = { initial: { opacity: 0 }, animate: { opacity: 1 } };
```

**`src/hooks/useReducedMotion.ts`** — 접근성 훅

- `framer-motion`의 `useReducedMotion()` 래핑
- 모든 애니메이션 컴포넌트에서 이 훅으로 분기
- `prefers-reduced-motion: reduce` → 즉시 최종 상태 표시 (애니메이션 건너뜀)

### 작업

- [x] `motionConfig.ts` — 스프링/듀레이션/페이드 프리셋 정의
- [x] `useReducedMotion.ts` — 접근성 훅 구현 + 테스트
- [x] 기존 테스트 regression 확인

**검증:** `pnpm run test` 통과, lint 통과

---

## 4-2. 카드 선택 4단계 애니메이션

> 스펙 핵심: `02-taro-mvp.md` 594~622줄. 서비스의 핵심 경험.

### 1단계 — 고르기 전 (기대감)

**대상:** `CardGrid.tsx` 카드 버튼

| 효과 | 구현 |
|---|---|
| 호버/터치 시 카드 떠오름 | `whileHover={{ y: -8, scale: 1.03 }}` + `SPRING_GENTLE` |
| 미세한 빛남 | `box-shadow` 트랜지션 — `0 0 12px rgba(139,92,246,0.15)` |

**변경 파일:** `CardGrid.tsx` — `<button>` → `<motion.button>`

### 2단계 — 선택 순간 (몰입)

**대상:** `CardGrid.tsx` + `ReadingPage.tsx`

| 효과 | 구현 |
|---|---|
| 카드 위로 떠오르며 뒤집힘 | `rotateY: 180` + `y: -20` + `scale: 1.05` → `1.0` (0.5s) |
| 주변 카드 어두워짐 | 선택 진행 중 상태 추가 → 다른 카드 `opacity: 0.4` + `filter: brightness(0.7)` |
| 카드 뒷면 → 앞면 전환 | `rotateY` 90도 시점에서 이미지 교체 (`onUpdate` 콜백) |
| 스케일 펄스 | `scale: [1, 1.05, 1]` (0.3s) |

**구현 방식:**
- `CardGrid`에 `selectingCardId` 상태 추가 (선택 애니메이션 진행 중인 카드)
- `onCardClick` → 즉시 `selectCard` 호출 대신, 애니메이션 완료 후 콜백으로 호출
- `AnimatePresence` + `motion.div`로 플립 시퀀스 구현

### 3단계 — 공개 (설렘)

**대상:** `CardGrid.tsx` (플립 후 앞면 노출 시점)

| 효과 | 구현 |
|---|---|
| 앞면 글로우 | `box-shadow: 0 0 20px rgba(139,92,246,0.3)` → 페이드아웃 |
| 역방향 보라 글로우 | `isReversed` → 보라 계열 글로우 + `"역방향"` 라벨 `opacity: 0 → 1` |
| 카드명 페이드인 | 하단 카드명 `y: 8, opacity: 0 → y: 0, opacity: 1` (0.3s delay) |

### 4단계 — 자리잡기 (완성감)

**대상:** `CardGrid.tsx` → `CardSlot.tsx` 이동

| 효과 | 구현 |
|---|---|
| 상단 슬롯으로 이동 | Framer Motion `layoutId={`card-${cardId}`}` 공유 레이아웃 |
| 슬롯 안착 바운스 | `SPRING_BOUNCE` (stiffness: 400, damping: 20) |
| 위치 라벨 활성화 | 라벨 `opacity: 0 → 1` + `scale: 0.8 → 1` (0.2s delay) |

**구현 방식:**
- `CardGrid`와 `CardSlot`에 동일 `layoutId` 부여 → Framer Motion이 자동으로 위치 보간
- `ReadingPage`를 `LayoutGroup`으로 감싸기
- `CardSlot`의 빈 슬롯 → 채워진 슬롯 전환에 `AnimatePresence` 적용

### 상태 흐름

```
idle → selecting (2단계 시작) → revealing (3단계) → settling (4단계) → idle
```

- `selecting`: 클릭된 카드의 플립 애니메이션 재생. 다른 카드 입력 무시
- `revealing`: 앞면 글로우 + 카드명 표시
- `settling`: layoutId로 슬롯 이동
- 각 단계 전환은 `onAnimationComplete` 콜백으로 제어

### 작업

- [x] `CardGrid.tsx` — `motion.button` 전환, 1~3단계 애니메이션 구현
- [x] `CardSlot.tsx` — `motion.div` 전환, `layoutId` 적용, 바운스 안착
- [x] `ReadingPage.tsx` — `LayoutGroup` 래핑, 선택 애니메이션 상태 관리
- [x] `CardGrid.test.tsx` — Props 변경에 따른 테스트 갱신
- [x] `CardSlot.test.tsx` — Props 변경에 따른 테스트 갱신
- [x] `ReadingPage.test.tsx` — 애니메이션 상태 반영 테스트 갱신

**검증:** chrome-devtools에서 카드 선택 전체 흐름 스크린샷, 콘솔 에러 0건

---

## 4-3. 모달 진입/퇴장 애니메이션

> ErrorModal, PendingSessionModal에 부드러운 등장/퇴장 효과 적용

### 구현 대상

**`ErrorModal.tsx`**

| 효과 | 구현 |
|---|---|
| 배경 페이드인 | `opacity: 0 → 1` (0.2s) |
| 모달 스케일업 | `scale: 0.9, opacity: 0 → scale: 1, opacity: 1` + `SPRING_CARD` |
| 퇴장 | `scale: 0.95, opacity: 0` (0.15s) |

**`PendingSessionModal.tsx`**

| 효과 | 구현 |
|---|---|
| 배경 페이드인 | `opacity: 0 → 1` (0.2s) |
| 모달 슬라이드업 | `y: 20, opacity: 0 → y: 0, opacity: 1` + `SPRING_GENTLE` |
| 퇴장 | `y: 10, opacity: 0` (0.15s) |

**구현 방식:**
- 모달 호출부에서 `AnimatePresence`로 감싸기 (마운트/언마운트 애니메이션)
- `motion.div`로 배경(backdrop)과 모달 패널을 분리
- `useReducedMotion` → `true`이면 즉시 표시

### 작업

- [x] `ErrorModal.tsx` — `motion.div` 전환, 스케일업 진입
- [x] `PendingSessionModal.tsx` — `motion.div` 전환, 슬라이드업 진입
- [x] 모달 호출부 (`ReadingPage`, `HomePage`) — `AnimatePresence` 래핑
- [x] `ErrorModal.test.tsx` — 기존 테스트 regression 확인
- [x] `PendingSessionModal.test.tsx` — 기존 테스트 regression 확인

**검증:** chrome-devtools에서 모달 열기/닫기 스크린샷, 콘솔 에러 0건

---

## 4-4. 해석 타이핑 효과

> AI 해석 텍스트가 한 글자씩 나타나는 타이핑 효과. SSE 스트리밍 중 실시간 적용.

### 구현 대상

**`src/components/result/StreamingText.tsx`** — 새 컴포넌트

| Props | 설명 |
|---|---|
| `text: string` | 표시할 텍스트 (스트리밍 중 점진적으로 증가) |
| `isStreaming: boolean` | 스트리밍 진행 중 여부 |

| 효과 | 구현 |
|---|---|
| 텍스트 점진 표시 | `text` props 변경 시 새로 추가된 부분만 페이드인 |
| 커서 깜빡임 | 스트리밍 중 마지막에 `▍` 커서 (CSS `animate-pulse`) |
| 스트리밍 완료 | 커서 제거, 전체 텍스트 표시 |

**구현 방식:**
- `useRef`로 이전 텍스트 길이 추적
- 새로 추가된 문자열을 `<span>` + `opacity: 0 → 1` (0.1s)로 애니메이션
- `prefers-reduced-motion` → 즉시 전체 표시, 커서 없음

**`ResultPage.tsx` 변경:**
- 기존 `<p>{interpretation}</p>` → `<StreamingText text={interpretation} isStreaming={phase === "streaming"} />`

### 작업

- [x] `StreamingText.tsx` — 타이핑 효과 컴포넌트
- [x] `StreamingText.test.tsx` — 텍스트 렌더링, 커서 표시/숨김 테스트
- [x] `ResultPage.tsx` — `StreamingText` 적용

**검증:** chrome-devtools에서 결과 페이지 텍스트 표시 확인, 콘솔 에러 0건

---

## 4-5. 페이지 전환 애니메이션

> React Router 라우트 변경 시 부드러운 전환 효과

### 구현 대상

**`App.tsx`** — `AnimatePresence` + 라우트 래핑

| 전환 | 방향 | 효과 |
|---|---|---|
| 홈 → 카드 뽑기 | 전진 | 우→좌 슬라이드 + 페이드 (0.3s) |
| 카드 뽑기 → 결과 | 전진 | 페이드 (0.3s) — 로딩 화면이 중간에 있으므로 단순 페이드 |
| 결과 → 홈 | 후퇴 | 좌→우 슬라이드 + 페이드 (0.3s) |
| 홈 → 히스토리 | 전진 | 우→좌 슬라이드 + 페이드 (0.3s) |
| 히스토리 → 결과 | 전진 | 우→좌 슬라이드 + 페이드 (0.3s) |

**구현 방식:**
- `AnimatePresence mode="wait"` + `useLocation()`으로 라우트 key 설정
- 각 페이지에 `motion.div` 래퍼 + `initial/animate/exit` variants
- 전진/후퇴 방향은 라우트 depth 비교로 결정 (간단한 유틸)
- `useReducedMotion` → `true`이면 즉시 전환

### 작업

- [x] `App.tsx` — `AnimatePresence` + `useLocation` 적용
- [x] `src/components/PageTransition.tsx` — 페이지 래퍼 컴포넌트 (direction 기반 variants)
- [x] 각 페이지 — `PageTransition` 래핑
- [x] 기존 페이지 테스트 regression 확인

**검증:** chrome-devtools에서 페이지 간 네비게이션 전환 확인, 콘솔 에러 0건

---

## 4-6. 결과 페이지 섹션 순차 등장

> 결과 페이지의 각 섹션(카드 요약, 마스코트, 해석, 조언, 광고)이 스크롤에 따라 순차적으로 나타남

### 구현 대상

**`ResultPage.tsx`** — 각 섹션에 stagger 애니메이션

| 섹션 | 딜레이 | 효과 |
|---|---|---|
| CardSummary | 0s | `y: 20, opacity: 0 → y: 0, opacity: 1` |
| 마스코트 버블 | 0.1s | `y: 20, opacity: 0 → y: 0, opacity: 1` |
| 해석 텍스트 | 0.2s | `y: 20, opacity: 0 → y: 0, opacity: 1` |
| AdviceCard | 0.3s | `y: 20, opacity: 0 → y: 0, opacity: 1` + `scale: 0.98 → 1` |

**구현 방식:**
- `motion.section` + `variants` + `staggerChildren: 0.1`
- 부모 `motion.div`에 `variants`로 stagger 제어
- 스트리밍 중에는 해석/조언 섹션이 텍스트 도착 시점에 등장

### 작업

- [x] `ResultPage.tsx` — 섹션 stagger 애니메이션 적용
- [x] `SharedResultPage.tsx` — 동일 패턴 적용
- [x] 기존 테스트 regression 확인

**검증:** chrome-devtools에서 결과 페이지 로드 시 순차 등장 확인

---

## 4-7. 마이크로 인터랙션 + 햅틱

> 버튼, 카드, 칩 등의 미세한 인터랙션 개선 및 모바일 햅틱 피드백

### 구현 대상

**버튼 프레스 피드백 강화**
- 기존 `active:scale-95` → `motion.button` + `whileTap={{ scale: 0.95 }}` (스프링)
- CTA 버튼: 추가로 `shadow` 변화 (눌림감)

**카테고리 칩 선택**
- 선택/해제 시 `layoutId` + 배경색 전환 (0.2s)

**ThemeCard 호버**
- `whileHover={{ y: -4 }}` + `shadow` 깊이 변화

**햅틱 피드백** (`src/utils/haptic.ts`)
- `navigator.vibrate(10)` — 카드 선택 시 호출
- 미지원 브라우저 무시 (`if ('vibrate' in navigator)`)
- Capacitor 네이티브 햅틱은 백로그 (MVP는 Vibration API만)

### 작업

- [x] `haptic.ts` — 햅틱 유틸 함수
- [x] `haptic.test.ts` — 테스트
- [x] 주요 버튼/카드 컴포넌트 — `motion` 전환 (기존 Tailwind transition 대체)
- [x] `ReadingPage.tsx` — 카드 선택 시 햅틱 호출 연결

**검증:** chrome-devtools에서 버튼 클릭/호버 확인, 콘솔 에러 0건

---

## 서브스텝 요약

| 서브스텝 | 제목 | 주요 파일 | 난이도 |
|---|---|---|---|
| 4-1 | 모션 기반 설정 + 접근성 | `motionConfig.ts`, `useReducedMotion.ts` | 낮음 |
| 4-2 | 카드 선택 4단계 애니메이션 | `CardGrid.tsx`, `CardSlot.tsx`, `ReadingPage.tsx` | **높음** |
| 4-3 | 모달 진입/퇴장 | `ErrorModal.tsx`, `PendingSessionModal.tsx` | 낮음 |
| 4-4 | 해석 타이핑 효과 | `StreamingText.tsx`, `ResultPage.tsx` | 중간 |
| 4-5 | 페이지 전환 | `App.tsx`, `PageTransition.tsx` | 중간 |
| 4-6 | 결과 섹션 순차 등장 | `ResultPage.tsx`, `SharedResultPage.tsx` | 낮음 |
| 4-7 | 마이크로 인터랙션 + 햅틱 | 버튼/카드 컴포넌트, `haptic.ts` | 낮음 |

### 실행 순서

```
4-1 (모션 설정)    → 모든 서브스텝의 기반
4-2 (카드 4단계)   → 핵심 경험, 가장 복잡
4-3 (모달)         → 4-1 프리셋 활용, 독립적
4-4 (타이핑 효과)  → 독립적 컴포넌트
4-5 (페이지 전환)  → App.tsx 수정, 전체 영향
4-6 (섹션 등장)    → ResultPage 폴리싱
4-7 (마이크로)     → 최종 다듬기
```

### 의존성

```
4-1 ← 4-2, 4-3, 4-5, 4-6, 4-7 (모션 프리셋 사용)
4-2 ← 없음 (4-1 이후 즉시 가능)
4-3 ← 없음 (4-1 이후 즉시 가능, 4-2와 병렬 가능)
4-4 ← 없음 (독립)
4-5 ← 없음 (4-1 이후 즉시 가능)
4-6 ← 4-4 (StreamingText 완성 후)
4-7 ← 4-2 (카드 애니메이션 완성 후 햅틱 연결)
```
