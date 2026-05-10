# HANDOFF — 점하나 MVP 작업 계획서

> 이 문서는 Claude Code 세션 간 작업을 인수인계하기 위한 상세 계획서입니다.
> 각 Task는 독립적으로 실행 가능하며, 의존 관계가 명시되어 있습니다.

---

## 현재 상태 진단

### 완료된 작업

| 영역 | 상태 | 내용 |
|---|---|---|
| 스펙 문서 | DONE | `docs/specs/` 전체 구조화 완료 (01~07 + backlog + README) |
| 디자인 시스템 | DONE | `docs/design/stitch/design-system.md` 머지 완료 |
| 공유 타입 | DONE | `packages/shared/src/types.ts` — TarotCard, Spread, DrawnCard, ReadingRequest, ReadingResult, PendingSession, TarotTheme |
| 공유 데이터 | PARTIAL | `packages/shared/data/tarot-cards.json` 존재. themes/spreads는 `apps/web/src/data/`에만 존재 |
| MSW 패키지 | DONE | `packages/msw-handler/` — createMock, server, browser, gateway 구현 완료 |
| FE 페이지 | DONE | HomePage, ReadingPage, ResultPage, HistoryPage, SharedResultPage |
| FE 컴포넌트 | DONE | AppHeader, AppLayout, PageTransition, CardGrid, CardSlot, ThemeCard, CategoryChip, LoadingScreen, ErrorModal, PendingSessionModal 등 |
| FE 스토어 | DONE | useReadingStore, useHistoryStore, usePendingStore + storageAdapter |
| FE 유틸 | DONE | storageUtil, sseClient, cardUtils, haptic, motionConfig, parseInterpretation, shareService, suppressionUtil |
| FE 훅 | DONE | useInterpretation, useAdGate, useShare |
| FE 테스트 | DONE | 각 스토어/유틸/컴포넌트 테스트 파일 존재 |

### 미완료 작업

| 영역 | 상태 | 내용 |
|---|---|---|
| 정적 데이터 공유화 | TODO | themes, spreads를 `packages/shared/data/`로 이동 |
| MSW interpret 핸들러 | TODO | API 계약 기반 interpret mock handler 작성 |
| BE Edge Function | TODO | `supabase/functions/interpret/` 전체 미구현 |
| BE DB 스키마 | TODO | `supabase/migrations/` shared_readings 테이블 |
| AI 프롬프트 빌더 | TODO | `packages/shared/prompts/` 전체 미구현 |
| AI 테스트 인프라 | TODO | `scripts/ai-test/` 전체 미구현 |
| 인프라 | TODO | Vercel 배포, Cloudflare Tunnel, launchd, GTM |

---

## Sprint 0: 공통 기반

> 목표: 3개 트랙(FE/BE/AI)이 독립적으로 작업 가능한 계약(contract) 확정

### Task 0-1: 정적 데이터 packages/shared로 통합

**상태**: TODO
**의존**: 없음
**담당**: 공통

**현재 문제:**
- `apps/web/src/data/themes.ts` — 11개 테마 정의 (FE 로컬)
- `apps/web/src/data/spreads.ts` — 쓰리카드 스프레드 정의 (FE 로컬)
- `packages/shared/data/tarot-cards.json` — 22장 카드 정적 데이터 (공유)
- themes/spreads는 BE(Edge Function), AI(prompt-builder)에서도 필요하므로 공유 패키지로 이동해야 함

**작업 내용:**

1. `packages/shared/data/themes.ts` 생성
   - `apps/web/src/data/themes.ts`의 `THEMES` 배열을 이동
   - `CategoryMeta`, `CATEGORIES`, `getCategoryMeta`는 FE 전용이므로 `apps/web/`에 유지
   - `packages/shared/src/index.ts`에서 re-export

2. `packages/shared/data/spreads.ts` 생성
   - `apps/web/src/data/spreads.ts`의 `THREE_CARD_SPREAD`를 이동
   - `packages/shared/src/index.ts`에서 re-export

3. `packages/shared/data/cards.ts` 생성
   - `tarot-cards.json`을 TypeScript 모듈로 래핑 (타입 안전)
   - `export const TAROT_CARDS: TarotCard[] = ...`
   - `packages/shared/src/index.ts`에서 re-export

4. `apps/web/src/data/themes.ts` 수정
   - `THEMES`를 `@tarot-saju/shared`에서 import하도록 변경
   - `CategoryMeta`, `CATEGORIES`, `getCategoryMeta`는 그대로 유지

5. `apps/web/src/data/spreads.ts` 수정
   - `THREE_CARD_SPREAD`를 `@tarot-saju/shared`에서 import하도록 변경

**검증:**
- [ ] `pnpm run test` (apps/web) 전체 통과
- [ ] `packages/shared`에서 THEMES, THREE_CARD_SPREAD, TAROT_CARDS export 확인
- [ ] `apps/web/src/data/`에서 shared import 정상 동작

---

### Task 0-2: API 계약 타입 정의

**상태**: TODO
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
- [ ] 타입 컴파일 성공 (`tsc --noEmit`)
- [ ] FE sseClient.ts가 SSEEvent 타입과 일치하는지 확인

