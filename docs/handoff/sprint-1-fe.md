# Sprint 1-FE: 프론트엔드 독립 개발

> 대부분 구현 완료. 남은 작업은 검증 + 미비 사항 보완.
>
> [← 진행 관리](../PROGRESS.md)

---

## Task 1-FE-1: 기존 FE 코드 점검 및 테스트 통과 확인

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

## Task 1-FE-2: SSE 클라이언트 API 계약 정합성

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

## Task 1-FE-3: 반응형 레이아웃 검증 (chrome-devtools)

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
