# Phase 3: 비즈니스 로직 + 상태 관리

> 목표: Phase 2에서 모의 데이터로 구현한 페이지에 실제 비즈니스 로직을 연결한다. Zustand 스토어, localStorage 암호화/압축, 카드 선택 로직, 광고 게이트, AI SSE 스트리밍, 공유 기능, 미완료 세션 관리를 구현한다.
> 완료 기준: 전체 사용자 흐름(홈 → 카드 뽑기 → 광고 → AI 해석 → 저장/공유)이 실제 동작하고, 에지 케이스(AI 실패, 광고 실패, 미완료 세션)가 스펙대로 처리된다. tsc/lint/test/build 통과.
> **상태: 재작업 필요** — 기존 비즈니스 로직(storageUtil, 스토어, SSE, 공유)은 재활용 가능. 새 반응형 UI 컴포넌트에 재연결 필요

---

## 전제

- Phase 2 완료 상태: 모든 페이지 UI가 모의 데이터로 렌더링되고 있음
- 이 Phase에서는 **로직만** 구현하고, UI 변경은 로직 연결에 필요한 최소한으로 제한
- 설치된 패키지: `zustand@5`, `crypto-js@4`, `lz-string@1.5`, `framer-motion@12` (Phase 0에서 설치 완료)
- 타입: `packages/shared/src/types.ts`에 8개 인터페이스 정의 완료
- 데이터: `src/data/themes.ts`, `src/data/spreads.ts`, `src/data/cards.ts` 정의 완료
- 스펙 참조: `docs/specs/02-taro-mvp.md` (상태 관리, localStorage, 에지 케이스, API)
- AI 설계 참조: `docs/specs/03-ai-design.md` (프롬프트, SSE 스트리밍, 응답 파싱)
- TDD: 모든 모듈에 대해 테스트 먼저 작성 → 실패 확인 → 구현 → 통과 확인

---

## TDD 및 검증 프로토콜

> RULES.md 3번(TDD), 4번(MCP 도구 활용)을 각 서브스텝에서 반드시 준수한다.

### TDD 사이클 (모든 서브스텝 공통)

각 모듈/컴포넌트 구현 시 아래 4단계를 반드시 순서대로 수행한다.

```
RED    → 테스트 파일 먼저 작성 → `pnpm run test -- <파일명>` 실행 → 실패(FAIL) 확인
GREEN  → 최소한의 구현 코드 작성 → `pnpm run test -- <파일명>` 실행 → 통과(PASS) 확인
REFACTOR → 코드 정리 (필요 시) → 테스트 재실행 → 여전히 PASS 확인
LINT   → `pnpm run lint` 실행 → 경고/에러 0건 확인
```

- 테스트 없이 구현 코드를 먼저 작성하지 않는다.
- 실패하는 테스트를 확인하지 않고 구현으로 넘어가지 않는다.
- 한 모듈의 TDD 사이클이 완료된 후 다음 모듈로 진행한다.

### context7 MCP — API 확인 (서브스텝별)

라이브러리/프레임워크 API를 사용하기 전에 context7 MCP로 최신 문서를 확인한다.

| 서브스텝 | 확인 대상 라이브러리 | 확인 항목 |
|---|---|---|
| 3-1 | `crypto-js` | `AES.encrypt/decrypt` API, WordArray 변환 |
| 3-1 | `lz-string` | `compressToBase64/decompressFromBase64` API |
| 3-2 | `zustand` (v5) | `create`, `persist` 미들웨어, 커스텀 `storage` 옵션 |
| 3-5 | `fetch` + `ReadableStream` | SSE 스트리밍 수신 패턴, `TextDecoderStream` |
| 3-6 | `@supabase/supabase-js` | `createClient`, `from().insert()`, `from().select()` |

**실행 방법:** 각 서브스텝 작업 시작 전에 `mcp__context7__resolve-library-id` → `mcp__context7__query-docs`로 해당 라이브러리 최신 API를 조회한다.

### chrome-devtools MCP — 런타임 검증 (서브스텝별)

UI 변경이 포함된 서브스텝(3-3, 3-7, 3-8) 완료 후 chrome-devtools MCP로 실시간 런타임 검증을 수행한다.

#### 검증 절차

```
1. 개발 서버 실행 확인 (pnpm run dev)
2. chrome-devtools: 모바일 에뮬레이션 설정 (390x844, 3x DPR)
3. chrome-devtools: 해당 페이지로 네비게이션
4. chrome-devtools: 콘솔 에러/경고 확인 → 0건이어야 함
5. chrome-devtools: 스크린샷 촬영 → Stitch 디자인과 비교
6. chrome-devtools: 인터랙션 테스트 (클릭, 상태 전환 등)
```

#### 서브스텝별 런타임 검증 범위

| 서브스텝 | 검증 대상 | chrome-devtools 확인 사항 |
|---|---|---|
| 3-1 | (유닛 테스트만) | 런타임 검증 불필요 — 순수 유틸리티 |
| 3-2 | (유닛 테스트만) | 런타임 검증 불필요 — 순수 스토어 |
| 3-3 | ReadingPage | 카드 선택 → 슬롯 표시, 정/역방향 라벨, 중복 선택 무시, "다시 선택" 동작, 콘솔 에러 0건 |
| 3-4 | (유닛 테스트만) | 런타임 검증 불필요 — 훅 (SDK 미연동 MVP) |
| 3-5 | ResultPage | AI 스트리밍 텍스트 실시간 표시 (mock SSE), 에러 시 ErrorModal 표시, 콘솔 에러 0건 |
| 3-6 | SharedResultPage | Supabase 조회 → 데이터 표시, 로딩 상태, 404 안내, 콘솔 에러 0건 |
| 3-7 | HomePage | 미완료 세션 모달 표시/닫기/"더 이상 보지 않기" 동작, 콘솔 에러 0건 |
| 3-8 | 전체 페이지 | **전체 흐름 E2E**: 홈 → 카드 뽑기 → 로딩 → 결과 → 공유 → 히스토리, 콘솔 에러 0건, 각 페이지 스크린샷 |

### 서브스텝 완료 게이트