**참고:** 현재 `sseClient.ts`는 raw text streaming. SSE JSON 포맷으로 전환 필요 (Task 2-2에서 처리).

---

### Task 0-3: MSW interpret mock 핸들러

**상태**: TODO
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

3. `setConfig`으로 에러/지연 시뮬레이션 지원
   - `setConfig("interpret", { delay: 3000 })` — 응답 지연
   - `setConfig("interpret", { error: true })` — 500 에러 반환
   - `setConfig("interpret", { timeout: true })` — 응답 없음 (타임아웃 테스트)

**검증:**
- [ ] FE `pnpm dev`에서 카드 3장 선택 → 결과 보기 → mock 해석 스트리밍 표시
- [ ] `setConfig("interpret", { error: true })` → 에러 모달 표시
- [ ] 테스트에서 mock 핸들러 동작 확인

---

## Sprint 1-FE: 프론트엔드 독립 개발

> 대부분 구현 완료. 남은 작업은 검증 + 미비 사항 보완.

### Task 1-FE-1: 기존 FE 코드 점검 및 테스트 통과 확인

**상태**: TODO
**의존**: 없음
**담당**: FE

**작업 내용:**

1. `cd apps/web && pnpm run test` 실행 → 실패 테스트 파악
2. `pnpm run build` 실행 → 타입 에러/빌드 에러 파악
3. `pnpm run lint` 실행 → lint 에러 수정
4. 실패 항목 수정

**검증:**
- [ ] `pnpm run test` 전체 통과
- [ ] `pnpm run build` 성공
- [ ] `pnpm run lint` 에러 0건

---

### Task 1-FE-2: SSE 클라이언트 API 계약 정합성

**상태**: TODO
**의존**: Task 0-2
**담당**: FE

**현재 문제:**
- `sseClient.ts`가 raw text streaming 사용 (line 44-51)
- API 계약은 SSE JSON 포맷 (`{"type":"chunk","data":"..."}`)

**작업 내용:**

1. `sseClient.ts` 수정
   - SSE 표준 파싱 (`data:` 라인 분리)
   - JSON 파싱하여 `SSEEvent` 타입으로 처리
   - `type === "chunk"` → onChunk 콜백
   - `type === "done"` → onComplete 콜백
   - `type === "error"` → onError 콜백

2. `sseClient.test.ts` 수정
   - SSE JSON 포맷에 맞는 테스트 케이스로 업데이트

**참고 구현:**

```typescript
// SSE line parsing
const lines = buffer.split("\n");
for (const line of lines) {
  if (line.startsWith("data: ")) {
    const json = line.slice(6);
    const event: SSEEvent = JSON.parse(json);
    switch (event.type) {
      case "chunk": onChunk(event.data); break;
      case "done": onComplete(event.data); break;
      case "error": onError(new Error(event.data)); break;
    }
  }
}
```

**검증:**
- [ ] sseClient.test.ts 통과
- [ ] MSW mock 핸들러(Task 0-3)와 연동 테스트 통과

---

### Task 1-FE-3: 반응형 레이아웃 검증 (chrome-devtools)

**상태**: TODO
**의존**: Task 1-FE-1
**담당**: FE

**작업 내용:**

1. `pnpm dev` 실행
2. chrome-devtools MCP로 각 페이지 모바일(390x844) 스크린샷 캡처
3. 체크리스트 확인:

| 페이지 | 확인 항목 |
|---|---|
| 홈 | 퀵 CTA 표시, 카테고리 칩 필터, 테마 카드 목록, 푸터 |
| 카드 뽑기 | 상단 슬롯 3개, 22장 카드 그리드 (4열), 하단 결과 보기 버튼 |
| 결과 | 카드 3장 요약, 해석 텍스트 영역, 공유/저장 버튼, 하단 CTA |
| 히스토리 | 결과 목록 또는 빈 상태 표시 |

4. 문제 발견 시 수정

**검증:**
- [ ] 모바일 뷰포트(390x844)에서 모든 페이지 정상 표시
- [ ] 콘솔 에러/경고 없음

---

## Sprint 1-BE: 백엔드 독립 개발

### Task 1-BE-1: Supabase 프로젝트 초기화

**상태**: TODO
**의존**: 없음
**담당**: BE

**작업 내용:**

1. Supabase CLI 설치 확인
   ```bash
   supabase --version
   # 없으면: brew install supabase/tap/supabase
   ```

2. 로컬 Supabase 초기화
   ```bash
   supabase init
   # → supabase/ 디렉토리 생성 (config.toml 등)
   ```

3. `.env.local` 업데이트 확인
   - `VITE_SUPABASE_URL` — Supabase 프로젝트 URL (또는 로컬 `http://127.0.0.1:54321`)
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon key

**검증:**
- [ ] `supabase/config.toml` 생성됨
- [ ] `supabase start` (로컬 개발 시) 또는 리모트 프로젝트 연결 확인

---

### Task 1-BE-2: shared_readings DB 마이그레이션

**상태**: TODO
**의존**: Task 1-BE-1
**담당**: BE

**작업 내용:**

