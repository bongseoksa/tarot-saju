# AI 해석 품질 설계

## 핵심 원칙
- AI는 **해석 문장 생성만** 담당 (카드 의미/스프레드 규칙은 정적 데이터)
- 모델 크기보다 **프롬프트 설계**가 서비스 품질을 결정
- **해석 품질 = 심리적 납득감.** 사용자가 읽고 "내 얘기 같다"고 느끼면 성공
- 동작 우선, 속도 최적화는 백로그

---

## 서빙 구조

```
[Edge Function: interpret]
  → 카드 정적 데이터 조회
  → 테마 정보 조회
  → 프롬프트 조합
  → { prompt, ollamaUrl } 반환

[클라이언트]
  → Ollama API 직접 호출 (Cloudflare Tunnel)
  → SSE 스트리밍 수신
```

### Ollama API 호출
```
POST {ollamaUrl}/api/generate
{
  "model": "gemma2:2b",
  "prompt": "<조합된 프롬프트>",
  "stream": true
}
```

---

## 심리 설계 — "내 얘기 같다"를 만드는 원칙

타로 해석의 핵심 가치는 **정확한 예측이 아니라 사용자 스스로의 납득**이다. 사용자가 해석을 읽고 자기 경험·상황을 자발적으로 끼워맞추면서 "맞다"고 느끼게 만드는 것이 목표다. 아래 심리 기법들을 프롬프트 설계에 녹인다.

### 1. 바넘 효과 (Barnum/Forer Effect)

누구에게나 해당될 수 있지만 "나한테만 해당되는 것 같은" 문장을 사용한다.

| 나쁜 예 (너무 구체적) | 좋은 예 (자기 투영 유도) |
|---|---|
| "직장 상사와 갈등이 있습니다" | "가까운 관계에서 미묘한 긴장감을 느끼고 계실 수 있습니다" |
| "3월에 좋은 일이 있습니다" | "머지않아 작은 전환점이 찾아올 기운이 보입니다" |
| "돈을 잃을 수 있습니다" | "지금은 크게 움직이기보다 흐름을 지켜보는 것이 유리합니다" |

**원칙:** 구체적 사건을 지목하지 않고, 감정·상태·경향을 묘사한다. 사용자가 자기 상황을 대입할 여백을 남긴다.

### 2. 양면 진술 (Both-Sides Statement)

사람은 자신 안에 상반된 면이 있다는 말에 강하게 공감한다.

```
"겉으로는 담담해 보이지만, 안으로는 흔들리는 감정이 있으신 것 같습니다."
"주변을 먼저 챙기는 성격이지만, 때로는 '나는 누가 챙겨주지?'라는 생각이 드실 때가 있습니다."
"결단력이 있으면서도, 중요한 순간에는 한 번 더 확인하고 싶은 신중함도 갖고 계십니다."
```

**원칙:** "~하지만 한편으로는 ~하다" 구조를 활용한다. 어떤 성격이든 해당되므로 사용자는 자동으로 수긍한다.

### 3. 과거 경험 환기 (Past Seeding)

과거의 모호한 경험을 언급하면 사용자가 실제 기억을 끌어와 매칭한다.

```
"최근 마음이 복잡했던 순간이 한 번쯤 있으셨을 겁니다."
"예전에 비슷한 고민으로 밤을 지새운 적이 있지 않나요?"
"한동안 미뤄왔던 무언가가 떠오르실 수 있습니다."
```

**원칙:** "~한 적이 있을 것이다" 형태로 말하면, 사용자는 반드시 매칭되는 기억을 찾아낸다. 기억은 재구성되므로 거의 100% 적중한다.

### 4. 감정 레이블링 (Emotional Labeling)

사용자의 질문 카테고리에서 예상되는 감정을 먼저 명명해준다. 감정에 이름이 붙으면 "이 사람이 나를 이해한다"는 신뢰가 생긴다.

| 카테고리 | 레이블링 예시 |
|---|---|
| 연애 | "설렘 속에 불안이 섞인 마음이 느껴집니다" |
| 직장 | "지금 자리에서 인정받고 싶은 마음과, 떠나고 싶은 마음 사이에 계신 것 같습니다" |
| 재물 | "안정을 원하면서도 기회를 놓칠까 조급한 마음이 있으시죠" |
| 건강 | "바쁜 일상 속에서 스스로를 돌보지 못한다는 자책감이 살짝 느껴집니다" |
| 선택 | "이미 마음속에 답이 있지만, 확인받고 싶은 거 아닌가요?" |

