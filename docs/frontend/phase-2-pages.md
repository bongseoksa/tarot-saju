# Phase 2: 페이지 구현

> 목표: Phase 1에서 만든 공용 컴포넌트와 정적 데이터를 조합하여 모든 페이지의 UI를 구현한다.
> 완료 기준: 각 페이지가 Stitch HTML 디자인과 일치하는 레이아웃을 렌더링하고, 모의(mock) 데이터로 정상 동작한다. tsc/lint/test/build 통과.
> **상태: 대기**

---

## 전제

- 이 Phase는 **UI 레이아웃만** 구현한다. 실제 비즈니스 로직(Zustand 스토어, localStorage, AI 스트리밍 등)은 Phase 3에서 구현한다.
- 각 페이지는 모의(mock) 데이터와 빈 콜백(`() => {}`)을 사용하여 독립적으로 렌더링 가능해야 한다.
- Phase 1 컴포넌트 활용: `AppHeader`, `AppLayout`, `Icon`, `CategoryChip`, `ThemeCard`, `TarotCardImage`, `ErrorModal`, `LoadingScreen`
- Phase 1 데이터 활용: `THEMES`, `CATEGORIES`, `getCategoryMeta()`, `THREE_CARD_SPREAD`, `TAROT_CARDS`, `getCardById()`

---

## 2-1. 홈 페이지 (`src/pages/HomePage.tsx`)

참조: `01-home.html`, Stitch 스크린 ID `3267f033cfec441598b92420fa3a7be8`

### 구조

```
AppHeader variant="home"
├── Hero 섹션 (퀵 진입)
│   ├── 서브타이틀: "오늘의 운세가 궁금하다면?"
│   ├── 타이틀: "오늘의 타로 한 장\n뽑아볼까?"
│   ├── CTA 버튼: "오늘의 타로" → navigate(`/reading/daily-today`)
│   └── 점하나 캐릭터 (우하단 데코, opacity-20)
├── 카테고리 필터
│   ├── 가로 스크롤 (`overflow-x-auto no-scrollbar`)
│   └── CategoryChip × 7 (전체 + 6개 카테고리)
├── 테마 목록
│   ├── 섹션 제목: "추천 테마" + auto_awesome 아이콘
│   └── ThemeCard × N (필터 적용)
└── 푸터
    ├── 개인정보처리방침 | 이용약관 (외부 링크)
    └── © 점하나. All rights reserved.
```

### 구현 상세

- **카테고리 필터**: URL 쿼리 파라미터 `?category=love`로 관리. `useSearchParams()` 사용. 스토어 불필요.
- **테마 필터링**: `THEMES` 배열을 `category` 필드로 필터링. "전체"는 필터 없음.
- **ThemeCard 클릭**: `navigate(`/reading/${theme.id}`)` (Phase 2에서는 네비게이션만, 스토어 초기화는 Phase 3)
- **Hero CTA 클릭**: `navigate('/reading/daily-today')`
- **히스토리 아이콘**: `AppHeader`에 이미 구현됨 (`navigate('/history')`)
- **푸터**: 개인정보처리방침/이용약관은 노션 외부 링크 (href는 `#` 플레이스홀더)
- **미완료 세션 UI**: Phase 3에서 구현 (Phase 2에서는 포함하지 않음). 스펙(A-5-1)은 "모달"(+더 이상 보지 않기 체크, 2~3건 목록), Stitch HTML은 "토스트"로 디자인됨 — **Phase 3 착수 시 형태 확정 필요**.
- **하단 네비게이션 바**: Stitch HTML에는 있지만, 스펙(`02-taro-mvp.md`)에서 "탭바 없음"으로 정의됨. **구현하지 않음**.

### 스타일 참조 (01-home.html)

