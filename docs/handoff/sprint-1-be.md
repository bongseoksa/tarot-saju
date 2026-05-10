# Sprint 1-BE: 백엔드 독립 개발

> [← 진행 관리](../PROGRESS.md)

---

## Task 1-BE-1: Supabase 프로젝트 초기화

**상태**: DONE
**의존**: 없음
**담당**: BE

**구현 결과:**
- Supabase CLI 2.98.2 설치 (`brew install supabase/tap/supabase`)
- `supabase init` → `supabase/config.toml` 생성
- 리모트 프로젝트 연결: `supabase link --project-ref aecasypyugpftkpvngvs`
- `.env.local`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정 완료

**검증:**
- [x] `supabase/config.toml` 생성됨
- [x] 리모트 프로젝트 연결 확인

---

## Task 1-BE-2: shared_readings DB 마이그레이션

**상태**: DONE
**의존**: Task 1-BE-1
**담당**: BE

**구현 결과:**
- `supabase/migrations/20260510000000_create_shared_readings.sql` 작성
- `supabase db push` → 리모트 DB에 마이그레이션 적용 완료
- shared_readings 테이블: uuid PK, theme_id, theme_title, cards(jsonb), interpretation, summary, created_at, expires_at(30일)
- RLS: SELECT/INSERT 모두 public 허용
- expires_at 인덱스 생성

**검증:**
- [x] `supabase db push` 성공
- [x] 리모트 DB에 shared_readings 테이블 생성 확인
- [x] RLS 정책 활성화 확인

---

## Task 1-BE-3: interpret Edge Function 구현

**상태**: DONE
**의존**: Task 0-1, Task 0-2, Task 1-BE-1
**담당**: BE

**구현 결과:**
- `supabase/functions/interpret/index.ts` — 완전 구현 (스켈레톤 아닌 실동작)
- `supabase/functions/_shared/mod.ts` — packages/shared에서 파생된 Edge Function용 공유 모듈 (타입, 데이터, 프롬프트 함수)
- `supabase/functions/_shared/tarot-cards.json` — 카드 데이터 (packages/shared/data에서 복사)
- **prompt-builder 단일 소스**: packages/shared가 원본, _shared/mod.ts는 파생본. 원본 변경 시 _shared도 갱신 필요
- SSE 스트리밍: Ollama → chunk/done/error 이벤트 중계 (API 계약 `SSEEvent` 타입 준수)
- 출력 가드레일: 스트리밍 완료 후 `validateResponse` 실행, 실패 시 error 이벤트 추가 전송
- CORS: `*` (MVP), 입력 검증: themeId/cards 필수
- Ollama 미실행 시 502 반환

**검증:**
- [ ] `supabase functions serve interpret` → SSE 스트림 수신 (Sprint 2 통합 시 검증)
- [x] CORS 헤더 구현
- [x] 입력 검증 구현 (400 에러)
- [x] Ollama 미실행 시 502 에러 구현

---

## Task 1-BE-4: 공유 결과 저장/조회 (SDK + RLS)

**상태**: DONE
**의존**: Task 1-BE-2
**담당**: BE

**구현 결과:**
- `apps/web/src/lib/supabase.ts` — Supabase 클라이언트 싱글턴 (VITE_SUPABASE_URL/ANON_KEY)
- `apps/web/src/lib/shareService.ts` — 공유 CRUD 서비스
  - `saveSharedReading()` — insert → id 반환
  - `getSharedReading()` — select by id (만료 체크 포함, expires_at > now)
  - `SharedReading` 인터페이스 — DB 스키마와 1:1 매핑
- DB 스키마와 필드명 일치 확인 (theme_id, theme_title, cards, interpretation, summary)
- 만료 삭제: 무료 티어이므로 조회 시 `expires_at` 필터로 처리 (pg_cron 불필요)

**검증:**
- [ ] 공유 저장 (insert) → id 반환 성공 (Sprint 2 통합 시 E2E 검증)
- [ ] 공유 조회 (select by id) → 데이터 반환 성공 (Sprint 2 통합 시 E2E 검증)
- [x] 만료 필터 구현 (조회 시 expires_at > now 조건)

---

## Task 1-BE-5: 동적 OG 태그 Edge Function

**상태**: DONE
**의존**: Task 1-BE-4
**담당**: BE

**구현 결과:**
- `supabase/functions/og-image/index.ts` — 동적 OG 태그 Edge Function
- 쿼리 파라미터 `?id=<shareId>`로 shared_readings 조회
- OG meta 태그 포함 HTML 반환 (og:title, og:description, twitter:card)
- JavaScript redirect → 앱 `/shared/{shareId}` 페이지로 이동
- HTML escape 처리 (XSS 방지)
- Supabase 서비스 롤 키로 DB 조회 (SUPABASE_SERVICE_ROLE_KEY)
- 만료 체크 포함 (expires_at > now)
- 미존재/만료 시 기본 OG 태그 ("점하나에서 AI 타로를 체험해보세요")
- APP_URL 환경 변수로 리다이렉트 URL 설정 가능

**검증:**
- [ ] `curl /og-image?id={id}` → OG meta 태그 포함 HTML 반환 (배포 후 검증)
- [ ] 카카오/Facebook OG 디버거 미리보기 (배포 후 검증)