1. 마이그레이션 파일 생성
   ```bash
   supabase migration new create_shared_readings
   ```

2. SQL 작성 (`supabase/migrations/{timestamp}_create_shared_readings.sql`)

```sql
-- 공유 결과 저장 (공유하기 클릭 시에만 INSERT)
CREATE TABLE shared_readings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id    text NOT NULL,
  theme_title text NOT NULL,
  cards       jsonb NOT NULL,
  interpretation text NOT NULL,
  summary     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT now() + interval '30 days'
);

CREATE INDEX idx_shared_readings_expires ON shared_readings (expires_at);

-- RLS
ALTER TABLE shared_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read" ON shared_readings FOR SELECT USING (true);
CREATE POLICY "anyone can insert" ON shared_readings FOR INSERT WITH CHECK (true);
```

3. 마이그레이션 적용
   ```bash
   supabase db push    # 리모트
   # 또는
   supabase db reset   # 로컬 (전체 리셋 + 마이그레이션 재적용)
   ```

**검증:**
- [ ] `supabase db push` 성공
- [ ] Supabase Dashboard에서 shared_readings 테이블 확인
- [ ] RLS 정책 활성화 확인

---

### Task 1-BE-3: interpret Edge Function 스켈레톤

**상태**: TODO
**의존**: Task 0-1, Task 0-2, Task 1-BE-1
**담당**: BE

**작업 내용:**

1. Edge Function 생성
   ```bash
   supabase functions new interpret
   # → supabase/functions/interpret/index.ts
   ```

2. `supabase/functions/interpret/index.ts` 구현

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Deno에서 packages/shared를 직접 import 불가 — 필요한 타입/데이터를 인라인 또는 별도 파일로
// Option A: Deno deploy 시 npm specifier 사용
// Option B: 필요한 데이터를 함수 내부에 복사 (MVP 단순화)