각 서브스텝은 아래 조건을 모두 만족해야 다음 서브스텝으로 진행할 수 있다.

| 게이트 | 조건 |
|---|---|
| TDD | RED(실패) → GREEN(통과) 사이클 완료 |
| 단위 테스트 | `pnpm run test -- <관련 파일>` 전체 PASS |
| Lint | `pnpm run lint` 경고/에러 0건 |
| 타입 체크 | `pnpm run build` (tsc 포함) 에러 0건 |
| 런타임 검증 | (UI 서브스텝만) chrome-devtools 콘솔 에러 0건 + 스크린샷 확인 |

---

## 실행 순서

```
3-1. storageUtil       → localStorage 암호화/압축 유틸리티 (의존성 없음, 가장 기초)
3-2. Zustand 스토어     → storageUtil 위에 3개 스토어 구축
3-3. 카드 선택 로직     → 정/역방향 랜덤 + useReadingStore 연동
3-4. 광고 게이트        → 로딩 → 광고 → 결과 전환 흐름
3-5. AI SSE 스트리밍    → Edge Function 호출 + 스트리밍 파싱 + 에러 핸들링
3-6. 공유 기능          → Supabase SDK + shared_readings 테이블
3-7. 미완료 세션        → usePendingStore + 홈 진입 모달 + 억제 플래그
3-8. 페이지 통합        → 모의 데이터를 실제 스토어로 교체 + 전체 흐름 테스트
```

---

## 3-1. storageUtil — localStorage 암호화/압축

### 개요

모든 localStorage 접근을 단일 유틸리티로 통합한다. 직접 `localStorage.getItem/setItem` 호출을 금지한다.

스펙 참조: `02-taro-mvp.md` — localStorage 정책

### 처리 파이프라인

```
쓰기: JSON → lz-string 압축 → AES 암호화 → base64 → localStorage
읽기: localStorage → base64 → AES 복호화 → lz-string 해제 → JSON
```

### 인터페이스

```typescript
// src/utils/storageUtil.ts
export const storageUtil = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
};
```

### 암호화 키

- 하드코딩 상수 (`STORAGE_ENCRYPTION_KEY`)
- 목적: 개발자 도구 평문 노출 방지 (완전한 보안이 아닌 난독화 수준)
- 키는 `src/utils/storageUtil.ts` 내부 상수로 관리

### 에러 처리

- 복호화 실패 시 (데이터 손상/키 변경): `null` 반환 + `console.warn`
- localStorage 용량 초과 시: `console.error` + 기존 데이터 유지

### API 확인 (context7)

- [x] `crypto-js` — `AES.encrypt(plaintext, key)` / `AES.decrypt(ciphertext, key).toString(enc.Utf8)` API 확인
- [x] `lz-string` — `compressToBase64(input)` / `decompressFromBase64(input)` API 확인

### 작업 — TDD 사이클

**RED (테스트 작성 → 실패 확인):**
- [x] `src/utils/storageUtil.test.ts` 작성 (12 tests)
  - get/set/remove 기본 동작
  - 저장된 값이 평문이 아닌지 확인 (암호화 검증)
  - 압축+암호화 후 복원 시 원본과 일치하는지 확인
  - 잘못된 데이터 읽기 시 null 반환
  - localStorage 비어있을 때 null 반환
- [x] `pnpm run test -- storageUtil` 실행 → **FAIL 확인**

