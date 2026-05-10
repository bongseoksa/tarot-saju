# Sprint 0: 공통 기반

> 목표: 3개 트랙(FE/BE/AI)이 독립적으로 작업 가능한 계약(contract) 확정
>
> [← 진행 관리](../PROGRESS.md)

---

## Task 0-1: 정적 데이터 packages/shared로 통합

**상태**: DONE
**의존**: 없음
**담당**: 공통

**현재 문제:**
- `apps/web/src/data/themes.ts` — 11개 테마 정의 (FE 로컬)
- `apps/web/src/data/spreads.ts` — 쓰리카드 스프레드 정의 (FE 로컬)
- `packages/shared/data/tarot-cards.json` — 22장 카드 정적 데이터 (공유)
- themes/spreads는 BE(Edge Function), AI(prompt-builder)에서도 필요하므로 공유 패키지로 이동해야 함

**작업 내용:**

1. `packages/shared/src/data/themes.ts` 생성 — `THEMES` 배열 (11개 테마)
2. `packages/shared/src/data/spreads.ts` 생성 — `THREE_CARD_SPREAD`
3. `packages/shared/src/data/cards.ts` 생성 — `tarot-cards.json`을 TypeScript 모듈로 래핑
4. `packages/shared/src/index.ts`에서 re-export
5. 내부 import는 `@shared/*` 절대경로 사용 (tsconfig paths)

**검증:**
- [x] `tsc --noEmit` 통과
- [x] `packages/shared`에서 THEMES, THREE_CARD_SPREAD, TAROT_CARDS export 확인

---

## Task 0-2: API 계약 타입 정의

**상태**: DONE
**의존**: 없음
**담당**: 공통

**목표:** interpret 엔드포인트의 요청/응답/SSE 이벤트 포맷을 타입으로 확정

**작업 내용:**

1. `packages/shared/src/api.ts` 생성

```typescript
// --- interpret endpoint ---

/** POST /functions/v1/interpret 요청 body */
export interface InterpretRequest {
  themeId: string;
  cards: DrawnCard[];
}

/** SSE 이벤트 타입 */
export type SSEEventType = "chunk" | "done" | "error";

/** SSE 이벤트 데이터 */
export interface SSEEvent {
  type: SSEEventType;
  data: string; // chunk: 텍스트 조각, done: 전체 텍스트, error: 에러 메시지
}

/** interpret 최종 결과 (done 이벤트의 파싱 결과) */
export interface InterpretResult {
  interpretation: string;
  summary: string;
}

/** interpret 에러 응답 (HTTP 400/500) */
export interface InterpretError {
  error: string;
}
```

2. `packages/shared/src/index.ts` 업데이트
   - api.ts 타입들 re-export

**SSE 포맷 계약:**

```
// 성공 시 SSE 스트림
data: {"type":"chunk","data":"카드가..."}

data: {"type":"chunk","data":"보여주는..."}

data: {"type":"done","data":"<전체 해석 텍스트>"}

// 실패 시
data: {"type":"error","data":"Ollama connection failed"}
```

**검증:**
- [x] 타입 컴파일 성공 (`tsc --noEmit`)
- [ ] FE sseClient.ts가 SSEEvent 타입과 일치하는지 확인 (Task 1-FE-2에서 처리)

---

## Task 0-3: MSW interpret mock 핸들러

**상태**: DONE
**의존**: Task 0-1, Task 0-2
**담당**: FE

**목표:** FE가 실제 BE 없이 interpret API를 테스트할 수 있는 mock 핸들러

**작업 내용:**

1. interpret mock 핸들러 생성

   위치: `packages/msw-handler/src/gateway/interpret.ts` (또는 기존 gateway 구조에 맞게)

   동작:
   - POST `/functions/v1/interpret` 요청을 가로챔
   - `InterpretRequest` body에서 themeId, cards 추출
   - 고정 해석 텍스트를 SSE 포맷으로 스트리밍 반환
   - chunk 단위로 50ms 간격 전송 (스트리밍 UX 테스트용)
   - 마지막에 done 이벤트 전송

2. 고정 해석 텍스트 (mock용)

```
### 과거 해석
지나온 시간 속에서 당신은 이미 많은 것을 경험하셨습니다.
그 과정에서 쌓인 감정과 기억이 지금의 당신을 만들었습니다.

### 현재 해석
지금 이 순간, 새로운 가능성이 당신 앞에 펼쳐져 있습니다.
마음속 깊은 곳에서 들려오는 목소리에 귀를 기울여 보세요.

### 미래 해석
앞으로의 길에는 작은 전환점이 기다리고 있습니다.
지금의 선택이 미래를 밝히는 빛이 될 것입니다.

### 종합 조언
과거의 경험을 바탕으로 현재를 단단히 딛고 서세요.
미래는 당신의 용기 있는 한 걸음에서 시작됩니다.

### 한줄 요약
새로운 시작이 다가오고 있어요
```

3. `setInterpretConfig()`으로 에러/지연 시뮬레이션 지원
   - `setInterpretConfig({ delay: 3000 })` — 응답 지연
   - `setInterpretConfig({ error: true })` — 500 에러 반환
   - `setInterpretConfig({ timeout: true })` — 응답 없음 (타임아웃 테스트)

4. `server.ts`, `browser.ts`에 interpretHandler 등록

**검증:**
- [x] `pnpm run build` (msw-handler) 성공
- [ ] FE `pnpm dev`에서 카드 3장 선택 → 결과 보기 → mock 해석 스트리밍 표시 (FE 구현 후)
- [ ] 테스트에서 mock 핸들러 동작 확인 (FE 테스트 시)
