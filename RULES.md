# RULES.md — 작업 규칙

이 문서는 Claude Code가 이 프로젝트에서 코드를 작성하고 작업을 진행할 때 반드시 따라야 하는 규칙을 정의한다.

---

## 1. 문서 먼저, 코드는 나중에

- 코드 작성 전에 `docs/frontend/` 세부 계획서를 먼저 작성하거나 확인한다.
- `docs/frontend/implementation-plan.md`의 Phase 상태를 확인하고, 해당 Phase의 세부 계획서에 따라 작업한다.
- 세부 계획서가 없는 Phase는 계획서를 먼저 작성한 후 구현에 들어간다.

## 2. 작업 후 문서 최신화

- 코드 변경(생성, 수정, 삭제) 후 반드시 관련 `docs/` 문서를 최신 상태로 업데이트한다.
- Phase 세부 계획서의 체크리스트를 `[x]`로 갱신한다.
- `docs/frontend/implementation-plan.md`의 Phase 상태를 갱신한다.
- 코드와 문서의 불일치를 방지하기 위해, 작업 완료 시 관련 스펙 문서의 변경 필요 여부를 확인하고 반영한다.

## 3. TDD — 테스트 먼저 작성

- 실제 코드 작성 이전에 테스트 케이스를 먼저 작성한다.
- 테스트 실패 확인 → 구현 → 테스트 통과 확인 순서를 따른다.
- 프레임워크: Vitest + React Testing Library
- **API 모킹**: 외부 API(Supabase 등)를 호출하는 코드의 테스트는 `@packages/msw-handler`를 사용한다.
  - `createMock`으로 핸들러를 정의하고, `server.ts`의 MSW Node 서버로 테스트 환경을 구성한다.
  - `vi.mock`으로 Supabase 클라이언트를 직접 모킹하지 않는다. MSW로 네트워크 레벨에서 가로챈다.
  - 사용법은 `packages/msw-handler/README.md` 참조.
- 커밋 전 `pnpm run test` 통과 필수

## 4. MCP 도구 활용 규칙

### 디자인 참조 — Stitch MCP

- 화면(UI) 작업 시 `docs/design/reference.md`에 정의된 Stitch 스크린 ID를 참조한다.
- Stitch MCP (`mcp__stitch__get_screen`)를 통해 최신 디자인을 확인한 후 구현한다.
- 카드 이미지는 `docs/design/stitch/cards/`에 정의된 에셋을 사용한다.
- 로컬 HTML(`docs/design/stitch/screens/*.html`)은 참고용이며, Stitch MCP가 최신 소스이다.

### 코드 검증 — context7 + chrome-devtools MCP

- 라이브러리/프레임워크 API 사용 시 context7 MCP로 최신 문서를 확인한다.
- 코드 작성 후 반드시 chrome-devtools MCP로 브라우저에서 시각적 검증을 수행한다.
  - 모바일 뷰포트 (390x844, 3x DPR) 에뮬레이션
  - 콘솔 에러/경고 확인
  - 렌더링 결과 스크린샷 확인

## 5. 스펙 문서 준수

- 기능 구현은 `docs/specs/02-taro-mvp.md`의 사용자 흐름, 데이터 구조, 라우팅 정의를 따른다.
- 디자인은 `docs/design/stitch/design-system.md`의 디자인 시스템을 따른다.
- 임의로 스펙에 없는 기능을 추가하거나, 스펙과 다른 구조로 구현하지 않는다.

## 6. 패키지 관리

- 패키지 매니저: pnpm (npm/yarn 사용 금지)
- 워크스페이스: `pnpm-workspace.yaml`
- 내부 패키지 참조: `workspace:*` 프로토콜
- lint/test/build 실행: `apps/web/` 디렉토리에서 실행

## 7. 코드 품질

- TypeScript strict mode
- ESLint v9 flat config (`eslint.config.js`)
- Tailwind v4: `index.css`의 `@theme` 블록에서 디자인 토큰 정의
- 코드와 코드 주석은 영어, 사용자 노출 문자열은 한국어
- 프로젝트 문서는 한국어

## 8. Git 컨벤션

- 브랜치: `main` + `feature/*`
- 커밋: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- 커밋 전 `pnpm run test` 통과 필수
- 커밋은 사용자가 명시적으로 요청할 때만 수행