const OLLAMA_URL = Deno.env.get("OLLAMA_URL") ?? "http://localhost:11434";

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { themeId, cards } = await req.json();

    // 1. 프롬프트 조합 (buildPrompt 로직)
    const prompt = buildPrompt(themeId, cards);

    // 2. Ollama 호출 (스트리밍)
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma2:2b",
        prompt,
        stream: true,
      }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. SSE 스트리밍 중계
    const encoder = new TextEncoder();
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          // done 이벤트 전송
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", data: fullText })}\n\n`),
          );
          controller.close();
          return;
        }

        // Ollama JSON line 파싱
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n").filter(Boolean)) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "chunk", data: json.response })}\n\n`,
                ),
              );
            }
          } catch {
            // skip malformed lines
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

function buildPrompt(themeId: string, cards: DrawnCard[]): string {
  // TODO: Task 1-AI-1에서 구현한 prompt-builder 로직 연결
  // MVP 스켈레톤: 하드코딩된 프롬프트로 동작 확인
  return `당신은 경험 많은 타로 리더입니다. 한국어로 답변합니다. (stub prompt for themeId: ${themeId})`;
}
```

3. CORS 설정 확인

4. 로컬 테스트
   ```bash
   supabase functions serve interpret --env-file .env.local
   ```

**검증:**
- [ ] `curl -X POST http://localhost:54321/functions/v1/interpret -H "Content-Type: application/json" -d '{"themeId":"daily-today","cards":[{"cardId":0,"positionIndex":0,"isReversed":false}]}' -H "Authorization: Bearer <anon_key>"` → SSE 스트림 수신
- [ ] CORS 헤더 정상 반환
- [ ] Ollama 미실행 시 502 에러 반환

---

### Task 1-BE-4: 공유 결과 저장/조회 (SDK + RLS)

**상태**: TODO
**의존**: Task 1-BE-2
**담당**: BE

**현재 상태:**
- `apps/web/src/utils/shareService.ts` — Supabase SDK로 shared_readings CRUD 구현 존재
- DB가 없어서 실제 동작 미검증

**작업 내용:**

1. `shareService.ts` 코드 리뷰 — DB 스키마와 일치하는지 확인
   - insert 시 필드명 일치 여부 (theme_id, theme_title, cards, interpretation, summary)
   - select 시 id 기반 조회 정상 여부

2. 실제 DB 연결 테스트
   - `.env.local`에 Supabase URL/Key 설정
   - 결과 저장 → 조회 → 정상 반환 확인

3. 만료 삭제 정책 설정
   - Supabase Dashboard → SQL Editor:
   ```sql
   -- pg_cron 확장 활성화 (Supabase Pro 플랜 필요, 무료 티어는 수동)
   -- 또는 Supabase Scheduled Function으로 대체
   SELECT cron.schedule(
     'delete-expired-readings',
     '0 3 * * *',  -- 매일 새벽 3시
     $$DELETE FROM shared_readings WHERE expires_at < now()$$
   );
   ```
   - 무료 티어: 수동 삭제 또는 Edge Function cron으로 대체

**검증:**
- [ ] 공유 저장 (insert) → id 반환 성공
- [ ] 공유 조회 (select by id) → 데이터 반환 성공
- [ ] 만료된 데이터 삭제 정책 설정 확인

---

### Task 1-BE-5: 동적 OG 태그 Edge Function

**상태**: TODO
**의존**: Task 1-BE-4
**담당**: BE

**현재 상태:**
- `SharedResultPage.tsx` — 공유 결과 표시 페이지 구현 존재
- OG 태그는 SPA이므로 클라이언트 렌더링 후에는 늦음 → Edge Function 필요

**작업 내용:**

1. Edge Function 생성
   ```bash
   supabase functions new og-image
   # → supabase/functions/og-image/index.ts
   ```

2. 구현: `/shared/:shareId` 요청 시 HTML with OG 메타태그 반환

```typescript
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const shareId = url.pathname.split("/").pop();

  // DB에서 shared_reading 조회
  // OG meta 태그 포함 HTML 반환
  // <meta property="og:title" content="점하나 - {theme_title}" />
  // <meta property="og:description" content="{summary}" />
  // <meta property="og:image" content="{대표 카드 이미지 URL}" />
  // <script>window.location.href = "/{앱 URL}/shared/{shareId}"</script>
});
```

**참고:** Vercel rewrites로 `/shared/:shareId` 요청을 Edge Function으로 프록시하거나, Supabase 도메인 직접 사용.

**검증:**
- [ ] `curl /shared/{id}` → OG meta 태그 포함 HTML 반환
- [ ] Facebook/카카오 OG 디버거에서 미리보기 정상

---

## Sprint 1-AI: AI 독립 개발

### Task 1-AI-1: prompt-builder 구현

**상태**: TODO
**의존**: Task 0-1
**담당**: AI

**작업 내용:**

1. 디렉토리 생성

```
packages/shared/prompts/
  ├── system-prompt.ts    — 시스템 지시 (고정 텍스트)
  ├── v1-three-card.ts    — 쓰리카드 출력 형식
  ├── build-prompt.ts     — 프롬프트 조합 함수
  └── index.ts            — export
```

2. `system-prompt.ts` — 05-ai-spec.md 섹션 4의 시스템 지시 텍스트

3. `v1-three-card.ts` — 쓰리카드 출력 형식 템플릿

4. `build-prompt.ts` — 05-ai-spec.md 섹션 5의 buildPrompt 함수 구현
   - 입력: `ReadingRequest`, `TarotCard[]`, `Spread`
   - 출력: 조합된 프롬프트 문자열
   - 카드 데이터/테마 정보/스프레드 위치를 조합

5. `packages/shared/src/index.ts` 업데이트
   - `buildPrompt`, `SYSTEM_PROMPT` export

**검증:**
- [ ] `buildPrompt` 유닛 테스트 작성 + 통과
  - 11개 테마 각각에 대해 프롬프트 생성 → 빈 문자열 아님
  - 카드 이름, 방향, 키워드가 프롬프트에 포함됨
  - 시스템 지시가 프롬프트 앞부분에 포함됨

---

### Task 1-AI-2: 시스템 프롬프트 v1 작성 + 로컬 Ollama 수동 테스트

**상태**: TODO
**의존**: Task 1-AI-1
**담당**: AI

**작업 내용:**

1. Ollama 설치 및 모델 다운로드
   ```bash
   # Ollama 설치 확인
   ollama --version
   # 모델 다운로드
   ollama pull gemma2:2b
   ```

2. 수동 테스트 — curl로 직접 호출

   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "gemma2:2b",
     "prompt": "<buildPrompt 출력 결과 붙여넣기>",
     "stream": false
   }'
   ```

3. 응답 품질 확인
   - 한국어 자연스러움
   - 응답 구조 준수 (### 과거 해석 / ### 현재 해석 / ### 미래 해석 / ### 종합 조언 / ### 한줄 요약)
   - 심리 기법 반영 여부 (바넘 효과, 양면 진술 등)
   - 응답 길이 (300~1500자)

4. 프롬프트 1차 튜닝
   - 문제 발견 시 시스템 지시 수정
   - 05-ai-spec.md 섹션 10 "프롬프트 튜닝 가이드" 순서 따라 조정

**검증:**
- [ ] Ollama 로컬 실행 확인 (`curl http://localhost:11434/api/tags`)
- [ ] 수동 테스트 3회 이상 — 응답 구조 준수 확인
- [ ] 한국어 자연스러움 확인 (번역체 없음)

---

### Task 1-AI-3: 응답 파싱 (parseResponse) + 출력 가드레일

**상태**: TODO
**의존**: Task 1-AI-1
**담당**: AI

**현재 상태:**
- `apps/web/src/utils/parseInterpretation.ts` — FE에 파싱 로직 존재
- BE(Edge Function)에서도 동일 파싱 필요 → 공유 패키지로 이동

**작업 내용:**

1. `packages/shared/prompts/parse-response.ts` 생성

```typescript
export interface ParsedResponse {
  interpretation: string;  // 한줄 요약 제외한 전체 해석
  summary: string;         // 한줄 요약 (공유용)
}

export function parseResponse(raw: string): ParsedResponse {
  const summaryMatch = raw.match(/###\s*한줄 요약\s*\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/###\s*한줄 요약\s*\n.+/, "").trim();
  return { interpretation, summary };
}
```

