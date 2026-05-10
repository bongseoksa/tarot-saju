# Sprint 2: 통합

> Mock/stub을 실제 구현으로 교체하고 E2E 흐름 검증.
>
> [← 진행 관리](../PROGRESS.md)

---

## Task 2-1: BE에 prompt-builder 연결

**상태**: TODO
**의존**: Task 1-BE-3, Task 1-AI-1
**담당**: BE + AI

**현재 상태:**
- Edge Function의 `buildPrompt`가 stub (하드코딩)
- `packages/shared/prompts/build-prompt.ts`에 실제 로직 존재

**작업 내용:**

1. Edge Function에서 prompt-builder 연결
   - **싱크 규칙: prompt-builder 단일 소스.** 복사본을 만들지 않는다.
   - Deno에서 npm 패키지 import 방식:
     - `npm:` specifier 사용 (`import { buildPrompt } from "npm:@tarot-saju/shared"`)
     - Supabase Edge Function의 npm import 제약이 있을 경우, `packages/shared/prompts/`를 `supabase/functions/_shared/`에 심볼릭 링크 또는 Deno import map으로 해결
   - **복사 금지** — BE(Edge Function)와 AI(테스트)가 동일 소스를 참조해야 한다

2. stub buildPrompt → 실제 buildPrompt로 교체

3. 카드/테마/스프레드 정적 데이터도 `packages/shared/data/`에서 import (단일 소스 원칙)

**검증:**
- [ ] `supabase functions serve interpret` → 실제 프롬프트 생성 확인 (로그)
- [ ] curl → Ollama → SSE 스트리밍 수신 (실제 해석 문장)
- [ ] 다양한 themeId/cards 조합으로 3회 이상 테스트

---

## Task 2-2: FE에 실제 API 연결

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
