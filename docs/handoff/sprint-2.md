# Sprint 2: 통합

> Mock/stub을 실제 구현으로 교체하고 E2E 흐름 검증.
>
> [← 진행 관리](../PROGRESS.md)

---

## Task 2-1: BE에 prompt-builder 연결

**상태**: DONE
**의존**: Task 1-BE-3, Task 1-AI-1
**담당**: BE + AI

**현재 상태:**
- Sprint 1-BE에서 `supabase/functions/_shared/mod.ts`에 실제 `buildPrompt`, `validateResponse`, 시스템 프롬프트, 카드/테마/스프레드 데이터를 모두 구현 완료
- `packages/shared/`가 원본, `_shared/mod.ts`는 파생 복사본 (파일 상단에 `pnpm sync:edge` 안내 포함)
- 원본과 파생본의 로직이 동일함을 확인 (2026-05-10)

**구현 결과:**

1. **단일 소스 원칙 — 복사+싱크 방식 채택**
   - Supabase Edge Function은 Deno 런타임이므로 npm 패키지 직접 import에 제약이 있음
   - `_shared/mod.ts`에 `packages/shared/`의 핵심 로직을 파생 복사하여 사용
   - 원본 변경 시 `pnpm sync:edge`로 갱신 (파일 상단 주석에 명시)

2. **포함된 기능:**
   - `buildPrompt()` — 테마/카드/스프레드 기반 프롬프트 생성 (packages/shared와 동일)
   - `validateResponse()` — 출력 가드레일 (필수 섹션, 길이, 금칙어)
   - `parseResponse()` — 응답 파싱 (해석/요약 분리)
   - 정적 데이터: `TAROT_CARDS`, `THREE_CARD_SPREAD`, `THEMES`
   - 시스템 프롬프트 + 응답 형식 템플릿

3. **interpret Edge Function** (`supabase/functions/interpret/index.ts`)이 `_shared/mod.ts`에서 import하여 사용 중

**검증:**
- [x] `_shared/mod.ts`와 `packages/shared/` 원본 로직 일치 확인
- [x] interpret Edge Function이 실제 buildPrompt 사용 (stub 아님)
- [ ] `supabase functions serve interpret` → Ollama 연동 실시간 테스트 (로컬 Ollama 필요)
- [ ] curl → Ollama → SSE 스트리밍 수신 (Sprint 2-2 통합 시 검증)

---

## Task 2-2: FE에 실제 API 연결

**상태**: DONE
**의존**: Task 2-1, Task 1-FE-2
**담당**: FE + BE

**구현 결과:**

1. `.env.local` 설정 완료
   - `VITE_SUPABASE_URL` — 실제 Supabase URL (`https://aecasypyugpftkpvngvs.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` — 실제 anon key
   - 로컬 Ollama 테스트 시 `http://localhost:54321` (local-proxy) 사용 가능

2. SSE 클라이언트 수정 (`apps/web/src/utils/sseClient.ts`)
   - Authorization 헤더에 `Bearer ${VITE_SUPABASE_ANON_KEY}` 추가 (Supabase Edge Function 인증)

3. Edge Function `done` 이벤트 수정 (`supabase/functions/interpret/index.ts`)
   - `parseResponse(fullText)`로 파싱 후 `{ interpretation, summary }` JSON 전송
   - FE `onComplete`의 `JSON.parse(data)` as `InterpretResult`와 정합성 확보

4. API 계약 주석 업데이트 (`packages/shared/src/api.ts`)
   - `SSEEvent.data` — done 이벤트: "JSON string of InterpretResult"로 명시

5. 로컬 프록시 서버 (`scripts/local-proxy.mjs`)
   - Docker 없이 로컬 Ollama 테스트 가능
   - Edge Function과 동일한 로직 (buildPrompt → Ollama → SSE 스트리밍)

6. MSW mock은 현재 미사용 상태 (별도 전환 불필요)

**검증:**
- [x] Supabase Edge Function 호출 성공 (401 → Authorization 헤더 추가로 해결)
- [x] AI 다운 시 에러 화면 표시 정상 ("해석을 불러오지 못했어요")
- [x] 로컬 Ollama 연동 E2E 성공: 홈 → 테마 선택 → 카드 3장 → 결과 보기 → SSE 스트리밍 → 해석 표시
- [x] 한줄 요약 표시 정상
- [x] 아코디언 섹션 (과거/현재/미래/종합) 표시 정상
- [ ] 리모트 Edge Function + Ollama 연동 (Ollama 서빙 인프라 구축 후 검증 — backlog P0 #0)

---

## Task 2-3: 공유 기능 E2E

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

## Task 2-4: 에지 케이스 통합 테스트

**상태**: TODO
**의존**: Task 2-2
**담당**: 전체

**작업 내용:**

1. AI 서버 다운 시나리오
   - Ollama 중지 → 카드 선택 → 결과 보기
   - 30초 타임아웃 → 조용히 1회 재시도 (타임아웃 15초) → 재실패
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