2. 출력 가드레일 (`packages/shared/prompts/guard.ts`)

```typescript
export interface GuardResult {
  pass: boolean;
  failures: string[];
}

export function validateResponse(raw: string): GuardResult {
  const failures: string[] = [];

  // 형식 검증
  const requiredSections = ["과거 해석", "현재 해석", "미래 해석", "종합 조언", "한줄 요약"];
  for (const section of requiredSections) {
    if (!raw.includes(section)) failures.push(`missing_section:${section}`);
  }

  // 길이 검증
  if (raw.length < 50) failures.push("too_short");
  if (raw.length > 2000) failures.push("too_long");

  // 금칙어 검증
  const forbidden = ["죽음을 맞이", "파멸", "절망적", "최악의"];
  for (const word of forbidden) {
    if (raw.includes(word)) failures.push(`forbidden_word:${word}`);
  }

  return { pass: failures.length === 0, failures };
}
```

3. `apps/web/src/utils/parseInterpretation.ts` 수정
   - `@tarot-saju/shared`에서 `parseResponse` import하도록 변경
   - 기존 로직 제거 (shared로 이동했으므로)

**검증:**
- [ ] parseResponse 유닛 테스트 — 정상 응답에서 summary 추출
- [ ] parseResponse 유닛 테스트 — 한줄 요약 없는 응답에서 빈 summary
- [ ] validateResponse 유닛 테스트 — 정상 응답 pass
- [ ] validateResponse 유닛 테스트 — 섹션 누락 시 fail
- [ ] validateResponse 유닛 테스트 — 금칙어 포함 시 fail

---

### Task 1-AI-4: AI 테스트 인프라 (runner + guard + evaluator)

**상태**: TODO
**의존**: Task 1-AI-1, Task 1-AI-3
**담당**: AI

**작업 내용:**

1. 디렉토리 생성

```
scripts/ai-test/
  ├── runner.ts        — Ollama 직접 호출 + 결과 수집
  ├── guard.ts         — 로컬 서버 검증 (프로덕션 호출 차단)
  ├── scenarios.ts     — quick/full 시나리오 자동 생성
  ├── evaluator.ts     — 합격 기준 자동 판정
  └── report.ts        — 결과 리포트
```

2. `guard.ts` — 3중 방어 (05-ai-spec.md 섹션 9 참조)
   - URL 화이트리스트: localhost/127.0.0.1만 허용
   - 연결 검증: Ollama 헬스체크
   - 환경 변수: `TEST_OLLAMA_URL`만 사용 (기본값 `http://localhost:11434`)

3. `scenarios.ts` — 시나리오 자동 생성
   - quick: 25회 (카테고리6 x 방향패턴3 = 18 + 엣지7)
   - full: 813회 (카테고리당 44 x 6 + 엣지7 x 3반복)
   - 05-ai-spec.md 섹션 9의 수학적 설계 따름

4. `evaluator.ts` — 자동 판정
   - validateResponse 호출
   - 길이 체크 (300~1500자)
   - 카드명 일치 체크

5. `package.json` (root) 스크립트 추가
   ```json
   {
     "scripts": {
       "test:ai:quick": "tsx scripts/ai-test/runner.ts --mode quick",
       "test:ai:full": "tsx scripts/ai-test/runner.ts --mode full"
     }
   }
   ```

**검증:**
- [ ] `pnpm test:ai:quick` — 25회 실행 완료 (Ollama 필요)
- [ ] guard.ts — localhost 외 URL 시 Error throw 확인
- [ ] 결과 리포트 출력 (통과율, 실패 목록)

---

### Task 1-AI-5: test:ai:quick 실행 + 프롬프트 튜닝

**상태**: TODO
**의존**: Task 1-AI-4
**담당**: AI

**작업 내용:**

1. `pnpm test:ai:quick` 실행 (25회, ~12분)
2. 결과 분석
   - 통과율 확인 (목표: 90% 이상)
   - 실패 케이스 패턴 파악
3. 실패 케이스 기반 프롬프트 수정 (05-ai-spec.md 섹션 10 순서)
   - 1단계: 시스템 지시 수정
   - 2단계: 출력 형식 수정
   - 3단계: 카드 데이터 보강
   - 4단계: 모델 변경 (gemma2:2b → gemma2:7b)
4. 재테스트

**검증:**
- [ ] test:ai:quick 통과율 90% 이상
- [ ] 즉시 탈락 케이스 0건 (한국어 깨짐, 카드명 오류, 테마 무관, 300자 미만)

---

## Sprint 2: 통합

> Mock/stub을 실제 구현으로 교체하고 E2E 흐름 검증.

### Task 2-1: BE에 prompt-builder 연결

**상태**: TODO
**의존**: Task 1-BE-3, Task 1-AI-1
**담당**: BE + AI

**현재 상태:**
- Edge Function의 `buildPrompt`가 stub (하드코딩)
- `packages/shared/prompts/build-prompt.ts`에 실제 로직 존재

**작업 내용:**