| 요소 | 클래스 |
|---|---|
| Hero 컨테이너 | `rounded-[32px] bg-gradient-to-br from-[#FFFDEB] to-[#FDF4FF] p-lg` |
| CTA 버튼 | `bg-primary text-on-primary px-lg py-md rounded-full shadow-lg shadow-primary/20` |
| 카테고리 래퍼 | `flex overflow-x-auto no-scrollbar gap-xs px-container-padding` |
| 테마 섹션 | `px-container-padding space-y-md` |
| 푸터 | `mt-xl px-container-padding pb-lg text-center border-t border-zinc-100 pt-lg` |

**작업:**
- [ ] `HomePage.tsx` — Hero 섹션 + 카테고리 필터 + 테마 목록 + 푸터
- [ ] `HomePage.test.tsx` — 테마 11개 렌더링, 카테고리 필터링, 네비게이션 동작 테스트

**검증:** tsc/build 통과, chrome-devtools 모바일(390x844) 스크린샷으로 Stitch 디자인과 비교

---

## 2-2. 카드 뽑기 페이지 (`src/pages/ReadingPage.tsx`)

참조: `02-card-draw.html`, Stitch 스크린 ID `ec43978820e440c9bf3146b0049cbb4f`

### 구조

```
AppHeader variant="sub" title={theme.title}
├── 안내 텍스트: "세 장의 카드를 신중하게 골라주세요"
├── 상단 슬롯 3개 (과거/현재/미래)
│   ├── 빈 슬롯: border-dashed + 라벨 + add_circle 아이콘
│   └── 선택된 슬롯: 카드 이미지 표시
├── 카드 그리드 (22장)
│   ├── 4열 그리드 (`grid-cols-4 gap-sm`)
│   ├── 마지막 행 2장 중앙 정렬 (`flex justify-center`)
│   └── 그리드 영역만 세로 스크롤 (`overflow-y-auto`)
└── 하단 고정 버튼 영역
    ├── 3장 선택 전: "점 보기 (N/3)" 단일 비활성 버튼 — `bg-zinc-200 text-zinc-400 cursor-not-allowed`
    └── 3장 선택 완료: 2개 버튼
        ├── "다시 선택" 보조 버튼 — 선택 초기화 (카드 3장 해제, 슬롯 비움)
        └── "결과 보기" 주 버튼 — `bg-primary text-white` → 결과 페이지 이동
```

### 구현 상세

- **URL 파라미터**: `useParams<{ themeId: string }>()` → `THEMES.find(t => t.id === themeId)`로 테마 조회
- **카드 상태**: 로컬 `useState` 배열 (`selectedCards: { cardId: number; positionIndex: number }[]`). Phase 3에서 Zustand로 이전.
- **카드 선택 로직** (Phase 2 범위 — UI만):
  - 카드 클릭 → `selectedCards`에 추가 (최대 3장)
  - 선택된 카드는 그리드에서 `opacity-40 grayscale` 처리
  - 상단 슬롯에 카드 이미지 표시
  - 정/역방향 결정은 Phase 3 (Phase 2에서는 모두 정방향)
- **카드 그리드**: `TAROT_CARDS`에서 메이저 아르카나 22장 (id 0~21) 사용. `TarotCardImage` 컴포넌트로 뒷면 표시.
- **하단 버튼**: 3장 선택 전 비활성("점 보기 N/3"), 3장 선택 시 "다시 선택" + "결과 보기" 2개 버튼 표시 (스펙 `02-taro-mvp.md` line 104 준수). "다시 선택" 클릭 → 선택 상태 초기화. "결과 보기" 클릭 → `navigate(`/result/mock-id`)` (Phase 2 한정).
- **뒤로가기**: `AppHeader`의 기본 `navigate(-1)` 동작 사용. 확인 다이얼로그 없이 즉시 이동, 선택 상태 초기화 (A-4-4 준수).
- **배경 데코레이션**: 카테고리별 배경 톤 전환은 Phase 4에서 구현. Phase 2에서는 기본 배경 유지.
- **카드 애니메이션**: Phase 4에서 구현. Phase 2에서는 즉시 전환. 뒤집기 애니메이션 중 추가 탭 무시(A-5-2)도 Phase 4에서 구현.