**원칙:** 질문 카테고리에 따라 보편적으로 느낄 감정을 프롬프트에서 힌트로 제공한다.

### 5. 행동 유도가 아닌 성찰 유도

"~하세요"라는 지시보다 "~를 돌아보세요"라는 성찰이 더 오래 남고, 사용자가 스스로 의미를 만든다.

| 피하기 | 사용하기 |
|---|---|
| "적극적으로 고백하세요" | "상대에게 전하지 못한 마음이 있다면 꺼내볼 시기입니다" |
| "이직을 추천합니다" | "지금 자리에서 진짜 원하는 것이 무엇인지 스스로에게 물어보세요" |
| "저축을 시작하세요" | "돈과 나의 관계를 한 번 정리해볼 시점입니다" |

**원칙:** 구체적 행동을 지시하면 책임 문제가 생기고, 틀릴 수도 있다. 성찰을 유도하면 사용자가 자기 상황에 맞는 답을 스스로 도출한다.

### 6. 긍정 편향과 희망 앵커

역방향 카드나 부정적 의미도 **"주의 → 성장 기회"** 프레임으로 전환한다. 사용자는 긍정적 메시지를 기억하고 공유한다.

```
나쁜 예: "재정적 손실이 우려됩니다."
좋은 예: "지금의 불안정함은 더 단단한 기반을 만들기 위한 과도기입니다."

나쁜 예: "이 관계는 어려워 보입니다."
좋은 예: "지금 느끼는 불편함이 오히려 관계를 솔직하게 재정립할 계기가 될 수 있습니다."
```

**원칙:** 경고 → 기회, 위기 → 전환점으로 리프레이밍. 완전한 부정은 없다.

---

### 프롬프트 적용 요약

위 심리 기법들은 시스템 지시에 규칙으로 녹인다. AI가 매 해석마다 자동으로 적용하도록 한다.

---

## 프롬프트 설계

### 구조

프롬프트는 4개 블록으로 구성된다.

```
[1. 시스템 지시] — AI의 역할과 응답 규칙
[2. 카드 데이터] — 뽑힌 카드의 정적 정보 (이름, 의미, 위치)
[3. 사용자 맥락] — 질문, 카테고리
[4. 출력 형식] — 응답 구조 지정
```

### 시스템 지시 (고정)

```
당신은 경험 많은 타로 리더입니다.
주어진 카드 정보와 질문을 바탕으로 따뜻하고 공감적인 해석을 제공합니다.
당신의 해석을 읽은 사람이 "내 얘기 같다"고 느끼는 것이 가장 중요합니다.

기본 규칙:
- 한국어로 답변합니다
- 존댓말(~합니다)을 사용합니다
- 카드의 의미를 질문 맥락에 맞게 연결합니다
- 점술 용어를 남용하지 않고 일상적 언어로 설명합니다

심리적 공감 규칙:
- 구체적 사건을 단정하지 마세요. 감정, 상태, 경향을 묘사하여 읽는 사람이 자기 상황을 대입할 여백을 남기세요.
- "~하지만 한편으로는 ~하기도 합니다" 같은 양면 진술을 사용하세요. 사람은 자신 안의 상반된 면을 인정받으면 공감합니다.
- "최근 ~한 적이 있으셨을 겁니다" 같이 과거 경험을 환기하세요. 읽는 사람은 자동으로 매칭되는 기억을 떠올립니다.
- 질문 카테고리에서 예상되는 감정을 먼저 이름 붙여 주세요. (예: "설렘 속에 불안이 섞인 마음") 감정에 이름이 붙으면 신뢰가 생깁니다.
- "~하세요"라는 지시 대신 "~를 돌아보세요"라는 성찰을 유도하세요. 읽는 사람이 스스로 의미를 만들도록 합니다.
- 부정적 의미도 "주의가 필요한 부분 → 성장의 기회"로 전환하세요. 역방향 카드는 위기가 아니라 전환점입니다.
- 완전한 부정이나 절망적 표현은 사용하지 마세요.
```

### 원카드 프롬프트 템플릿

```
{시스템 지시}

## 뽑힌 카드
- 카드: {nameKo} ({name})
- 방향: {정방향|역방향}
- 키워드: {meaningUpright 또는 meaningReversed}
- 설명: {description}

## 질문
- 카테고리: {category}
- 질문: {questionText}

## 응답 형식
다음 구조로 답변하세요:

### 카드 해석
(카드가 현재 상황에서 어떤 의미인지 2~3문장)

### 조언
(이 카드를 바탕으로 한 실질적 조언 2~3문장)

### 한줄 요약
(공유용 한 줄 요약, 20자 이내)
```

