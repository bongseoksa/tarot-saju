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

**상태**: DONE
**의존**: Task 2-2, Task 1-BE-4, Task 1-BE-5
**담당**: FE + BE

**구현 결과:**

1. **ResultPage 공유 버튼** (`apps/web/src/pages/ResultPage.tsx`)
   - `handleShare` 콜백: `saveSharedReading()` → Supabase `shared_readings` 테이블에 insert → shareId 반환
   - 모바일: `navigator.share` (Web Share API) 사용
   - 데스크톱: `navigator.clipboard.writeText()` → 토스트 "링크가 복사되었어요"
   - 로딩 상태: "공유 중..." 표시, 중복 클릭 방지 (`sharing` state)
   - 스트리밍 중 공유 비활성화 (`isStreaming` 체크)

2. **AppHeader 공유 아이콘** (`apps/web/src/components/AppHeader.tsx`)
   - 결과 페이지에서 헤더 우측에 share 아이콘 표시
   - `CustomEvent("share-reading")` dispatch → ResultPage의 `useEffect`에서 수신하여 `handleShare` 호출

3. **SharedResultPage 전체 구현** (`apps/web/src/pages/SharedResultPage.tsx`)
   - `getSharedReading(shareId)` → Supabase에서 공유 결과 조회 (만료 체크 포함)
   - 카드 이미지 + 이름 + 방향 뱃지 표시
   - 한줄 요약 (summary) 섹션
   - 아코디언 섹션 (과거/현재/미래/종합) 표시
   - 로딩/에러 상태 처리 (만료·미존재 링크)
   - CTA: "나도 점 하나 찍어볼까?" → 홈으로 이동
   - 하단: "AI 타로 서비스 점하나(JeomHana)" 표시

**검증:**
- [x] 공유 저장 → URL 생성 → 클립보드 복사 성공 (Supabase DB insert E2E 검증)
- [x] 공유 URL 접근 → 결과 표시 정상 (chrome-devtools로 SharedResultPage 렌더링 확인)
- [x] 공유 버튼 클릭 → "공유 중..." 로딩 상태 표시 확인
- [x] TypeScript 에러 없음 (`tsc --noEmit`)
- [ ] OG meta 태그 반환 확인 (og-image Edge Function 배포 후 검증 — Sprint 3)

---

## Task 2-4: 에지 케이스 통합 테스트

**상태**: DONE
**의존**: Task 2-2
**담당**: 전체

**구현 결과:**

4개 테스트 파일, 총 33건의 에지 케이스 테스트 작성. 기존 29건과 합쳐 전체 62건 통과.

1. **SSE 클라이언트 에지 케이스** (`apps/web/src/utils/sseClient.test.ts` — 11건)
   - 정상 청크 수신 + done 완료
   - HTTP 에러 응답 (500 등)
   - 비정상 JSON 라인 건너뛰기
   - 청크 분할 (TCP 패킷 분리 시뮬레이션)
   - SSE 코멘트/빈 줄 무시
   - error 이벤트 수신 처리
   - AbortError(타임아웃) 시 1회 자동 재시도
   - 양쪽 모두 타임아웃 시 에러 콜백
   - 비-AbortError 시 즉시 에러 (재시도 없음)
   - 빈 청크 데이터 처리
   - 요청 헤더 (Content-Type, Authorization) 검증

2. **히스토리 스토어 에지 케이스** (`apps/web/src/stores/useHistoryStore.test.ts` — 8건)
   - 결과 추가 + ID로 조회
   - 미존재 ID 조회 시 undefined 반환
   - 최신순 정렬 (prepend)
   - MAX_HISTORY(20건) 초과 시 자동 삭제
   - FIFO 방식 제거 확인 (oldest 5건 제거)
   - 전체 초기화
   - 빈 interpretation/summary 처리
   - 중복 ID 처리 (최신 우선 반환)

3. **마크다운 섹션 파싱 에지 케이스** (`apps/web/src/utils/parseSections.test.ts` — 8건)
   - 표준 4섹션 파싱
   - ### 없는 텍스트 → 빈 배열
   - 콘텐츠 없는 섹션 처리
   - 개행 없는 헤더 건너뛰기
   - 멀티라인 콘텐츠
   - 첫 ### 앞의 프리앰블 텍스트
   - 특수문자/이모지/따옴표
   - 헤더 앞뒤 공백 트리밍

4. **암호화 스토리지 어댑터 에지 케이스** (`apps/web/src/utils/storageAdapter.test.ts` — 6건)
   - 암복호화 라운드트립
   - 미존재 키 → null 반환
   - 항목 삭제
   - 손상 데이터 → SyntaxError 발생 (데이터 무결성 보호)
   - 빈 문자열 처리
   - 대용량 한국어 텍스트 (10,000자)

**검증:**
- [x] sseClient 11/11 테스트 통과
- [x] useHistoryStore 8/8 테스트 통과
- [x] parseSections 8/8 테스트 통과
- [x] storageAdapter 6/6 테스트 통과
- [x] 전체 62건 테스트 통과 (`pnpm --filter web test`)
- [x] TypeScript 에러 없음 (`tsc --noEmit`)

**미구현 에지 케이스 (MVP 범위 밖):**
- 미완료 세션 복구 (usePendingStore 미구현 — backlog)
- 광고 로드 실패 (AdSense 미연동 — Sprint 3-1)
- SSE 스트림 중 컴포넌트 언마운트 시 abort (P1 백로그)