### 추출할 컴포넌트

- `CardSlot` (`src/components/reading/CardSlot.tsx`): 상단 슬롯 (빈 상태 / 선택 상태)
- `CardGrid` (`src/components/reading/CardGrid.tsx`): 22장 카드 그리드

### 스타일 참조 (02-card-draw.html)

| 요소 | 클래스 |
|---|---|
| 빈 슬롯 | `aspect-[2/3] rounded-xl border-2 border-dashed border-violet-200 bg-white/50` |
| 선택된 슬롯 | `bg-primary shadow-lg rounded-lg border-4 border-white` |
| 카드 뒷면 | `aspect-[2/3] rounded-lg bg-white border border-zinc-100 shadow-sm` |
| 카드 호버 | `hover:shadow-md hover:-translate-y-1 transition-all active:scale-95` |
| 하단 버튼 | `w-full py-md rounded-2xl` |
| 스크롤 마스크 | `mask-image: linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)` |

**작업:**
- [ ] `CardSlot.tsx` — 슬롯 컴포넌트 (empty/filled 상태)
- [ ] `CardGrid.tsx` — 22장 카드 그리드 (4열 + 마지막 2장 중앙)
- [ ] `ReadingPage.tsx` — 슬롯 + 그리드 + 하단 버튼 조합
- [ ] `ReadingPage.test.tsx` — 카드 선택/해제, 슬롯 업데이트, 버튼 활성화 테스트

**검증:** tsc/build 통과, chrome-devtools 모바일 스크린샷

---

## 2-3. 결과 페이지 (`src/pages/ResultPage.tsx`)

참조: `03-result.html`, Stitch 스크린 ID `7d4bf59e4e794903b327eefa35be085c`

### 구조

```
AppHeader variant="sub" title={theme.title} rightAction={공유 아이콘}
├── 카드 요약 섹션
│   ├── 3장 가로 나열 (과거/현재/미래)
│   ├── 위치 라벨 + 카드 이미지 + 카드명 + 정/역방향 표시
│   └── 현재 카드 강조 (scale, ring, border)
├── 마스코트 인디케이터
│   ├── 점하나 아바타
│   └── 말풍선: "점하나가 당신의 카드를 읽고 있어요..."
├── 해석 카드 섹션 (과거/현재/미래)
│   ├── 각 카드: 아이콘 + 제목 + 본문
│   └── 현재 카드 강조 border
├── 종합 조언 카드
│   ├── "점하나의 한마디" 제목
│   ├── 조언 본문
│   └── 한줄 요약 (verified 아이콘)
├── 광고 배너 영역 (플레이스홀더)
└── 하단 고정 버튼
    ├── "공유하기" 보조 버튼
    └── "점 하나 더 찍어볼까?" 주 버튼 → navigate('/')
```

### 구현 상세

- **헤더 우측**: 스펙 IA에서 "공유 아이콘"으로 정의 (02-taro-mvp.md line 38). Stitch HTML(03-result.html)에서는 history 아이콘으로 디자인됨. **스펙 준수하여 공유(share) 아이콘 사용** — Phase 3에서 클릭 시 공유 기능 연결.
- **모의 데이터**: 하드코딩된 카드 3장 + 해석 텍스트로 레이아웃 확인. 모의 데이터에 `isReversed` 포함하여 정/역방향 UI 확인.
- **정/역방향 표시**: 카드 요약에 카드명과 함께 정방향/역방향 라벨 표시 (스펙 line 114 준수). 역방향 카드는 이미지 180도 회전.
- **AI 스트리밍 표시**: Phase 3에서 구현. Phase 2에서는 전체 텍스트 즉시 표시. 스트리밍 중 뒤로가기 허용(A-5-4)도 Phase 3에서 처리.
- **공유하기 버튼**: Phase 3에서 구현. Phase 2에서는 빈 콜백.
- **광고 배너**: 플레이스홀더 (`bg-zinc-100 rounded-xl h-24` + "Advertisement" 텍스트). 결과 화면 하단에만 배치, 홈 배너 없음 (C-3 준수).
- **"점 하나 더 찍어볼까?" 버튼**: `navigate('/')` 홈 이동