1. Edge Function에서 prompt-builder 연결
   - Deno에서 npm 패키지 import 방식 결정:
     - Option A: `npm:` specifier (`import { buildPrompt } from "npm:@tarot-saju/shared"`)
     - Option B: 프롬프트 관련 코드를 Edge Function 내부에 복사 (MVP 단순화)
   - Option B 추천 (Supabase Edge Function의 npm import 제약 회피)

2. stub buildPrompt → 실제 buildPrompt로 교체

3. 카드/테마/스프레드 정적 데이터 Edge Function에 포함

**검증:**
- [ ] `supabase functions serve interpret` → 실제 프롬프트 생성 확인 (로그)
- [ ] curl → Ollama → SSE 스트리밍 수신 (실제 해석 문장)
- [ ] 다양한 themeId/cards 조합으로 3회 이상 테스트

---

### Task 2-2: FE에 실제 API 연결

**상태**: TODO
**의존**: Task 2-1, Task 1-FE-2
**담당**: FE + BE

**작업 내용:**

1. `.env.local` 업데이트
   - `VITE_SUPABASE_URL` — 실제 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` — 실제 anon key

2. MSW mock 비활성화 (개발 모드에서 조건부)
   - 환경 변수 `VITE_USE_MOCK`로 mock/실제 전환

3. E2E 수동 테스트 (chrome-devtools MCP)
   - 홈 → 테마 선택 → 카드 3장 선택 → 결과 보기 → 해석 스트리밍 표시
   - 전체 흐름 스크린샷 캡처

**검증:**
- [ ] 카드 3장 선택 → API 호출 → SSE 스트리밍 → 해석 화면 표시 성공
- [ ] 해석 완료 후 히스토리에 저장됨
- [ ] AI 다운 시 에러 모달 표시 → 미완료 세션 저장 → 홈에서 이어서 보기

---

### Task 2-3: 공유 기능 E2E

**상태**: TODO
**의존**: Task 2-2, Task 1-BE-4, Task 1-BE-5
**담당**: FE + BE

**작업 내용:**

1. 결과 화면에서 "공유하기" 클릭
2. shared_readings에 insert → shareId 반환
3. 공유 URL 복사 → 새 탭에서 열기
4. 공유 결과 페이지 정상 표시 확인
5. OG 태그 확인 (curl 또는 디버거)

**검증:**
- [ ] 공유 저장 → URL 생성 → 클립보드 복사 성공
- [ ] 공유 URL 접근 → 결과 표시 정상
- [ ] OG meta 태그 반환 확인

---

### Task 2-4: 에지 케이스 통합 테스트

**상태**: TODO
**의존**: Task 2-2
**담당**: 전체

**작업 내용:**

1. AI 서버 다운 시나리오
   - Ollama 중지 → 카드 선택 → 결과 보기
   - 30초 타임아웃 → 1회 재시도 → 실패
   - 에러 모달 표시 확인
   - 미완료 세션 localStorage에 저장 확인
   - 홈 진입 시 미완료 세션 모달 표시 확인
   - "이어서 보기" → 재시도 확인

2. 광고 로드 실패 시나리오 (MVP: 광고 미구현이면 스킵)
   - 광고 타임아웃 5초 → 조용히 스킵 → 결과 페이지 이동

3. 카드 뽑기 도중 뒤로가기
   - 즉시 홈 이동, 선택 상태 초기화

4. 같은 카드 중복 선택 방지
   - 선택된 카드 반투명, 재탭 시 무반응

**검증:**
- [ ] AI 다운 → 에러 모달 → 미완료 세션 → 이어서 보기 전체 흐름 성공
- [ ] 카드 뽑기 중 뒤로가기 → 홈 이동 + 상태 초기화
- [ ] 중복 선택 방지 동작 확인

---

## Sprint 3: 폴리싱 + 인프라

### Task 3-1: 광고 연동 (AdSense)

**상태**: TODO
**의존**: Task 2-2
**담당**: FE

**작업 내용:**

1. Google AdSense 계정 설정 + 사이트 승인
2. `index.html`에 AdSense 스크립트 삽입
3. 전면 광고 (Interstitial) 구현
   - 결과 보기 클릭 → 로딩 화면 → 광고 로드(5초 타임아웃) → 성공: 광고 시청 / 실패: 조용히 스킵
   - `useAdGate` 훅 수정 (현재 stub 상태)
4. 결과 화면 하단 배너 광고 1개

**검증:**
- [ ] 광고 로드 성공 → 광고 표시 → 닫기 → 결과 페이지 이동
- [ ] 광고 로드 실패 → 5초 후 자동 스킵 → 결과 페이지 이동
- [ ] GA4 `ad_failed` 이벤트 발생 확인

---

### Task 3-2: 카드 선택 애니메이션 폴리싱

**상태**: PARTIAL (기본 구현 존재)
**의존**: Task 1-FE-1
**담당**: FE

**현재 상태:**
- Framer Motion 의존성 설치됨
- `motionConfig.ts` 존재
- 기본 애니메이션 구현됨

**작업 내용:**

03-frontend-spec.md의 4단계 카드 선택 경험과 현재 구현 비교:

1. **1단계 (기대감)**: 호버/터치 시 카드 살짝 떠오름 + 빛남
2. **2단계 (몰입)**: 터치 → 뒤집기 + 주변 어두워짐 + 스케일 펄스
3. **3단계 (설렘)**: 앞면 글로우 + 카드명 페이드인 + 역방향 보라 글로우
4. **4단계 (완성감)**: 슬롯으로 스프링 이동 + 바운스 + 라벨 활성화

각 단계별 현재 구현 상태 확인 → 미비 사항 보완

**검증:**
- [ ] chrome-devtools로 카드 선택 → 4단계 애니메이션 동작 확인
- [ ] 모바일 뷰포트에서 햅틱/시각 피드백 확인
- [ ] 3장 선택 완료까지 매끄러운 흐름

---

### Task 3-3: 반응형 레이아웃 최종 검증

**상태**: TODO
**의존**: Task 2-2
**담당**: FE

**작업 내용:**

chrome-devtools MCP로 4개 브레이크포인트 검증:

| 뷰포트 | 디바이스 | 확인 |
|---|---|---|
| 360x640 | Galaxy S8 | 최소 너비 동작 |
| 390x844 | iPhone 14 | 기준 디바이스 |
| 768x1024 | iPad | 2열 레이아웃 전환 |
| 1280x800 | Desktop | 3열 + 사이드 패널 |

각 뷰포트에서 모든 페이지 (홈/카드 뽑기/결과/히스토리) 스크린샷 캡처 + 문제 수정

**검증:**
- [ ] 4개 뷰포트 x 4개 페이지 = 16개 스크린샷 확인
- [ ] 터치 타깃 44x44px 이상
- [ ] 텍스트 대비 4.5:1 이상

---

### Task 3-4: Vercel 배포 + Cloudflare Tunnel

**상태**: TODO
**의존**: Task 2-2
**담당**: Infra

**작업 내용:**

#### Vercel 배포

1. Vercel에 GitHub 리포지토리 연결
2. 빌드 설정:
   - Framework: Vite
   - Root Directory: `apps/web`
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
3. 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GTM_ID` (Task 3-5 후)
4. 배포 확인: `https://jeomhana.vercel.app`

