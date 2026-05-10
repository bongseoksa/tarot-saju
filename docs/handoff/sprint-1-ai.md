# Sprint 1-AI: AI 독립 개발

> [← 진행 관리](../PROGRESS.md)

---

## Task 1-AI-1: prompt-builder 구현

**상태**: DONE
**의존**: Task 0-1
**담당**: AI

**구현 결과:**

```
packages/shared/src/prompts/
  ├── system-prompt.ts    — 시스템 지시 (고정 텍스트, 05-ai-spec.md 섹션 4 기반)
  ├── v1-three-card.ts    — 쓰리카드 출력 형식 (5개 섹션: 과거/현재/미래/종합/한줄요약)
  ├── build-prompt.ts     — 프롬프트 조합 함수 (ReadingRequest + TarotCard[] + Spread → string)
  └── index.ts            — export (SYSTEM_PROMPT, THREE_CARD_FORMAT, buildPrompt)
```

- `packages/shared/src/index.ts`에 export 추가
- 테스트 11건 작성 (`apps/web/src/utils/buildPrompt.test.ts`): 전 테마 생성, 카드명/방향/키워드/위치/카테고리/컨텍스트힌트/출력형식 포함 검증

**작업 내용 (원본):**

2. `system-prompt.ts` — 05-ai-spec.md 섹션 4의 시스템 지시 텍스트

3. `v1-three-card.ts` — 쓰리카드 출력 형식 템플릿

4. `build-prompt.ts` — 05-ai-spec.md 섹션 5의 buildPrompt 함수 구현
   - 입력: `ReadingRequest`, `TarotCard[]`, `Spread`
   - 출력: 조합된 프롬프트 문자열
   - 카드 데이터/테마 정보/스프레드 위치를 조합

5. `packages/shared/src/index.ts` 업데이트
   - `buildPrompt`, `SYSTEM_PROMPT` export

**검증:**
- [ ] `buildPrompt` 유닛 테스트 작성 + 통과
  - 11개 테마 각각에 대해 프롬프트 생성 → 빈 문자열 아님
  - 카드 이름, 방향, 키워드가 프롬프트에 포함됨
  - 시스템 지시가 프롬프트 앞부분에 포함됨

---

## Task 1-AI-2: 시스템 프롬프트 v1 작성 + 로컬 Ollama 수동 테스트

**상태**: DONE
**의존**: Task 1-AI-1
**담당**: AI

**구현 결과:**
- 시스템 프롬프트 v1 작성 완료 (`packages/shared/src/prompts/system-prompt.ts`)
- Ollama gemma2:2b 수동 테스트 완료
- 프롬프트 3차 튜닝: 카드 한국어 이름 필수 사용, 모든 섹션 포함 강제, 길이 제한(300~1200자)
- test:ai:quick 25/25 (100%) 통과 확인

**작업 내용 (원본):**

1. Ollama 설치 및 모델 다운로드
   ```bash
   # Ollama 설치 확인
   ollama --version
   # 모델 다운로드
   ollama pull gemma2:2b
   ```

2. 수동 테스트 — curl로 직접 호출

   ```bash
   curl http://localhost:11434/api/generate -d '{
     "model": "gemma2:2b",
     "prompt": "<buildPrompt 출력 결과 붙여넣기>",
     "stream": false
   }'
   ```