### 추출할 컴포넌트

- `CardSummary` (`src/components/result/CardSummary.tsx`): 상단 카드 3장 요약 (위치 라벨 + 이미지 + 카드명 + 정/역방향)
- `InterpretationCard` (`src/components/result/InterpretationCard.tsx`): 개별 해석 카드 (과거/현재/미래)
- `AdviceCard` (`src/components/result/AdviceCard.tsx`): 종합 조언 + 한줄 요약

### 스타일 참조 (03-result.html)

| 요소 | 클래스 |
|---|---|
| 카드 요약 컨테이너 | `bg-white rounded-[32px] p-md shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-violet-50` |
| 현재 카드 강조 | `shadow-md border-2 border-primary-fixed ring-4 ring-primary-fixed/20` |
| 해석 카드 | `bg-white p-lg rounded-[24px] border border-zinc-100 shadow-sm` |
| 현재 해석 강조 | `border-primary-fixed/50 ring-1 ring-primary-fixed/20` |
| 조언 카드 | `bg-primary-container p-lg rounded-[24px] text-on-primary-container shadow-md` |
| 공유 버튼 | `flex-1 h-14 bg-white border border-violet-200 text-primary rounded-2xl` |
| CTA 버튼 | `flex-[2] h-14 bg-primary text-white rounded-2xl shadow-[0_8px_16px_rgba(107,56,212,0.2)]` |
| 푸터 컨테이너 | `rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]` |

**작업:**
- [ ] `CardSummary.tsx` — 카드 3장 요약 (현재 강조)
- [ ] `InterpretationCard.tsx` — 개별 해석 카드
- [ ] `AdviceCard.tsx` — 종합 조언 + 한줄 요약
- [ ] `ResultPage.tsx` — 전체 레이아웃 조합 (모의 데이터)
- [ ] `ResultPage.test.tsx` — 카드 요약 렌더링, 해석 텍스트 표시, 버튼 동작 테스트

**검증:** tsc/build 통과, chrome-devtools 모바일 스크린샷

---

## 2-4. 공유 결과 페이지 (`src/pages/SharedResultPage.tsx`)

참조: `04-share-result.html`, Stitch 스크린 ID `f8b15de69fcb434f90797eae36e83a9e`

### 구조

```
헤더 (로고 중앙 배치, 뒤로가기 없음)
├── 인사 말풍선
│   ├── 점하나 아바타
│   └── "점하나가 전해준 타로 결과예요. ..."
├── 카드 요약 (3장 가로 나열, grid-cols-3)
├── 한줄 요약 카드
│   ├── "오늘의 한 줄 요약" 라벨
│   └── 요약 문구
├── 해석 (타임라인 스타일)
│   ├── 과거 — border-l-2 border-zinc-100 + 원형 도트
│   ├── 현재 — border-l-2 border-primary-fixed-dim + primary 도트
│   └── 미래 — border-l-2 border-zinc-100 + 원형 도트
├── 조언 카드
└── 하단 고정 CTA
    ├── "나도 점 하나 찍어볼까?" → navigate('/')
    └── 서비스 안내 캡션
```

### 구현 상세

- **ResultPage와의 차이**: 공유 결과는 비로그인 사용자도 접근 가능, 헤더가 로고 중앙형, 하단 CTA가 "나도 점 하나 찍어볼까?"
- **Phase 3에서 Supabase 조회 연동**. Phase 2에서는 모의 데이터 사용.
- **해석 영역**: ResultPage의 카드형과 달리 타임라인(세로선+도트) 스타일. 별도 컴포넌트 필요.
- **ResultPage 컴포넌트 재사용**: `CardSummary`는 공유 페이지에서도 재사용 가능 (레이아웃 약간 다름, props로 분기)

