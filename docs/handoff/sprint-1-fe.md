# Sprint 1-FE: 프론트엔드 독립 개발

> 기존 코드 폐기 후 처음부터 재구축. Task 1-FE-1, 1-FE-2 완료. 남은 작업: 디자인 시안 적용.
>
> [<- 진행 관리](../PROGRESS.md) | [페이지별 디자인 가이드](./page-design-guide.md)

---

## Task 1-FE-1: FE 재구축 + 테스트 통과 확인

**상태**: DONE
**의존**: 없음
**담당**: FE

**작업 내용:**

기존 `apps/web/src/` 코드를 전부 삭제하고 처음부터 재구축.

1. 설정 파일 업데이트
   - `tsconfig.json`: `@/*` + `@shared/*` 절대경로 alias
   - `vite.config.ts`: `@` + `@shared` resolve alias
   - `vitest.config.ts`: 동일 alias 설정

2. 핵심 파일 생성
   - `main.tsx` + `App.tsx`: BrowserRouter + Routes (6개 라우트)
   - `components/AppLayout.tsx`: 공통 레이아웃 (헤더 + Outlet, max-w-screen-sm)
   - `components/AppHeader.tsx`: 로고/뒤로가기 + 히스토리 링크
   - `pages/`: HomePage, ReadingPage, ResultPage, HistoryPage, SharedResultPage
   - `stores/`: useReadingStore (메모리), useHistoryStore (localStorage + 암호화)
   - `utils/`: storageUtil, storageAdapter, cardUtils, sseClient
   - `data/categories.ts`: CategoryMeta (FE 전용, shared에서 분리)
   - `index.css`: Tailwind v4 `@theme` 블록 (디자인 시스템 토큰)

3. 이미지 자산 정리
   - `src/assets/cards/`: 22장 카드 + 뒷면 (기존 유지)
   - `src/assets/mascot/`: idle, sleep, wait (docs/design에서 복사)

4. 테스트 작성
   - `useReadingStore.test.ts` (5 tests)
   - `storageUtil.test.ts` (3 tests)
   - `cardUtils.test.ts` (3 tests)

**검증:**
- [x] `pnpm run test` — 11 tests 전체 통과
- [x] `pnpm run build` — 성공
- [x] `pnpm run lint` — 에러 0건

---

## Task 1-FE-2: SSE 클라이언트 API 계약 정합성

**상태**: DONE
**의존**: Task 0-2
**담당**: FE

**작업 내용:**

1. `sseClient.ts` 신규 작성 (기존 코드 미사용)
   - SSE 표준 파싱 (`data:` 라인 분리 + JSON 파싱)
   - `SSEEvent` 타입으로 처리 (chunk/done/error)
   - 30초 초기 타임아웃 + 15초 자동 1회 재시도
   - `AbortController` + `setTimeout` 패턴

2. `ResultPage.tsx`에서 `isStreaming` 상태 동적 제어
   - 스트리밍 중: `animate-pulse` 커서 표시
   - 완료 후: 커서 숨김

**검증:**
- [x] SSE JSON 포맷 파싱 구현 완료
- [x] 30초 타임아웃 -> 자동 재시도(15초) -> 재실패 시 에러 콜백 호출 구현
- [x] ResultPage에서 스트리밍 중 isStreaming=true, 완료 후 false
- [ ] MSW mock 핸들러와 연동 테스트 (dev 서버 기동 후 확인 필요)

---

## Task 1-FE-3: 디자인 시안 적용 + 반응형 레이아웃 검증

**상태**: TODO
**의존**: Task 1-FE-1
**담당**: FE

**디자인 참조:** [페이지별 디자인 가이드](./page-design-guide.md)
**시안 디렉토리:** `docs/design/stitch/stitch_jeomhana_mvp_v2/` (HTML + 스크린샷)

**작업 내용:**

1. 디자인 시안과 현재 코드 비교 -> 주요 차이 보완
   - 각 페이지의 HTML 시안(`code.html`)을 브라우저에서 열어 기준 확인
   - [page-design-guide.md](./page-design-guide.md)의 "현재 FE 코드와 시안 차이점" 테이블 참조

2. 페이지별 이미지 자산 적용

| 자산 | 적용 위치 |
|---|---|
| `mascot/mascot-idle.png` | 홈 히어로, 결과 마스코트 버블 |
| `mascot/mascot-sleep.png` | 로딩 화면 |
| `mascot/mascot-wait.png` | 히스토리 빈 상태 |
| `cards/card_back.png` | 카드 뽑기 그리드 |
| `cards/card_00~21.png` | 결과 카드 요약, 공유 페이지 |
| `favicon.png` | `index.html` 파비콘 |

3. 페이지별 레이아웃 핵심 보완 (디테일은 작업 중 조정)

| 페이지 | 핵심 보완 항목 |
|---|---|
| 홈 | Quick Actions 2열 카드 추가, 테마 카드 좌측 컬러바, 마스코트 히어로 |
| 카드 뽑기 | 마스코트 말풍선 안내, 카드 뒷면 이미지 적용, 선택 상태 오버레이 |
| 로딩 | mascot-sleep 이미지, 로딩 닷 애니메이션, 하단 광고 영역 |
| 결과 | 한줄 요약 영역, 아코디언 섹션 구조, 스트리밍 커서 |
| 히스토리 | 월간 요약 통계, 카테고리별 pastel 태그 색상, 빈 상태 마스코트 |
| 공유 랜딩 | 타임라인 도트 마커, card-frame 색상 카드 이미지 |

4. `pnpm dev` 실행 + chrome-devtools MCP로 모바일(390x844) 스크린샷 캡처

5. 시안 스크린샷과 비교 확인:

| 페이지 | 시안 참조 | 확인 항목 |
|---|---|---|
| 홈 | `home/screen.png` | 마스코트 히어로, Quick Actions, 카테고리 칩, 테마 카드, 푸터 |
| 카드 뽑기 | `play/screen.png` | 마스코트 말풍선, 슬롯 3개, 카드 그리드 4열, 하단 CTA |
| 로딩 | `loading/screen.png` | 마스코트 수면, 로딩 텍스트, 광고 영역 |
| 결과 | `result/screen.png` | 카드 요약 스트립, 한줄 요약, 아코디언 섹션, 하단 CTA |
| 히스토리 | `history/screen.png` | 월간 통계, 리딩 목록, 빈 상태 |
| 공유 | `share/screen.png` | 타임라인 결과, CTA |

**검증:**
- [ ] 모바일 뷰포트(390x844)에서 모든 페이지 정상 표시
- [ ] 시안 스크린샷과 레이아웃 구조 일치
- [ ] 마스코트/카드 이미지 정상 로드
- [ ] 콘솔 에러/경고 없음
