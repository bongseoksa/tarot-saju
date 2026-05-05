# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드 문서입니다.
Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 작업 규칙

반드시 `RULES.md`를 읽고 따를 것. 핵심 요약:

1. **문서 먼저, 코드는 나중에** — `docs/frontend/` 세부 계획서 확인/작성 후 구현
2. **작업 후 문서 최신화** — 코드 변경 시 관련 `docs/` 문서 반드시 갱신
3. **TDD** — 테스트 케이스 먼저 작성 → 실패 확인 → 구현 → 통과 확인
4. **MCP 도구 활용** — 코드 검증 시 context7 + chrome-devtools MCP 사용
5. **스펙 문서 준수** — `docs/specs/02-taro-mvp.md` 기반 구현, 임의 기능 추가 금지
6. **pnpm 사용** — npm/yarn 사용 금지, `apps/web/`에서 lint/test/build 실행

---

## 프로젝트 개요

타로 + 사주 웹 애플리케이션. 타로는 무료 진입 훅(유저 획득), 사주는 유료 수익화 레이어(Phase 2). 현재 사전 개발 단계로 스펙 문서만 존재하며 애플리케이션 코드는 아직 없음.

## 계획된 아키텍처

모노레포 구조:
- `apps/web/` — React + Vite SPA (TypeScript, Tailwind CSS, React Router, Zustand)
- `supabase/functions/` — Supabase Edge Functions (Deno/TypeScript) 백엔드 API
- `supabase/migrations/` — PostgreSQL 마이그레이션 파일
- `packages/shared/` — 공유 타입 및 상수

배포: Vercel (프론트엔드), Supabase (DB/Auth/Edge Functions), 로컬 PC + Cloudflare Tunnel (Ollama + Gemma를 통한 AI 모델 서빙)

모바일: Capacitor로 SPA를 WebView 기반 네이티브 Android/iOS 앱으로 패키징.

## 핵심 설계 결정

- **AI 역할은 해석 문장 생성에만 한정.** 카드 뽑기는 랜덤, 카드 의미와 스프레드 규칙은 정적 데이터(DB/JSON). AI가 생성하는 것은 최종 해석 문장뿐.
- **프롬프트 품질 = 서비스 품질.** Gemma 모델에 정적 카드 데이터 + 사용자 질문을 프롬프트 컨텍스트로 전달. 심리 기법(바넘 효과, 양면 진술, 감정 레이블링 등)을 프롬프트에 적용하여 "내 얘기 같다"는 납득감을 목표로 설계.
- **MVP 운영 비용 목표: 0원.** 모든 인프라는 무료 티어 또는 로컬 자원 활용.
- **문서 먼저, 코드는 나중에.** 코드 작성 전에 스펙 문서 먼저 작성. 설계 -> 검증 -> 개발 순서 유지.
- 모든 문서는 `docs/specs/`에 위치. 모든 기능 결정은 근거와 함께 문서화 필수.

## 스펙 문서

- `docs/specs/specs.md` — 마스터 서비스 스펙 (기술스택, 수익모델, 배포 타겟)
- `docs/specs/tech-decisions.md` — 기술스택 선정 근거
- `docs/specs/01-benchmark.md` — 경쟁 서비스 벤치마킹 분석 (점신/헬로우봇/보라/coto)
- `docs/specs/02-taro-mvp.md` — 타로 MVP 기능 설계 (사용자 흐름, 데이터 타입, API 엔드포인트)
- `docs/specs/03-ai-design.md` — AI 해석 품질 설계 (심리 설계 + 프롬프트 설계)
- `docs/specs/04-harness-engineering.md` — 하네스 엔지니어링 적용 방안
- `docs/specs/05-experiment-plan.md` — (예정) 결제/구독 검증 실험 (Phase 2)
- `docs/specs/06-worldview.md` — "점" 세계관 (캐릭터 가문, 점하나 캐릭터, 확장 시나리오)
- `docs/specs/deep-research-report.md` — 레이아웃 리서치 + 반응형 개선 제안 (KRDS 그리드, 접근성, KPI)
- `docs/specs/backlog.md` — 백로그 (지연 항목)

## Git 컨벤션

- 브랜치: `main` + `feature/*` (develop 없음, 1인 개발)
- main: 항상 배포 가능 상태. feature 완성 후 merge
- 커밋: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- 릴리스: Semver 태그 (`v0.1.0`)

## 테스트 전략

- TDD: 테스트 먼저 → 실패 확인 → 구현 → 통과 확인
- 프레임워크: Vitest + React Testing Library
- 필수 테스트 대상: 비즈니스 로직 (카드 랜덤, localStorage 암호화/복호화, 미완료 세션, 만료 판정 등)
- UI 테스트: 핵심 인터랙션만
- E2E: MVP 제외 (P1 백로그)
- 커밋 전 `vitest run` 통과 필수

## 환경 변수

- 프론트엔드: `VITE_` 접두사 (Vite 규칙). `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GTM_ID`, `VITE_ADSENSE_CLIENT_ID`
- Edge Function: Supabase Secrets로 관리 (`OLLAMA_URL` — Ollama 엔드포인트, 백엔드 전용)
- 로컬: `.env.local` (git 제외), 템플릿: `.env.example` (git 포함)
- 프로덕션: Vercel 환경 변수 (프론트), Supabase Secrets (Edge Function)

## 언어 규칙

프로젝트 문서는 한국어로 작성. 코드와 코드 주석은 영어 사용. 사용자에게 노출되는 문자열은 한국어.

## 작업 후 문서 최신화

Claude를 통한 작업(코드 생성, 기능 추가, 구조 변경 등) 이후에는 반드시 `docs/` 하위 문서를 최신 상태로 업데이트해야 한다. 코드와 문서의 불일치를 방지하기 위해, 작업 완료 시 관련 스펙 문서의 변경 필요 여부를 확인하고 반영할 것.