### 추출할 컴포넌트

- `TimelineInterpretation` (`src/components/shared/TimelineInterpretation.tsx`): 타임라인 스타일 해석 표시

### 스타일 참조 (04-share-result.html)

| 요소 | 클래스 |
|---|---|
| 헤더 | `bg-white/80 backdrop-blur-md sticky top-0 flex justify-center items-center h-16` |
| 말풍선 | `bg-white border border-zinc-100 p-md rounded-2xl rounded-tl-none shadow-sm` |
| 한줄 요약 | `bg-primary-fixed-dim/20 border border-primary-fixed-dim rounded-2xl p-lg text-center` |
| 타임라인 과거/미래 | `pl-lg border-l-2 border-zinc-100` + `absolute -left-[9px] w-4 h-4 rounded-full bg-zinc-200 border-4 border-white` |
| 타임라인 현재 | `pl-lg border-l-2 border-primary-fixed-dim` + `bg-primary border-4 border-white` |
| CTA 버튼 | `w-full h-14 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20` |

**작업:**
- [ ] `TimelineInterpretation.tsx` — 타임라인 스타일 해석
- [ ] `SharedResultPage.tsx` — 공유 전용 레이아웃 (모의 데이터)
- [ ] `SharedResultPage.test.tsx` — 렌더링 및 CTA 동작 테스트

**검증:** tsc/build 통과, chrome-devtools 모바일 스크린샷

---

## 2-5. 히스토리 페이지 (`src/pages/HistoryPage.tsx`)

참조: `05-history.html`, Stitch 스크린 ID `fb170c9491ed4b198cb245ab691d1f7c`

### 구조

```
AppHeader variant="sub" title="히스토리"
├── 요약 통계 (선택적 — Phase 3 데이터 의존)
│   ├── 이번 달 읽은 횟수
│   └── 주요 키워드
├── 목록 헤더: "모든 기록" + "날짜순"
├── 히스토리 항목 리스트
│   ├── 카테고리 태그 + 날짜
│   ├── 테마 제목
│   ├── 카드 3장 썸네일 (w-14 h-20)
│   └── chevron_right 아이콘
└── 빈 상태 (항목 없을 때)
    ├── 점하나 캐릭터 일러스트
    ├── "여기는 아직 비어있어요."
    ├── "점 하나 찍으러 가볼까요?"
    └── CTA 버튼: "지금 점 보러 가기" → navigate('/')
```

### 구현 상세

- **모의 데이터**: 3건의 히스토리 항목 (01-home.html의 Stitch 샘플 데이터 기반)
- **빈 상태**: 모의 데이터 배열이 빈 경우 표시. 토글 가능하도록 구현.
- **항목 클릭**: `navigate(`/result/${item.id}`)` (Phase 3에서 실제 데이터 연동)
- **요약 통계**: Phase 3에서 localStorage 데이터 기반으로 계산. Phase 2에서는 모의 값 표시.
- **검색 아이콘**: Stitch에 있으나 스펙에 정의되지 않음 → 구현하지 않음.
- **하단 네비게이션**: 스펙에 "탭바 없음" → 구현하지 않음.

### 추출할 컴포넌트

- `HistoryCard` (`src/components/history/HistoryCard.tsx`): 히스토리 항목 카드
- `EmptyState` (`src/components/ui/EmptyState.tsx`): 범용 빈 상태 컴포넌트

### 스타일 참조 (05-history.html)

| 요소 | 클래스 |
|---|---|
| 히스토리 카드 | `bg-white p-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white` |
| 카테고리 태그 | `bg-pink-50 text-secondary px-2 py-0.5 rounded-full text-[10px] font-bold` |
| 카드 썸네일 | `w-14 h-20 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-50` |
| 통계 카드 | `bg-white p-md rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.04)] border border-zinc-50` |