#### Cloudflare Tunnel

1. cloudflared 설치
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. 터널 생성
   ```bash
   cloudflared tunnel create ollama-tunnel
   cloudflared tunnel route dns ollama-tunnel <subdomain>.cfargotunnel.com
   ```

3. config 설정 (`~/.cloudflared/config.yml`)
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: ~/.cloudflared/<tunnel-id>.json
   ingress:
     - hostname: <subdomain>.cfargotunnel.com
       service: http://localhost:11434
     - service: http_status:404
   ```

4. Supabase Secret 설정
   ```bash
   supabase secrets set OLLAMA_URL=https://<subdomain>.cfargotunnel.com
   ```

#### launchd 자동 실행

1. Ollama 자동 시작 plist (`~/Library/LaunchAgents/com.ollama.serve.plist`)
2. Cloudflare Tunnel 자동 시작 plist (`~/Library/LaunchAgents/com.cloudflare.tunnel.plist`)
3. 헬스체크 스크립트 (5분 간격, 3회 실패 시 텔레그램 알림)

**검증:**
- [ ] `https://jeomhana.vercel.app` 접속 → 홈 화면 표시
- [ ] Vercel → Supabase Edge Function → Cloudflare Tunnel → 로컬 Ollama → 해석 결과 수신
- [ ] PC 재시작 후 Ollama + Tunnel 자동 실행 확인

---

### Task 3-5: GTM + GA4 트래킹

**상태**: TODO
**의존**: Task 3-4
**담당**: Infra

**작업 내용:**

1. GTM 컨테이너 생성 → 컨테이너 ID 획득
2. `index.html`에 GTM 스니펫 삽입
3. GA4 속성 생성 → GTM에 GA4 태그 추가
4. 이벤트 구현 (`dataLayer.push`):

| 이벤트 | 트리거 | 파라미터 |
|---|---|---|
| `page_view` | SPA 라우팅 변경 (History Change) | 자동 |
| `select_theme` | 테마 카드 클릭 | themeId, category |
| `cards_selected` | 3장 선택 완료 | themeId, cardIds |
| `ad_impression` | 광고 노출 | ad_type |
| `ad_completed` | 광고 시청 완료 | ad_type |
| `ad_failed` | 광고 로드 실패 | error_type |
| `view_result` | 결과 페이지 도달 | themeId |
| `ai_stream_start` | SSE 스트리밍 시작 | themeId |
| `ai_stream_complete` | SSE 완료 | themeId, duration_ms |
| `ai_stream_error` | SSE 에러 | themeId, error |
| `share_result` | 공유 클릭 | method (clipboard) |

5. Vercel 환경 변수에 `VITE_GTM_ID` 추가

**검증:**
- [ ] GTM 미리보기 모드에서 이벤트 발화 확인
- [ ] GA4 실시간 리포트에서 이벤트 수신 확인
- [ ] 퍼널 (홈→테마→카드→광고→결과→공유) 전환율 추적 가능

---

### Task 3-6: test:ai:full 실행

