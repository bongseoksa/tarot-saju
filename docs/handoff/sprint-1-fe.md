# Sprint 1-FE: 프론트엔드 독립 개발

> 대부분 구현 완료. 남은 작업은 검증 + 미비 사항 보완.
>
> [← 진행 관리](../PROGRESS.md) | [페이지별 디자인 가이드](./page-design-guide.md)

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

3. 타임아웃 로직 구현 (02-product-spec.md 에지 케이스 준수)
   - 초기 요청 30초 타임아웃 (`AbortController` + `setTimeout`)
   - 타임아웃 시 자동 1회 재시도 (타임아웃 15초)
   - 재시도도 실패 시 `onError` 호출

```typescript
// AbortController + setTimeout 패턴
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
try {
  const res = await fetch(url, { signal: controller.signal, ... });
  clearTimeout(timeoutId);
  // ... SSE 스트리밍 처리
} catch (err) {
  clearTimeout(timeoutId);
  if (err instanceof DOMException && err.name === 'AbortError') {
    // 타임아웃 처리: 재시도 또는 onError
  }
}
```

4. `ResultPage.tsx` 수정
   - Line 129: `isStreaming={false}` 하드코딩 → 실제 스트리밍 상태에 따라 동적 제어

**검증:**
- [ ] sseClient.test.ts 통과
- [ ] MSW mock 핸들러(Task 0-3)와 연동 테스트 통과
- [ ] 30초 타임아웃 → 자동 재시도(15초) → 재실패 시 에러 콜백 호출
- [ ] ResultPage에서 스트리밍 중 isStreaming=true, 완료 후 false

---

## Task 1-FE-3: 디자인 시안 적용 + 반응형 레이아웃 검증

**상태**: TODO
**의존**: Task 1-FE-1
**담당**: FE

**디자인 참조:** [페이지별 디자인 가이드](./page-design-guide.md)
**시안 디렉토리:** `docs/design/stitch/stitch_jeomhana_mvp_v2/` (HTML + 스크린샷)

**작업 내용:**

1. 디자인 시안과 현재 코드 비교 → 주요 차이 보완
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