### 쓰리카드 프롬프트 템플릿

```
{시스템 지시}

## 뽑힌 카드

### 과거
- 카드: {nameKo} ({name})
- 방향: {정방향|역방향}
- 키워드: {meaningUpright 또는 meaningReversed}
- 설명: {description}

### 현재
- 카드: {nameKo} ({name})
- 방향: {정방향|역방향}
- 키워드: {meaningUpright 또는 meaningReversed}
- 설명: {description}

### 미래
- 카드: {nameKo} ({name})
- 방향: {정방향|역방향}
- 키워드: {meaningUpright 또는 meaningReversed}
- 설명: {description}

## 질문
- 카테고리: {category}
- 질문: {questionText}

## 응답 형식
다음 구조로 답변하세요:

### 과거 해석
(과거 카드가 지금까지의 흐름에서 어떤 의미인지 2~3문장)

### 현재 해석
(현재 카드가 지금 상황에서 어떤 의미인지 2~3문장)

### 미래 해석
(미래 카드가 앞으로의 방향에서 어떤 의미인지 2~3문장)

### 종합 조언
(세 카드의 흐름을 연결한 종합 조언 2~3문장)

### 한줄 요약
(공유용 한 줄 요약, 20자 이내)
```

---

## 프롬프트 조합 로직 (Edge Function)

```typescript
function buildPrompt(request: ReadingRequest, cards: TarotCard[], spread: Spread): string {
  const systemInstruction = SYSTEM_PROMPT; // 고정 텍스트

  // 카드 데이터 블록 생성
  const cardBlocks = request.cards.map((drawn) => {
    const card = cards.find(c => c.id === drawn.cardId);
    const position = spread.positions[drawn.positionIndex];
    const meaning = drawn.isReversed ? card.meaningReversed : card.meaningUpright;
    const direction = drawn.isReversed ? "역방향" : "정방향";

    return `### ${position.label}