**상태**: TODO
**의존**: Task 2-1, Task 1-AI-4
**담당**: AI

**작업 내용:**

1. `pnpm test:ai:full` 실행 (813회, ~7시간, 백그라운드)
2. 결과 분석
   - 전체 통과율 확인 (목표: 95% 이상)
   - 카테고리별 통과율 분석
   - 실패 패턴 분류
3. 실패 케이스 기반 프롬프트 최종 튜닝
4. 재테스트 (실패 카테고리만)

**검증:**
- [ ] 전체 통과율 95% 이상
- [ ] 즉시 탈락 케이스 0건
- [ ] 3회 반복 일관성 검증 통과

---

## 의존 관계 그래프

```
Task 0-1 (정적 데이터 공유화)
  ├──→ Task 0-3 (MSW interpret mock)
  ├──→ Task 1-AI-1 (prompt-builder)
  └──→ Task 1-BE-3 (Edge Function)

Task 0-2 (API 계약 타입)
  ├──→ Task 0-3 (MSW interpret mock)
  ├──→ Task 1-FE-2 (SSE 클라이언트 정합성)
  └──→ Task 1-BE-3 (Edge Function)

Task 0-3 (MSW interpret mock)
  └──→ Task 1-FE-2, 1-FE-3 (FE 테스트)

Task 1-BE-1 (Supabase 초기화)
  └──→ Task 1-BE-2 (DB 마이그레이션)
       └──→ Task 1-BE-4 (공유 저장/조회)
            └──→ Task 1-BE-5 (OG 태그)

Task 1-AI-1 (prompt-builder)
  ├──→ Task 1-AI-2 (수동 테스트)
  ├──→ Task 1-AI-3 (파싱 + 가드레일)
  └──→ Task 1-AI-4 (테스트 인프라)
       └──→ Task 1-AI-5 (quick 테스트)

--- Sprint 2 싱크 ---

Task 1-BE-3 + Task 1-AI-1 → Task 2-1 (BE + AI 연결)
Task 2-1 + Task 1-FE-2 → Task 2-2 (FE + BE 연결)
Task 2-2 + Task 1-BE-4 + Task 1-BE-5 → Task 2-3 (공유 E2E)
Task 2-2 → Task 2-4 (에지 케이스)

--- Sprint 3 ---

Task 2-2 → Task 3-1 (광고)
Task 2-2 → Task 3-3 (반응형 검증)
Task 2-2 → Task 3-4 (배포)
Task 3-4 → Task 3-5 (트래킹)
Task 2-1 + Task 1-AI-4 → Task 3-6 (AI full 테스트)
```

---

## 병렬 실행 가능 그룹

### Group A (동시 착수 가능 — 의존 없음)
- Task 0-1: 정적 데이터 공유화
- Task 0-2: API 계약 타입
- Task 1-FE-1: 기존 FE 점검
- Task 1-BE-1: Supabase 초기화

### Group B (Group A 완료 후)
- Task 0-3: MSW interpret mock (← 0-1, 0-2)
- Task 1-AI-1: prompt-builder (← 0-1)
- Task 1-BE-2: DB 마이그레이션 (← 1-BE-1)
- Task 1-BE-3: Edge Function 스켈레톤 (← 0-1, 0-2, 1-BE-1)

### Group C (Group B 완료 후)
- Task 1-FE-2: SSE 클라이언트 정합성 (← 0-2, 0-3)
- Task 1-FE-3: 반응형 검증 (← 1-FE-1)
- Task 1-AI-2: Ollama 수동 테스트 (← 1-AI-1)
- Task 1-AI-3: 파싱 + 가드레일 (← 1-AI-1)
- Task 1-BE-4: 공유 저장/조회 (← 1-BE-2)

### Group D (Group C 완료 후)
- Task 1-AI-4: AI 테스트 인프라 (← 1-AI-1, 1-AI-3)
- Task 1-BE-5: OG 태그 (← 1-BE-4)

### Group E (Sprint 2 — Group D 완료 후)
- Task 2-1 → Task 2-2 → Task 2-3 → Task 2-4 (순차)
- Task 1-AI-5: quick 테스트 (← 1-AI-4, Group D와 병렬 가능)

### Group F (Sprint 3 — Sprint 2 완료 후)
- Task 3-1, 3-2, 3-3 (병렬)
- Task 3-4 → Task 3-5 (순차)
- Task 3-6 (독립)

---

## 싱크 규칙

| 규칙 | 설명 |
|---|---|
| **계약 변경 시 전 트랙 공유** | `packages/shared/`의 타입이나 API 계약 변경 → 관련 스펙 문서 즉시 갱신 |
| **Sprint 경계에서 통합 테스트** | Sprint 1 완료 후 반드시 Sprint 2 통합 수행 |
| **MSW mock = API 계약의 거울** | FE mock 응답 = BE 실제 응답 포맷. 계약 변경 시 mock도 갱신 |
| **prompt-builder 단일 소스** | BE(Edge Function)와 AI(테스트)가 동일 소스 사용. 복사본 금지 |
| **문서 최신화** | 각 Task 완료 시 관련 `docs/` 문서 변경 여부 확인 + 반영 |