**작업:**
- [ ] `HistoryCard.tsx` — 히스토리 항목 카드
- [ ] `EmptyState.tsx` — 빈 상태 컴포넌트 (일러스트 + 문구 + CTA)
- [ ] `HistoryPage.tsx` — 목록 + 빈 상태 전환 (모의 데이터)
- [ ] `HistoryPage.test.tsx` — 목록 렌더링, 빈 상태 전환, 네비게이션 테스트

**검증:** tsc/build 통과, chrome-devtools 모바일 스크린샷

---

## 2-6. 로딩/에러 화면 (Phase 1 컴포넌트 페이지 적용)

참조: `06-loading.html`, `07-error.html`

### 구현 상세

Phase 1에서 이미 `LoadingScreen`과 `ErrorModal` 컴포넌트가 생성되었으므로, Phase 2에서는 이들을 페이지에서 사용하는 패턴만 확인한다.

- **LoadingScreen**: 전체화면 오버레이. Phase 3에서 광고 로드, AI 호출 시 사용.
- **ErrorModal**: AI 서버 다운 시 표시. Phase 3에서 에러 핸들링과 연동.

Phase 2에서의 작업:
- 각 페이지 테스트에서 LoadingScreen/ErrorModal이 조건부 렌더링되는지 확인
- 별도 페이지 파일 생성 불필요 (오버레이/모달 형태이므로)

**작업:**
- [ ] 로딩/에러 컴포넌트가 페이지에서 조건부 렌더링 가능한지 통합 확인

---

## 실행 순서

```
1. HomePage        → 가장 많은 Phase 1 컴포넌트 사용, 기본 네비게이션 확인
2. ReadingPage     → 핵심 인터랙션 (카드 선택), 새 컴포넌트 추출
3. ResultPage      → 결과 표시 레이아웃, 컴포넌트 추출
4. SharedResultPage → ResultPage 컴포넌트 재사용 + 타임라인 추가
5. HistoryPage     → 목록 + 빈 상태
6. 통합 검증       → 전체 플로우 네비게이션 테스트
```

---

## 새로 생성되는 파일 목록

### 컴포넌트 (8개)
- `src/components/reading/CardSlot.tsx`
- `src/components/reading/CardGrid.tsx`
- `src/components/result/CardSummary.tsx`
- `src/components/result/InterpretationCard.tsx`
- `src/components/result/AdviceCard.tsx`
- `src/components/shared/TimelineInterpretation.tsx`
- `src/components/history/HistoryCard.tsx`
- `src/components/ui/EmptyState.tsx`

### 페이지 (수정 — 기존 스켈레톤 교체)
- `src/pages/HomePage.tsx`
- `src/pages/ReadingPage.tsx`
- `src/pages/ResultPage.tsx`
- `src/pages/SharedResultPage.tsx`
- `src/pages/HistoryPage.tsx`

### 테스트 (5개)
- `src/pages/HomePage.test.tsx`
- `src/pages/ReadingPage.test.tsx`
- `src/pages/ResultPage.test.tsx`
- `src/pages/SharedResultPage.test.tsx`
- `src/pages/HistoryPage.test.tsx`

---

## 완료 체크리스트

- [ ] HomePage: Hero + 카테고리 필터 + 테마 목록 + 푸터
- [ ] ReadingPage: 슬롯 3개 + 카드 그리드 22장 + 하단 버튼
- [ ] ResultPage: 카드 요약 + 해석 카드 + 조언 + 하단 버튼
- [ ] SharedResultPage: 로고 헤더 + 타임라인 해석 + CTA
- [ ] HistoryPage: 히스토리 목록 + 빈 상태
- [ ] 새 컴포넌트 8개 생성
- [ ] 테스트 5개 작성 및 통과
- [ ] `pnpm run lint` 통과
- [ ] `pnpm run test` 통과
- [ ] `pnpm run build` 통과
- [ ] chrome-devtools 모바일(390x844) 시각적 검증

---

## 스펙 정합성 검토 결과