- 카드: ${card.nameKo} (${card.name})
- 방향: ${direction}
- 키워드: ${meaning}
- 설명: ${card.description}`;
  }).join("\n\n");

  // 테마 정보 조회
  const theme = themes.find(t => t.id === request.themeId);
  const categoryMap = { love: "연애", career: "직장", wealth: "재물", study: "학업", daily: "일상", general: "일반" };
  const question = theme.description;
  const category = categoryMap[theme.category];

  // 출력 형식 (MVP: 쓰리카드 고정)
  const outputFormat = THREE_CARD_FORMAT;

  return `${systemInstruction}\n\n## 뽑힌 카드\n\n${cardBlocks}\n\n## 질문\n- 카테고리: ${category}\n- 질문: ${question}\n\n${outputFormat}`;
}
```

### 테마 콘텐츠 목록

> 데이터 구조 상세: [02-taro-mvp.md](./02-taro-mvp.md)의 TarotTheme 참조

```typescript
const TAROT_THEMES: TarotTheme[] = [
  { id: "daily-today",      category: "daily",   title: "오늘의 타로",       description: "오늘 하루는 어떨까?",          tags: ["#오늘", "#하루운세"],    spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "daily-week",       category: "daily",   title: "이번 주 타로",      description: "이번 주는 어떤 흐름일까?",     tags: ["#이번주", "#주간운세"],  spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-luck",        category: "love",    title: "나의 연애운",       description: "나의 연애운은 어떤가요?",      tags: ["#연애", "#애정운"],      spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-feeling",     category: "love",    title: "그 사람의 마음",    description: "그 사람의 마음은 어떤가요?",   tags: ["#짝사랑", "#속마음"],    spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-new",         category: "love",    title: "새로운 인연",       description: "새로운 인연이 올까요?",        tags: ["#인연", "#만남"],        spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-outlook",   category: "career",  title: "직장에서의 전망",   description: "지금 직장에서의 전망은?",      tags: ["#직장", "#커리어"],      spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-change",    category: "career",  title: "이직 타이밍",       description: "이직을 해도 괜찮을까요?",      tags: ["#이직", "#전환"],        spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "wealth-luck",      category: "wealth",  title: "나의 재물운",       description: "나의 재물운은 어떤가요?",      tags: ["#재물", "#금전운"],      spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "study-result",     category: "study",   title: "시험/학업 결과",    description: "시험/학업 결과가 어떨까요?",   tags: ["#시험", "#합격"],        spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-message",  category: "general", title: "지금 필요한 메시지", description: "지금 가장 필요한 메시지는?",  tags: ["#조언", "#메시지"],      spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-choice",   category: "general", title: "이 선택이 맞을까",  description: "이 선택이 맞을까요?",         tags: ["#선택", "#결정"],        spreadType: "three-card", positions: ["과거", "현재", "미래"] },
];
```

---

## 응답 파싱

AI 응답에서 `한줄 요약` 섹션을 추출하여 `summary` 필드로 분리 저장한다.

```typescript
function parseResponse(raw: string): { interpretation: string; summary: string } {
  const summaryMatch = raw.match(/### 한줄 요약\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/### 한줄 요약\n.+/, "").trim();
  return { interpretation, summary };
}
```

---

## 모델 선정

### MVP: Gemma 2 2B (양자화)
- Ollama 모델명: `gemma2:2b`
- 이유: 가장 가벼움. 로컬 PC에서 CPU로도 동작 가능
- 한국어 품질 검증이 최우선 과제

### 품질 부족시 대안
1. `gemma2:7b` — VRAM 8GB+ 필요, 품질 향상 기대
2. `llama3.1:8b` — 한국어 성능 비교 필요
3. `qwen2.5:7b` — 아시아권 언어 강점

### 모델 변경 기준
- Gemma 2B로 프롬프트 테스트 → 해석 품질 평가 → 부족하면 상위 모델로 교체
- 모델 교체는 Ollama에서 `ollama pull {모델명}` 한 줄로 가능

---

## 품질 평가 기준

### 해석 품질 체크리스트
| 항목 | 기준 |
|---|---|
| 한국어 자연스러움 | 어색한 번역체 없이 자연스러운 문장 |
| 카드 의미 반영 | 제공된 키워드/설명이 해석에 포함됨 |
| 질문 맥락 연결 | 카테고리/질문에 맞는 해석 (연애 질문에 재물 답변 X) |
| 정/역방향 구분 | 역방향일 때 주의/성찰 톤 반영 |
| 응답 구조 준수 | 지정한 형식(카드 해석/조언/한줄 요약) 대로 출력 |
| 적절한 길이 | 너무 짧지도(1줄), 너무 길지도(1000자+) 않은 적정 분량 |
| **심리적 납득감** | 읽었을 때 "내 얘기 같다"고 느껴지는가 (바넘 효과 작동 여부) |
| **감정 레이블링** | 사용자의 예상 감정을 먼저 명명하고 있는가 |
| **양면 진술 활용** | 상반된 면을 인정하는 표현이 포함되어 있는가 |
| **성찰 유도** | 직접적 지시("~하세요") 대신 성찰 유도("~를 돌아보세요") 형태인가 |
| **긍정 전환** | 부정적 카드도 성장/전환점으로 리프레이밍 되어 있는가 |

### 테스트 방법
1. 로컬에서 Ollama 실행
2. 대표 시나리오 5개로 프롬프트 테스트
   - 원카드 + "오늘 하루는 어떨까요?" (정방향)
   - 원카드 + "그 사람의 마음은 어떤가요?" (역방향)
   - 쓰리카드 + "지금 직장에서의 전망은?"
   - 쓰리카드 + "이 선택이 맞을까요?"
   - 원카드 + "지금 가장 필요한 메시지는?"
3. 체크리스트 기준으로 통과 여부 판단
4. 2개 이상 실패 → 프롬프트 수정 또는 모델 변경

---

## 프롬프트 튜닝 가이드

품질이 안 나올 때 순서대로 시도:

### 1단계: 시스템 지시 수정
- 톤/말투 조정 ("따뜻하게" → "친구처럼 편하게")
- 심리 규칙 가중치 조정 (바넘 효과가 약하면 양면 진술 비중 높이기 등)
- 규칙 추가/제거
- few-shot 예시 추가 (심리적 납득감이 높은 해석 예시를 1~2개 포함)

### 2단계: 출력 형식 수정
- 섹션 구조 변경
- 문장 수/길이 제한 조정

### 3단계: 카드 데이터 보강
- description 필드에 더 풍부한 설명 추가
- 카테고리별 해석 힌트 추가

### 4단계: 모델 변경
- `gemma2:2b` → `gemma2:7b` → `qwen2.5:7b` 순서로 교체 테스트