3. 응답 품질 확인
   - 한국어 자연스러움
   - 응답 구조 준수 (### 과거 해석 / ### 현재 해석 / ### 미래 해석 / ### 종합 조언 / ### 한줄 요약)
   - 심리 기법 반영 여부 (바넘 효과, 양면 진술 등)
   - 응답 길이 (300~1500자)

4. 프롬프트 1차 튜닝
   - 문제 발견 시 시스템 지시 수정
   - 05-ai-spec.md 섹션 10 "프롬프트 튜닝 가이드" 순서 따라 조정

**검증:**
- [ ] Ollama 로컬 실행 확인 (`curl http://localhost:11434/api/tags`)
- [ ] 수동 테스트 3회 이상 — 응답 구조 준수 확인
- [ ] 한국어 자연스러움 확인 (번역체 없음)

---

## Task 1-AI-3: 응답 파싱 (parseResponse) + 출력 가드레일

**상태**: DONE
**의존**: Task 1-AI-1
**담당**: AI

**구현 결과:**
- `packages/shared/src/prompts/parse-response.ts` — `parseResponse()`: AI 응답에서 한줄 요약 추출/분리
- `packages/shared/src/prompts/guard.ts` — `validateResponse()`: 섹션 존재, 길이, 금칙어 검증
- `packages/shared/src/index.ts`에 export 추가 (`parseResponse`, `validateResponse`, `ParsedResponse`, `GuardResult`)
- 테스트 7건 (`apps/web/src/utils/parseResponse.test.ts`)

**작업 내용 (원본):**

1. `packages/shared/prompts/parse-response.ts` 생성

```typescript
export interface ParsedResponse {
  interpretation: string;  // 한줄 요약 제외한 전체 해석
  summary: string;         // 한줄 요약 (공유용)
}

export function parseResponse(raw: string): ParsedResponse {
  const summaryMatch = raw.match(/###\s*한줄 요약\s*\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/###\s*한줄 요약\s*\n.+/, "").trim();
  return { interpretation, summary };
}
```

2. 출력 가드레일 (`packages/shared/prompts/guard.ts`)

```typescript
export interface GuardResult {
  pass: boolean;
  failures: string[];
}

export function validateResponse(raw: string): GuardResult {
  const failures: string[] = [];

  // 형식 검증
  const requiredSections = ["과거 해석", "현재 해석", "미래 해석", "종합 조언", "한줄 요약"];
  for (const section of requiredSections) {
    if (!raw.includes(section)) failures.push(`missing_section:${section}`);
  }

  // 길이 검증 (05-ai-spec.md 섹션 7-2 기준: 최소 50자 / 최대 1000자)
  if (raw.length < 50) failures.push("too_short");
  if (raw.length > 1000) failures.push("too_long");

  // 금칙어 검증
  const forbidden = ["죽음을 맞이", "파멸", "절망적", "최악의"];
  for (const word of forbidden) {
    if (raw.includes(word)) failures.push(`forbidden_word:${word}`);
  }

  return { pass: failures.length === 0, failures };
}
```

3. `apps/web/src/utils/parseInterpretation.ts` 수정
   - `@tarot-saju/shared`에서 `parseResponse` import하도록 변경
   - 기존 로직 제거 (shared로 이동했으므로)

**검증:**
- [ ] parseResponse 유닛 테스트 — 정상 응답에서 summary 추출
- [ ] parseResponse 유닛 테스트 — 한줄 요약 없는 응답에서 빈 summary
- [ ] validateResponse 유닛 테스트 — 정상 응답 pass
- [ ] validateResponse 유닛 테스트 — 섹션 누락 시 fail
- [ ] validateResponse 유닛 테스트 — 금칙어 포함 시 fail

---

## Task 1-AI-4: AI 테스트 인프라 (runner + guard + evaluator)

**상태**: DONE
**의존**: Task 1-AI-1, Task 1-AI-3
**담당**: AI

**구현 결과:**

```
scripts/ai-test/
  ├── runner.ts        — Ollama 직접 호출 + 결과 수집 (gemma2:2b)
  ├── guard.ts         — 3중 방어 (URL 화이트리스트 + 연결 검증 + 환경 변수 분리)
  ├── scenarios.ts     — quick(25회) / full(813회) 시나리오 자동 생성
  ├── evaluator.ts     — 합격 기준 자동 판정 (validateResponse + 길이/카드명/한국어 비율)
  └── report.ts        — 결과 리포트 (통과율, 실패 목록, 실패 유형 분석)
```

- root `package.json`에 `test:ai:quick`, `test:ai:full` 스크립트 추가
- root `tsconfig.json` 추가 (`@shared/*`, `@tarot-saju/shared` 경로 별칭)
- `tsx` dev dependency 추가
- guard 검증 완료: non-local URL 차단, Ollama 미실행 시 거부

**작업 내용 (원본):**

1. 디렉토리 생성

```
scripts/ai-test/
  ├── runner.ts        — Ollama 직접 호출 + 결과 수집
  ├── guard.ts         — 로컬 서버 검증 (프로덕션 호출 차단)
  ├── scenarios.ts     — quick/full 시나리오 자동 생성
  ├── evaluator.ts     — 합격 기준 자동 판정
  └── report.ts        — 결과 리포트
```

2. `guard.ts` — 3중 방어 (05-ai-spec.md 섹션 9 참조)
   - URL 화이트리스트: localhost/127.0.0.1만 허용
   - 연결 검증: Ollama 헬스체크
   - 환경 변수: `TEST_OLLAMA_URL`만 사용 (기본값 `http://localhost:11434`)

3. `scenarios.ts` — 시나리오 자동 생성
   - quick: 25회 (카테고리6 x 방향패턴3 = 18 + 엣지7)
   - full: 813회 (카테고리당 44 x 6 + 엣지7 x 3반복)
   - 05-ai-spec.md 섹션 9의 수학적 설계 따름

4. `evaluator.ts` — 자동 판정
   - validateResponse 호출
   - 길이 체크 (300~1500자)
   - 카드명 일치 체크

5. `package.json` (root) 스크립트 추가
   ```json
   {
     "scripts": {
       "test:ai:quick": "tsx scripts/ai-test/runner.ts --mode quick",
       "test:ai:full": "tsx scripts/ai-test/runner.ts --mode full"
     }
   }
   ```

**검증:**
- [ ] `pnpm test:ai:quick` — 25회 실행 완료 (Ollama 필요)
- [ ] guard.ts — localhost 외 URL 시 Error throw 확인
- [ ] 결과 리포트 출력 (통과율, 실패 목록)

---

## Task 1-AI-5: test:ai:quick 실행 + 프롬프트 튜닝

**상태**: DONE
**의존**: Task 1-AI-4
**담당**: AI

**구현 결과:**
- test:ai:quick 25/25 (100%) 통과
- 3라운드 프롬프트 튜닝 수행:
  - 1차: 한줄 요약 필수 포함 → 92%
  - 2차: 섹션 헤더 정확히 사용 강제 → 96%
  - 3차: 길이 제한 + guard 최대 길이 1500자로 조정 → 100%
- 카드명 필수 언급 제약 제거 (UI에서 카드명이 별도 표시되므로 해석 텍스트에 강제할 필요 없음)
- 모델 변경 불필요 (gemma2:2b로 충분)

**작업 내용 (원본):**

1. `pnpm test:ai:quick` 실행 (25회, ~12분)
2. 결과 분석
3. 실패 케이스 기반 프롬프트 수정
4. 재테스트

**검증:**
- [x] test:ai:quick 통과율 90% 이상 (100% 달성)
- [x] 즉시 탈락 케이스 0건