**GREEN (구현 → 통과 확인):**
- [x] `src/utils/storageUtil.ts` 구현
- [x] `pnpm run test -- storageUtil` 실행 → **PASS 확인** (12 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 경고/에러 0건 확인
- [x] `pnpm run build` → tsc 에러 0건 확인

### 런타임 검증

- 불필요 (순수 유틸리티, UI 없음)

---

## 3-2. Zustand 스토어 (3개)

### 개요

스펙 참조: `02-taro-mvp.md` — 상태 관리 섹션

| 스토어 | 역할 | 영속성 |
|---|---|---|
| `useReadingStore` | 현재 뽑기 세션 (선택된 카드, 테마ID, 진행 상태) | 메모리만 |
| `useHistoryStore` | 완료된 결과 목록 (최대 20건) | localStorage (storageUtil) |
| `usePendingStore` | 미완료 세션 (최대 3건, 당일 자정 만료) | localStorage (storageUtil) |

### 3-2a. useReadingStore (메모리 전용)

```typescript
// src/stores/useReadingStore.ts
interface ReadingState {
  themeId: string | null;
  selectedCards: DrawnCard[];  // 최대 3장
  phase: 'selecting' | 'loading' | 'ad' | 'streaming' | 'done' | 'error';
  interpretation: string;     // 스트리밍 누적 텍스트
  summary: string;
  resultId: string | null;    // 결과 저장 후 생성된 UUID

  // actions
  startReading: (themeId: string) => void;
  selectCard: (cardId: number, positionIndex: number) => void;
  resetSelection: () => void;
  setPhase: (phase: ReadingState['phase']) => void;
  appendInterpretation: (chunk: string) => void;
  completeReading: (interpretation: string, summary: string) => void;
  reset: () => void;
}
```

### API 확인 (context7)

- [x] `zustand` (v5) — `create` 함수 시그니처, state + actions 패턴 확인 (context7)

### 작업 — TDD 사이클

**RED:**
- [x] `src/stores/useReadingStore.test.ts` 작성
  - startReading: themeId 설정, phase = 'selecting'
  - selectCard: 카드 추가 (최대 3장, 정/역방향 포함)
  - selectCard 중복 방지 (같은 cardId 무시)
  - resetSelection: 선택 초기화, phase = 'selecting'
  - appendInterpretation: 텍스트 누적
  - completeReading: interpretation + summary 설정, phase = 'done'
  - reset: 모든 상태 초기화
- [x] `pnpm run test -- useReadingStore` 실행 → **FAIL 확인**

**GREEN:**
- [x] `src/stores/useReadingStore.ts` 구현
- [x] `pnpm run test -- useReadingStore` 실행 → **PASS 확인** (10 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 3-2b. useHistoryStore (localStorage persist)

```typescript
// src/stores/useHistoryStore.ts
interface HistoryState {
  results: ReadingResult[];  // 최대 20건, 최신순

  // actions
  addResult: (result: ReadingResult) => void;  // 20건 초과 시 가장 오래된 것 삭제
  getResult: (id: string) => ReadingResult | undefined;
  clearAll: () => void;
}
```

- Zustand `persist` 미들웨어 사용
- 커스텀 storage: storageUtil을 사용하는 어댑터 구현
- localStorage key: `"history"`

### API 확인 (context7)

- [x] `zustand` (v5) — `persist` 미들웨어 API, 커스텀 `storage` 옵션, `createJSONStorage` 패턴 확인 (context7)

### 작업 — TDD 사이클

**RED:**
- [x] `src/stores/useHistoryStore.test.ts` 작성
  - addResult: 결과 추가
  - addResult 20건 초과 시 FIFO 삭제
  - getResult: ID로 조회
  - clearAll: 전체 삭제
  - persist: 데이터가 storageUtil 경유하여 localStorage에 저장되는지 확인
- [x] `pnpm run test -- useHistoryStore` 실행 → **FAIL 확인**

**GREEN:**
- [x] `src/stores/createStorageAdapter.ts` 구현 (persist 어댑터)
- [x] `src/stores/useHistoryStore.ts` 구현 (persist + storageUtil 어댑터)
- [x] `pnpm run test -- useHistoryStore` 실행 → **PASS 확인** (7 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 3-2c. usePendingStore (localStorage persist)

```typescript
// src/stores/usePendingStore.ts
interface PendingState {
  sessions: PendingSession[];  // 최대 3건

  // actions
  addSession: (session: PendingSession) => void;  // 3건 초과 시 FIFO
  removeSession: (id: string) => void;
  getActiveSessions: () => PendingSession[];  // 만료 필터링 (당일 자정)
  clearExpired: () => void;
}
```

- Zustand `persist` 미들웨어 사용
- 커스텀 storage: storageUtil 어댑터
- localStorage key: `"pending_sessions"`
- 만료 판정: `createdAt`이 오늘 날짜가 아니면 만료

### 작업 — TDD 사이클

**RED:**
- [x] `src/stores/usePendingStore.test.ts` 작성
  - addSession: 세션 추가
  - addSession 3건 초과 시 FIFO 삭제
  - removeSession: ID로 삭제
  - getActiveSessions: 만료된 세션 제외
  - clearExpired: 만료 세션 일괄 삭제
  - 만료 판정 로직: 자정 기준 (`vi.useFakeTimers` / `vi.setSystemTime`으로 날짜 mock)
- [x] `pnpm run test -- usePendingStore` 실행 → **FAIL 확인**

**GREEN:**
- [x] `src/stores/usePendingStore.ts` 구현
- [x] `pnpm run test -- usePendingStore` 실행 → **PASS 확인** (10 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 3-2d. storageUtil 기반 Zustand persist 어댑터

```typescript
// src/stores/createStorageAdapter.ts
import { storageUtil } from '../utils/storageUtil';
import type { StateStorage } from 'zustand/middleware';

export function createStorageAdapter(key: string): StateStorage {
  return {
    getItem: (name) => {
      const data = storageUtil.get<string>(name);
      return data ?? null;
    },
    setItem: (name, value) => {
      storageUtil.set(name, value);
    },
    removeItem: (name) => {
      storageUtil.remove(name);
    },
  };
}
```

**작업:**
- [x] `src/stores/createStorageAdapter.ts` — 3-2b GREEN 단계에서 함께 구현 (테스트는 useHistoryStore/usePendingStore 통합 테스트로 커버)

### 3-2 전체 서브스텝 완료 게이트

- [x] `pnpm run test -- stores` 전체 PASS (27 tests)
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → 에러 0건
- [x] 런타임 검증 불필요 (순수 스토어, UI 없음)

---

## 3-3. 카드 선택 로직

### 개요

카드 뽑기 페이지에서 사용자가 카드를 선택할 때 정/역방향을 랜덤으로 결정하고, useReadingStore와 연동한다.

스펙 참조: `02-taro-mvp.md` — 카드 뽑기 (line 98~105)

### 로직

```typescript
// src/utils/cardUtils.ts
export function determineOrientation(): boolean {
  return Math.random() < 0.5;  // true = reversed
}
```

### ReadingPage 연동

Phase 2의 `ReadingPage.tsx`에서 로컬 `useState`를 `useReadingStore`로 교체:

1. 페이지 진입 시 `startReading(themeId)` 호출
2. 카드 클릭 시 `selectCard(cardId, positionIndex)` 호출 — `isReversed`는 `determineOrientation()`으로 결정
3. "다시 선택" 클릭 시 `resetSelection()` 호출
4. "결과 보기" 클릭 시 Phase 3-4 (광고 게이트) 흐름으로 진입
5. 뒤로가기 시 `reset()` 호출 후 홈 이동 (A-4-4)

### 중복 선택 방지

- 이미 선택된 `cardId`는 `selectCard`에서 무시 (스펙: "재탭 시 아무 반응 없음")
- 3장 선택 완료 후 추가 탭 무시

### 작업 — TDD 사이클

**RED (cardUtils):**
- [x] `src/utils/cardUtils.test.ts` 작성 (2 tests)
  - determineOrientation: boolean 반환, 확률 분포 검증 (100회 실행 시 양쪽 모두 발생)
- [x] `pnpm run test -- cardUtils` 실행 → **FAIL 확인**

**GREEN (cardUtils):**
- [x] `src/utils/cardUtils.ts` 구현
- [x] `pnpm run test -- cardUtils` 실행 → **PASS 확인** (2 tests)

**RED (ReadingPage 스토어 연동):**
- [x] `ReadingPage.test.tsx` 업데이트 — 3-8에서 스토어 mock 테스트로 통합 구현
- [x] `pnpm run test -- ReadingPage` 실행 → **FAIL 확인**

**GREEN (ReadingPage 스토어 연동):**
- [x] `ReadingPage.tsx` — `useState` → `useReadingStore` 교체 (3-8에서 완료)
- [x] `pnpm run test -- ReadingPage` 실행 → **PASS 확인**

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증 (chrome-devtools)

- [x] 개발 서버 실행 (`pnpm run dev`)
- [x] chrome-devtools: 모바일 에뮬레이션 (390x844, 3x DPR)
- [x] `/reading/daily-today` 페이지 네비게이션 → 슬롯 3개 + 카드 22장 + "점 보기 (0/3)" 확인
- [x] 카드 3장 선택 → 슬롯에 카드 이미지 표시 + "다시 선택" + "결과 보기" 버튼 확인
- [x] 콘솔 에러/경고 0건 확인
- [x] 스크린샷 촬영 완료

---

## 3-4. 광고 게이트

### 개요

"결과 보기" 클릭 → 로딩 화면 → 광고 로드 → 결과 페이지 전환 흐름을 구현한다.

스펙 참조: `02-taro-mvp.md` — 광고 로드 실패 시 (line 191~202)

### 흐름

```
결과 보기 클릭
  → phase = 'loading'
  → LoadingScreen 표시 (터치/뒤로가기 차단)
  → 광고 로드 시도 (타임아웃 5초)
  → 성공 → 로딩 해제 → 광고 시청 → phase = 'streaming' → AI 호출
  → 실패 → 로딩 해제 → 조용히 스킵 → phase = 'streaming' → AI 호출
```

### MVP 광고 구현

- MVP에서는 AdSense/AdMob 실제 연동이 아닌 **광고 게이트 훅**으로 추상화
- 광고 로드/표시 로직은 Phase 5(배포)에서 실제 SDK 연동

```typescript
// src/hooks/useAdGate.ts
export function useAdGate() {
  const showAd: () => Promise<boolean>;  // true = 광고 시청 완료, false = 실패/스킵
}
```

- MVP 구현: 5초 타임아웃 후 항상 `false` 반환 (광고 SDK 미연동 시 조용히 스킵)
- 향후 AdSense/AdMob SDK 연동 시 `showAd` 내부만 교체

### 작업 — TDD 사이클

**RED:**
- [x] `src/hooks/useAdGate.test.ts` 작성 (3 tests)
  - showAd 호출 시 Promise 반환
  - 타임아웃 5초 이내 resolve (`vi.useFakeTimers`로 시간 제어)
  - 실패 시 false 반환 (에러 throw 안 함)
- [x] `pnpm run test -- useAdGate` 실행 → **FAIL 확인**

**GREEN:**
- [x] `src/hooks/useAdGate.ts` 구현
- [x] `pnpm run test -- useAdGate` 실행 → **PASS 확인** (3 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증

- 불필요 (MVP에서 광고 SDK 미연동 — 훅만 추상화)

---

## 3-5. AI SSE 스트리밍

### 개요

Supabase Edge Function(`/functions/v1/interpret`)을 호출하여 SSE 스트리밍으로 AI 해석을 수신한다.

스펙 참조: `02-taro-mvp.md` — API 설계 (line 369~381), `03-ai-design.md` — 서빙 구조

### 3-5a. SSE 클라이언트

```typescript
// src/utils/sseClient.ts
export async function streamInterpretation(
  request: ReadingRequest,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal,
): Promise<void>;
```

- `fetch` API로 SSE 스트리밍 수신 (`ReadableStream`)
- 엔드포인트: `${VITE_SUPABASE_URL}/functions/v1/interpret`
- 헤더: `Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}`, `Content-Type: application/json`
- 요청 본문: `{ themeId, cards }`
- 스트리밍 파싱: `TextDecoderStream`으로 청크 읽기
- `AbortSignal` 지원: 뒤로가기 시 스트리밍 중단 (A-5-4)

### 3-5b. 응답 파싱

```typescript
// src/utils/parseInterpretation.ts
export function parseInterpretation(raw: string): { interpretation: string; summary: string };
```

스펙 참조: `03-ai-design.md` — 응답 파싱 (line 297~308)

- `### 한줄 요약` 섹션 추출 → `summary`
- 나머지 → `interpretation`

### 3-5c. 에러 핸들링 + 재시도

스펙 참조: `02-taro-mvp.md` — AI 서버 다운 시 (line 136~163)

```
AI 호출 (타임아웃 30초)
  → 실패 → 조용히 1회 재시도 (타임아웃 15초)
  → 재실패 →
      1. 미완료 세션 localStorage에 저장 (usePendingStore.addSession)
      2. phase = 'error'
      3. ErrorModal 표시
```

```typescript
// src/hooks/useInterpretation.ts
export function useInterpretation() {
  const interpret: (request: ReadingRequest) => Promise<void>;
  const abort: () => void;  // 스트리밍 중단
}
```

- `interpret` 내부에서 `streamInterpretation` 호출
- 청크 수신 시 `useReadingStore.appendInterpretation(chunk)` 호출
- 완료 시 `parseInterpretation` → `completeReading` → `useHistoryStore.addResult`
- 실패 시 재시도 1회 → 재실패 시 `usePendingStore.addSession` + ErrorModal

### 3-5d. 스트리밍 중 뒤로가기 (A-5-4)

- 스트리밍 중 뒤로가기 허용
- `AbortController.abort()` 호출로 스트리밍 중단
- 수신된 텍스트가 있으면 미완료 세션으로 저장 (이어서 보기 가능)
- 수신된 텍스트가 없으면 미완료 세션 저장 (재해석 요청)

### API 확인 (context7)

- [x] `fetch` + `ReadableStream` — SSE 스트리밍 수신 패턴, `TextDecoderStream`, `AbortController` 사용법 확인

### 작업 — TDD 사이클

**RED (sseClient):**
- [x] `src/utils/sseClient.test.ts` 작성 (5 tests)
  - 정상 스트리밍: onChunk 다중 호출 → onComplete 호출 (fetch mock 사용)
  - 네트워크 에러: onError 호출
  - AbortSignal로 중단 가능
  - 헤더 검증 (Authorization, Content-Type)
  - 요청 본문 검증
- [x] `pnpm run test -- sseClient` 실행 → **FAIL 확인**

**GREEN (sseClient):**
- [x] `src/utils/sseClient.ts` 구현
- [x] `pnpm run test -- sseClient` 실행 → **PASS 확인** (5 tests)

**RED (parseInterpretation):**
- [x] `src/utils/parseInterpretation.test.ts` 작성 (5 tests)
  - 한줄 요약 추출
  - 한줄 요약 없는 경우 빈 문자열
  - interpretation에서 한줄 요약 제거
- [x] `pnpm run test -- parseInterpretation` 실행 → **FAIL 확인**

**GREEN (parseInterpretation):**
- [x] `src/utils/parseInterpretation.ts` 구현
- [x] `pnpm run test -- parseInterpretation` 실행 → **PASS 확인** (5 tests)

**RED (useInterpretation):**
- [x] `src/hooks/useInterpretation.test.ts` 작성 (3 tests)
  - 정상 흐름: 스트리밍 → 파싱 → 히스토리 저장 (sseClient mock)
  - 실패 → 재시도 → 성공
  - 실패 → 재시도 → 재실패 → 미완료 세션 저장 + error phase
- [x] `pnpm run test -- useInterpretation` 실행 → **FAIL 확인**

**GREEN (useInterpretation):**
- [x] `src/hooks/useInterpretation.ts` 구현
- [x] `pnpm run test -- useInterpretation` 실행 → **PASS 확인** (3 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증 (chrome-devtools) — 3-8 통합 단계에서 수행

- SSE 스트리밍은 Supabase Edge Function 의존이므로, 단위 테스트에서 fetch mock으로 검증
- 실제 서버 연동 런타임 검증은 3-8 통합 단계에서 수행

---

## 3-6. 공유 기능

### 개요

"공유하기" 클릭 시 결과를 Supabase DB에 저장하고 공유 URL을 생성한다.

스펙 참조: `02-taro-mvp.md` — 공유 (line 119~124), DB 스키마 (line 322~341), API (line 402~407)

### 3-6a. Supabase 클라이언트 초기화

```typescript
// src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

- `@supabase/supabase-js` 패키지 설치 필요 (Phase 0에서 미설치)

### 3-6b. 공유 저장/조회

```typescript
// src/utils/shareService.ts
export async function saveSharedReading(result: ReadingResult): Promise<string>;  // shareId 반환
export async function getSharedReading(shareId: string): Promise<SharedReading | null>;
```

- `saveSharedReading`: `shared_readings` 테이블에 INSERT → 생성된 UUID 반환
- `getSharedReading`: ID로 SELECT → 결과 반환 (만료된 경우 null)

### 3-6c. 공유 URL 복사

```typescript
// src/hooks/useShare.ts
export function useShare() {
  const share: (result: ReadingResult) => Promise<void>;
  const isSharing: boolean;
}
```

- `share` 호출 → `saveSharedReading` → 클립보드에 URL 복사 (`navigator.clipboard.writeText`)
- URL 형식: `${window.location.origin}/shared/${shareId}`
- 복사 완료 시 토스트 알림 (간단한 상태 표시)

### 3-6d. SharedResultPage 연동

- Phase 2의 모의 데이터를 Supabase 조회로 교체
- `useParams<{ shareId: string }>()` → `getSharedReading(shareId)` 호출
- 로딩 중: LoadingScreen 표시
- 데이터 없음 (만료/삭제): 안내 메시지 + 홈 이동 CTA

### API 확인 (context7)

- [x] `@supabase/supabase-js` — `createClient` 초기화, `from().insert().select().single()`, `from().select().eq().maybeSingle()` API 확인

### 작업 — TDD 사이클

**사전 준비:**
- [x] `pnpm add @supabase/supabase-js` — 패키지 설치 (`apps/web/` 디렉토리에서)
- [x] `src/utils/supabase.ts` — Supabase 클라이언트 초기화
- [x] `.env.local` / `.env.example` — 환경 변수 등록

**RED (shareService):**
- [x] `src/utils/shareService.test.ts` 작성 (5 tests, Supabase 클라이언트 mock)
  - saveSharedReading: shareId 반환
  - saveSharedReading: Supabase 에러 시 throw
  - getSharedReading: 데이터 반환 (snake_case → camelCase 변환)
  - getSharedReading: 없는 ID → null
  - getSharedReading: Supabase 에러 시 throw
- [x] `pnpm run test -- shareService` 실행 → **FAIL 확인**

**GREEN (shareService):**
- [x] `src/utils/shareService.ts` 구현 (SharedReading 인터페이스 + THEMES 조회로 theme_title 매핑)
- [x] `pnpm run test -- shareService` 실행 → **PASS 확인** (5 tests)

**RED (useShare):**
- [x] `src/hooks/useShare.test.ts` 작성 (3 tests)
  - share 호출 → 클립보��에 URL 복사 (`navigator.clipboard.writeText` mock)
  - isSharing 상태 변경 (true → false)
  - 에러 시 throw 안 함 + isSharing 복구
- [x] `pnpm run test -- useShare` 실행 → **FAIL 확인**

**GREEN (useShare):**
- [x] `src/hooks/useShare.ts` 구현
- [x] `pnpm run test -- useShare` 실행 → **PASS 확인** (3 tests)

**RED (SharedResultPage 연동):**
- [x] `SharedResultPage.test.tsx` 업데이트 — getSharedReading mock 테스트 (7 tests)
  - 로딩 중: "불러오는 중" 표시
  - 데이터 있을 때: 카드 3장 + 요약 + CTA 표시
  - 데이터 없을 때: "만료되었거나 존재하지 않는" 안내 + 홈으로 돌아가기 CTA
  - 에러 시: not-found 안내 표시
  - shareId로 getSharedReading 호출 확인
- [x] `pnpm run test -- SharedResultPage` 실행 → **FAIL 확인** (5 tests fail)

**GREEN (SharedResultPage 연동):**
- [x] `SharedResultPage.tsx` — 모의 데이터 → getSharedReading 연동, 로딩/에러/not-found 상태 처리
- [x] `pnpm run test -- SharedResultPage` 실행 → **PASS 확인** (7 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증 (chrome-devtools)

- [x] chrome-devtools: 모바일 에뮬레이션 (390x844, 3x DPR)
- [x] `/shared/nonexistent-id` 페이지 네비게이션 → "불러오는 중" → "만료되었거나 존재하지 않는 결과" 표시 확인
- [x] 존재하지 않는 shareId → 안내 메시지 + "홈으로 돌아가기" 버튼 확인
- [x] 콘솔 에러: Supabase 404 응답만 (기대 동작, 앱 코드 에러 0건)
- [ ] 실제 공유 데이터로 정상 표시 확인 (Supabase 테이블 + Edge Function 배포 후)

---

## 3-7. 미완료 세션 + 모달 억제

### 개요

AI 실패 시 미완료 세션을 저장하고, 홈 진입 시 모달로 복구를 안내한다.

스펙 참조: `02-taro-mvp.md` — 미완료 세션 복구 (line 152~172)

### 3-7a. 미완료 세션 UI 형태 결정

Phase 2 계획서에서 보류된 사항: 스펙은 "모달"(체크박스, 목록, 닫기), Stitch는 "토스트"로 디자인.
→ **스펙 우선: 모달 형태로 구현** (스펙에 체크박스/목록/닫기가 명시되어 있으므로)

### 3-7b. PendingSessionModal 컴포넌트

```typescript
// src/components/ui/PendingSessionModal.tsx
interface PendingSessionModalProps {
  sessions: PendingSession[];
  onResume: (sessionId: string) => void;
  onClose: () => void;
  onSuppress: () => void;  // "더 이상 보지 않기"
}
```

- 1건: 단일 세션 정보 표시
- 2~3건: 목록 표시
- [이어서 보기]: 선택한 세션으로 AI 해석 재요청 (광고 스킵)
- [닫기]: 모달 닫힘 (다음 홈 진입 시 다시 표시)
- □ 더 이상 보지 않기: 체크 시 당일 자정까지 모달 억제

### 3-7c. 모달 억제 플래그

스펙: "미완료 세션 데이터와 독립 관리"

```typescript
// src/utils/suppressionUtil.ts
const SUPPRESSION_KEY = 'pending_modal_suppressed_until';

export function isSuppressed(): boolean;          // suppressedUntil > now
export function suppressUntilMidnight(): void;     // 당일 자정 timestamp 저장
export function clearSuppression(): void;
```

- storageUtil 경유하여 저장
- 자정에 자연 만료 (만료 판정은 timestamp 비교)

### 3-7d. HomePage 연동

```
HomePage mount
  → usePendingStore.clearExpired()  // 만료 세션 정리
  → isSuppressed() 확인
  → 미억제 + 활성 세션 있으면 → PendingSessionModal 표시
```

- "이어서 보기" 클릭 → 광고 스킵 → 바로 AI 해석 요청 (`adWatched` 확인)
- AI 다시 실패 시 → 동일 플로우 반복 (세션 유지)

### 작업 — TDD 사이클

**RED (suppressionUtil):**
- [x] `src/utils/suppressionUtil.test.ts` 작성 (5 tests)
  - isSuppressed: 초기 false
  - suppressUntilMidnight: 자정까지 억제 (`vi.useFakeTimers`로 시간 제어)
  - isSuppressed: 자정 후 false
  - isSuppressed: 자정 직전 true
  - clearSuppression: 억제 해제
- [x] `pnpm run test -- suppressionUtil` 실행 → **FAIL 확인**

**GREEN (suppressionUtil):**
- [x] `src/utils/suppressionUtil.ts` 구현 (storageUtil 경유, timestamp 비교)
- [x] `pnpm run test -- suppressionUtil` 실행 → **PASS 확인** (5 tests)

**RED (PendingSessionModal):**
- [x] `src/components/ui/PendingSessionModal.test.tsx` 작성 (5 tests)
  - 1건 세션 표시: 테마 제목
  - 2~3건 목록 표시
  - "이어서 보기" 클릭 시 onResume(sessionId) 호출
  - "닫기" 클릭 시 onClose 호출
  - "더 이상 보지 않기" 체크 시 onSuppress 호출
- [x] `pnpm run test -- PendingSessionModal` 실행 → **FAIL 확인**

**GREEN (PendingSessionModal):**
- [x] `src/components/ui/PendingSessionModal.tsx` 구현
- [x] `pnpm run test -- PendingSessionModal` 실행 → **PASS 확인** (5 tests)

**RED (HomePage 연동):**
- [x] `HomePage.test.tsx` 업데이트 — 미완료 세션 모달 테스트 추가 (5 new tests)
  - 활성 세션 있을 때 모달 표시
  - 활성 세션 없을 때 모달 미표시
  - 억제 상태일 때 모달 미표시
  - "닫기" 클릭 → 모달 닫힘
  - "더 이상 보지 않기" 클릭 → suppressUntilMidnight 호출
- [x] `pnpm run test -- HomePage` 실행 → **FAIL 확인** (3 tests fail)

**GREEN (HomePage 연동):**
- [x] `HomePage.tsx` — PendingSessionModal + usePendingStore + suppressionUtil 연동
- [x] `pnpm run test -- HomePage` 실행 → **PASS 확인** (11 tests)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증 (chrome-devtools)

- [ ] chrome-devtools: 모바일 에뮬레이션 (390x844, 3x DPR)
- [ ] `/` 페이지 네비게이션
- [ ] (사전 조건: localStorage에 미완료 세션 데이터 수동 삽입 또는 AI 실패 시뮬레이션)
- [ ] 미완료 세션 모달 표시 확인 — 세션 목록, 버튼 레이아웃
- [ ] "닫기" 클릭 → 모달 닫힘, 페이지 새로고침 → 모달 재표시 확인
- [ ] "더 이상 보지 않기" 체크 + "닫기" → 페이지 새로고침 → 모달 미표시 확인
- [ ] 콘솔 에러/경고 0건 확인
- [ ] 스크린샷 촬영 → 스펙(02-taro-mvp.md A-5-1) 대비 레이아웃 일치 확인

---

## 3-8. 페이지 통합 — 모의 데이터 → 실제 스토어 교체

### 개요

모든 페이지에서 하드코딩된 모의 데이터를 실제 Zustand 스토어와 훅으로 교체한다.

### 3-8a. ReadingPage 통합

Phase 2 로컬 `useState` → `useReadingStore` 교체 (3-3에서 부분 완료)

추가 연결:
- "결과 보기" 클릭 → `useAdGate().showAd()` → `useInterpretation().interpret()` → 결과 페이지 이동
- 광고/AI 대기 중 `LoadingScreen` 표시
- AI 실패 시 `ErrorModal` 표시 (`onHome`: 홈 이동, `onRetry`: 재시도)

### 3-8b. ResultPage 통합

- 모의 데이터 → `useReadingStore` / `useHistoryStore.getResult(resultId)` 교체
- 새 결과: `useReadingStore`에서 읽기 (스트리밍 완료 후)
- 히스토리에서 진입: `useHistoryStore.getResult(resultId)` 사용
- AI 스트리밍 표시: `interpretation` 상태를 실시간 렌더링
- "공유하기" 버튼 → `useShare().share()` 연결
- 헤더 공유 아이콘 → `useShare().share()` 연결

### 3-8c. HistoryPage 통합

- 모의 데이터 → `useHistoryStore.results` 교체
- 빈 상태: `results.length === 0` 조건부 렌더링 (이미 Phase 2에서 구현)
- 항목 클릭 → `navigate(`/result/${item.id}`)` (Phase 2에서 이미 구현)
- 요약 통계: `results`에서 이번 달 건수 계산

### 3-8d. HomePage 통합

- 미완료 세션 모달 (3-7에서 구현)
- ThemeCard 클릭 → `useReadingStore.startReading(themeId)` + `navigate(`/reading/${themeId}`)`

### 전체 흐름 테스트

```
홈 → 테마 선택 → 카드 3장 선택 → 결과 보기
  → 로딩 → 광고(스킵) → AI 스트리밍 → 결과 표시
  → 공유하기 → URL 복사
  → "점 하나 더 찍어볼까?" → 홈
  → 히스토리 → 이전 결과 확인
```

### 작업 — TDD 사이클

**RED (ReadingPage 통합):**
- [x] `ReadingPage.test.tsx` 업데이트 — 스토어 mock 테스트 (7 tests)
  - selectCard 호출 확인
  - 3장 선택 시 "결과 보기" + "다시 선택" 버튼
  - resetSelection 호출 확인
- [x] `pnpm run test -- ReadingPage` 실행 → **FAIL 확인** (3 tests fail)

**GREEN (ReadingPage 통합):**
- [x] `ReadingPage.tsx` — `useState` → `useReadingStore` + `useAdGate` + `useInterpretation` + `determineOrientation` 연동
- [x] `pnpm run test -- ReadingPage` 실행 → **PASS 확인** (7 tests)

**RED (ResultPage 통합):**
- [x] `ResultPage.test.tsx` 업데이트 — 스토어 + 공유 mock 테스트 (7 tests)
  - useReadingStore에서 카드/해석/요약 데이터 읽기
  - "공유하기" 클릭 → useShare.share 호출
  - 홈 이동 CTA
- [x] `pnpm run test -- ResultPage` 실행 → **FAIL 확인** (3 tests fail)

**GREEN (ResultPage 통합):**
- [x] `ResultPage.tsx` — 스토어 데이터 + useShare + useHistoryStore 연동
- [x] `pnpm run test -- ResultPage` 실행 → **PASS 확인** (7 tests)

**RED (HistoryPage 통합):**
- [x] `HistoryPage.test.tsx` 업데이트 — 스토어 mock 테스트 (5 tests)
  - useHistoryStore.results 기반 목록 렌더링
  - 빈 상태 (results 0건)
  - 요약 통계: 이번 달 건수 표시
- [x] `pnpm run test -- HistoryPage` 실행 → **FAIL 확인** (2 tests fail)

**GREEN (HistoryPage 통합):**
- [x] `HistoryPage.tsx` — useHistoryStore 연동, THEMES 매핑, 카테고리 태그/색상 자동 결정
- [x] `pnpm run test -- HistoryPage` 실행 → **PASS 확인** (5 tests)

**GREEN (HomePage 통합):**
- [x] `HomePage.tsx` — `useReadingStore.startReading(themeId)` 연동은 ReadingPage의 useEffect에서 처리
- [x] `pnpm run test -- HomePage` 실행 → **PASS 확인** (미완료 세션 모달은 3-7에서 이미 연동)

**REFACTOR + LINT:**
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → tsc 에러 0건

### 런타임 검증 (chrome-devtools) — 전체 흐름 E2E

- [x] 개발 서버 실행 (`pnpm run dev`)
- [x] chrome-devtools: 모바일 에뮬레이션 (390x844, 3x DPR)

**시나리오 1: 정상 흐름 (부분 검증 — AI Edge Function 미배포)**
- [x] `/` 홈 페이지 → 테마 카드 목록, 카테고리 필터, CTA 정상 렌더링 확인
- [x] `/reading/daily-today` → 카드 3장 선택 → 슬롯 표시 + "다시 선택"/"결과 보기" 버튼 확인
- [ ] "결과 보기" → AI 스트리밍 → 결과 페이지 (Edge Function 배포 후 검증)
- [ ] 공유하기 → 클립보드 URL 복사 (실제 데이터 필요)
- [x] `/history` → 빈 상태 ("여기는 아직 비어있어요") 정상 표시 확인

**시나리오 2: AI 실패 흐름**
- [ ] Edge Function 배포 후 타임아웃 시뮬레이션으로 검증 예정

**시나리오 3: 공유 결과 페이지**
- [x] `/shared/nonexistent-id` → "만료되었거나 존재하지 않는 결과" + "홈으로 돌아가기" 정상 표시 확인
- [ ] 실제 공유 데이터 표시 (Supabase 테이블 데이터 필요)

**공통 확인:**
- [x] 모든 페이지에서 앱 코드 콘솔 에러 0건 (Supabase API 404 응답은 기대 동작)
- [x] 비정상 네트워크 요청 없음

### 3-8 전체 서브스텝 완료 게이트

- [x] `pnpm run test` 전체 PASS (113 tests)
- [x] `pnpm run lint` → 0건
- [x] `pnpm run build` → 에러 0건
- [x] chrome-devtools 부분 검증 완료 (HomePage, ReadingPage, HistoryPage, SharedResultPage not-found)
- [ ] chrome-devtools 전체 E2E (AI Edge Function + Supabase 테이블 배포 후)

---

## 새로 생성되는 파일 목록

### 유틸리티 (5개)
- `src/utils/storageUtil.ts`
- `src/utils/cardUtils.ts`
- `src/utils/sseClient.ts`
- `src/utils/parseInterpretation.ts`
- `src/utils/suppressionUtil.ts`

### Supabase (2개)
- `src/utils/supabase.ts`
- `src/utils/shareService.ts`

### 스토어 (4개)
- `src/stores/createStorageAdapter.ts`
- `src/stores/useReadingStore.ts`
- `src/stores/useHistoryStore.ts`
- `src/stores/usePendingStore.ts`

### 훅 (3개)
- `src/hooks/useAdGate.ts`
- `src/hooks/useInterpretation.ts`
- `src/hooks/useShare.ts`

### 컴포넌트 (1개)
- `src/components/ui/PendingSessionModal.tsx`

### 테스트 (11개)
- `src/utils/storageUtil.test.ts`
- `src/utils/cardUtils.test.ts`
- `src/utils/sseClient.test.ts`
- `src/utils/parseInterpretation.test.ts`
- `src/utils/suppressionUtil.test.ts`
- `src/utils/shareService.test.ts`
- `src/stores/useReadingStore.test.ts`
- `src/stores/useHistoryStore.test.ts`
- `src/stores/usePendingStore.test.ts`
- `src/hooks/useAdGate.test.ts`
- `src/hooks/useInterpretation.test.ts`
- `src/hooks/useShare.test.ts`
- `src/components/ui/PendingSessionModal.test.tsx`

### 수정되는 기존 파일 (5개)
- `src/pages/HomePage.tsx` — 스토어 + 미완료 세션 모달 연동
- `src/pages/ReadingPage.tsx` — `useState` → `useReadingStore` + 광고 + AI
- `src/pages/ResultPage.tsx` — 스토어 + 공유
- `src/pages/SharedResultPage.tsx` — Supabase 조회
- `src/pages/HistoryPage.tsx` — 스토어 연동

### 수정되는 기존 테스트 (5개)
- `src/pages/HomePage.test.tsx`
- `src/pages/ReadingPage.test.tsx`
- `src/pages/ResultPage.test.tsx`
- `src/pages/SharedResultPage.test.tsx`
- `src/pages/HistoryPage.test.tsx`

---

## 완료 체크리스트

- [x] storageUtil: 암호화+압축 파이프라인 동작
- [x] useReadingStore: 카드 선택/해제/리셋/스트리밍 누적
- [x] useHistoryStore: 최대 20건, persist, FIFO
- [x] usePendingStore: 최대 3건, 자정 만료, persist, FIFO
- [x] 카드 선택: 정/역방향 랜덤 결정, 중복 방지
- [x] 광고 게이트: 5초 타임아웃, 실패 시 조용히 스킵
- [x] AI 스트리밍: SSE 수신 + 실시간 표시 + 응답 파싱
- [x] AI 에러: 재시도 → 재실패 → 미완료 세션 저장 + error phase
- [x] 공유: Supabase 저장 → 클립보드 URL 복사
- [x] 미완료 세션 모달: 홈 진입 시 표시, "더 이상 보지 않기" 억제
- [x] 페이지 통합: 모든 페이지에서 모의 데이터 제거, 실제 스토어 사용
- [x] 새 테스트 13개 + 기존 테스트 5개 업데이트 (총 113 tests)
- [x] `pnpm run lint` 통과
- [x] `pnpm run test` 통과
- [x] `pnpm run build` 통과
- [x] chrome-devtools 모바일(390x844) 부분 검증 완료 (전체 E2E는 Edge Function 배포 후)

---

## 패키지 추가 설치

| 패키지 | 용도 | 설치 위치 |
|---|---|---|
| `@supabase/supabase-js` | Supabase DB 접근 (공유 기능) | `apps/web` |

기존 설치 완료: `zustand`, `crypto-js`, `lz-string`, `framer-motion`

---

## 스펙 정합성 확인

| 스펙 항목 | 내용 | Phase 3 구현 |
|---|---|---|
| D-2 | Zustand 스토어 3개 + storageUtil | 3-1, 3-2 |
| A-4-1 | AI 서버 다운 → 재시도 → 미완료 세션 | 3-5c |
| A-4-2 | 광고 로드 실패 → 조용히 스킵 | 3-4 |
| A-4-4 | 카드 뽑기 뒤로가기 → 즉시 홈, 상태 초기화 | 3-3 |
| A-5-1 | 미완료 세션 모달 (체크박스, 목록, 닫기) | 3-7 |
| A-5-3 | 광고 게이트 (로딩 → 광고 → 결과) | 3-4 |
| A-5-4 | 스트리밍 중 뒤로가기 허용 | 3-5d |
| C-1 | 공유 → Supabase DB → shareId | 3-6 |
| C-3 | 결과 하단 배너 광고 (홈 배너 없음) | 3-4 (플레이스홀더 유지) |

### Phase 3 범위에서 제외 — Phase 4/5로 이관

| 항목 | 내용 | 이관 대상 |
|---|---|---|
| B-4 | 카드 4단계 애니메이션 | Phase 4 |
| A-5-2 | 뒤집기 애니메이션 중 추가 탭 무시 | Phase 4 |
| OG 태그 | 공유 URL OG 태그 동적 생성 (Edge Function) | Phase 5 |
| 실제 광고 SDK | AdSense/AdMob 연동 | Phase 5 |
| GTM/GA4 | 이벤트 트래킹 (`ad_failed` 등) | Phase 5 |

---

## 참조

- 스펙: `docs/specs/02-taro-mvp.md`
- AI 설계: `docs/specs/03-ai-design.md`
- 기획 정의: `docs/기획-정의목록.md`
- Phase 2 계획서: `docs/frontend/phase-2-pages.md`
- 디자인 시스템: `docs/design/stitch/design-system.md`
- 타입 정의: `packages/shared/src/types.ts`
