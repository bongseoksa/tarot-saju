# Sprint 1-BE: 백엔드 독립 개발

> [← 진행 관리](../PROGRESS.md)

---

## Task 1-BE-1: Supabase 프로젝트 초기화

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

## Task 1-BE-2: shared_readings DB 마이그레이션

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

## Task 1-BE-3: interpret Edge Function 스켈레톤

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
   - MVP: `Access-Control-Allow-Origin: *` (개발용)
   - **프로덕션 배포 시(Task 3-4)**: `*` → `https://jeomhana.vercel.app` 으로 제한 필수

4. 로컬 테스트
   ```bash
   supabase functions serve interpret --env-file .env.local
   ```

**검증:**
- [ ] `curl -X POST http://localhost:54321/functions/v1/interpret -H "Content-Type: application/json" -d '{"themeId":"daily-today","cards":[{"cardId":0,"positionIndex":0,"isReversed":false}]}' -H "Authorization: Bearer <anon_key>"` → SSE 스트림 수신
- [ ] CORS 헤더 정상 반환
- [ ] Ollama 미실행 시 502 에러 반환

---

## Task 1-BE-4: 공유 결과 저장/조회 (SDK + RLS)

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

## Task 1-BE-5: 동적 OG 태그 Edge Function

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