> `docs/specs/02-taro-mvp.md` 및 `docs/기획-정의목록.md` 대비 교차 검증 수행.

### 반영 완료 (Phase 2 계획서 수정)

| # | 스펙 항목 | 내용 | 조치 |
|---|---|---|---|
| 1 | 카드 뽑기 하단 버튼 (02-taro-mvp line 104) | "다시 선택" + "결과 보기" **2개 버튼** | 2개 버튼으로 수정 (기존: 단일 버튼) |
| 2 | 결과 헤더 우측 (IA line 38) | **공유 아이콘** | 스펙 기준 share 아이콘으로 수정 (Stitch는 history) |
| 3 | 결과 카드 정/역방향 표시 (line 114) | 카드명과 함께 정/역방향 표시 | 정/역방향 라벨 + 역방향 이미지 회전 추가 |
| 4 | 카드 뽑기 뒤로가기 (A-4-4) | 즉시 홈 이동 + **선택 상태 초기화** | 초기화 명시 추가 |
| 5 | 뒤집기 중 탭 무시 (A-5-2) | 애니메이션 중 추가 탭 무시 | Phase 4 이관 명시 |
| 6 | 스트리밍 중 뒤로가기 (A-5-4) | 뒤로가기 허용 + 미완료 세션 저장 | Phase 3 이관 명시 |
| 7 | 히스토리 빈 상태 CTA 문구 | "지금 점 보러 가기" | CTA 버튼 문구 추가 |

### Stitch vs 스펙 불일치 (확인 필요)

| # | 항목 | 스펙 | Stitch HTML | 결정 |
|---|---|---|---|---|
| 1 | 미완료 세션 UI 형태 | **모달** (A-5-1: 체크박스, 목록, 닫기) | **토스트** (01-home.html: 하단 배너형) | Phase 3 착수 시 확정 |
| 2 | 결과 헤더 우측 아이콘 | **공유 아이콘** (IA) | **히스토리 아이콘** (03-result.html) | 스펙 우선 (공유 아이콘) |
| 3 | 하단 네비게이션 바 | **없음** ("탭바 없음") | **있음** (4개 탭) | 스펙 우선 (미구현) |
| 4 | 히스토리 검색 아이콘 | **없음** (스펙 미정의) | **있음** (05-history.html) | 스펙 우선 (미구현) |
| 5 | 히스토리 요약 통계 | **없음** (스펙 미정의) | **있음** (읽은 횟수, 키워드) | Stitch 디자인 채택 (모의 데이터) |

### Phase 2 범위에서 제외 — Phase 3/4로 이관

| 스펙 항목 | 내용 | 이관 대상 |
|---|---|---|
| A-5-1 | 미완료 세션 모달/토스트 (홈 진입 시) | Phase 3 |
| A-5-2 | 뒤집기 애니메이션 + 추가 탭 무시 | Phase 4 |
| A-5-3 | 광고 게이트 (로딩 → 광고 → 결과) | Phase 3 |
| A-5-4 | AI 스트리밍 + 스트리밍 중 뒤로가기 | Phase 3 |
| A-4-1 | AI 서버 다운 시 재시도 + 미완료 세션 저장 | Phase 3 |
| A-4-2 | 광고 로드 실패 시 조용히 스킵 | Phase 3 |
| D-2 | Zustand 스토어 3개 + storageUtil | Phase 3 |
| B-4 | 카드 4단계 애니메이션 (기대감→몰입→설렘→완성감) | Phase 4 |

---

## 참조

- Stitch 스크린: `docs/design/stitch/screens/*.html`
- Stitch 스크린 ID: `docs/design/reference.md`
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 스펙: `docs/specs/02-taro-mvp.md` (화면별 정의, 에지 케이스, IA)
- 기획 정의: `docs/기획-정의목록.md` (A-1~H-3, 32개 항목)
- Phase 1 컴포넌트: `src/components/` (AppHeader, AppLayout, ui/*)
- Phase 1 데이터: `src/data/` (themes, spreads, cards)
