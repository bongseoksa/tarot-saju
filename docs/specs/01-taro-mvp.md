# 타로 MVP 기능 설계

## 핵심 목표
- 빠른 체험 → 감정 자극 → 공유 유도
- 1회 무료 제공 후 광고/결제로 기회 추가

---

## 사용자 흐름

```
[1. 홈] → [2. 스프레드 선택] → [3. 질문 입력] → [4. 카드 뽑기] → [5. 해석 결과] → [6. 공유/저장]
                                                                          ↓
                                                                   [기회 소진시]
                                                                          ↓
                                                              [7. 기회 충전 (광고/결제)]
```

### 화면별 정의

#### 1. 홈
- 서비스 소개 (한 줄)
- "타로 보기" CTA 버튼
- 남은 기회 표시

#### 2. 스프레드 선택
- 원카드 (오늘의 운세) — MVP 기본
- 쓰리카드 (과거/현재/미래) — MVP 포함
- 켈틱크로스 등 → Phase 2 이후

#### 3. 질문 입력
- 자유 텍스트 입력 (선택사항)
- 카테고리 빠른 선택: 연애, 직장, 재물, 건강, 오늘의 운세
- 질문 없이 진행 가능 (기본: "오늘의 운세")

#### 4. 카드 뽑기
- 카드 뒷면 나열 → 터치로 선택
- 선택시 뒤집기 애니메이션
- 정방향/역방향 랜덤 결정

#### 5. 해석 결과
- 선택한 카드 이미지 + 카드명
- 정방향/역방향 표시
- AI 생성 해석 문장 (스트리밍 표시)
- 공유 버튼, 저장 버튼

#### 6. 공유
- 결과 이미지 생성 (카드 + 핵심 해석 요약)
- 카카오톡, 인스타 스토리, 링크 복사

#### 7. 기회 충전
- 광고 시청 → 1회 추가
- 기회권 결제 (5회/10회/30회)

---

## 데이터 구조

### 타로 카드 (78장)

```typescript
interface TarotCard {
  id: number;                  // 0~77
  name: string;                // "The Fool"
  nameKo: string;              // "광대"
  arcana: "major" | "minor";   // 메이저/마이너 아르카나
  suit?: "wands" | "cups" | "swords" | "pentacles";  // 마이너만
  number: number;              // 카드 번호
  imageUrl: string;            // 카드 이미지 경로
  meaningUpright: string;      // 정방향 키워드 (예: "새로운 시작, 자유, 모험")
  meaningReversed: string;     // 역방향 키워드 (예: "무모함, 방향 상실")
  description: string;         // 카드 상세 설명 (프롬프트에 포함)
}
```

### 스프레드

```typescript
interface Spread {
  id: string;                  // "one-card" | "three-card"
  name: string;                // "원카드"
  nameKo: string;              // "원카드 스프레드"
  cardCount: number;           // 1 | 3
  positions: SpreadPosition[];
}

interface SpreadPosition {
  index: number;               // 0부터
  label: string;               // "현재" | "과거" | "미래"
  description: string;         // "현재 상황을 나타냅니다"
}
```

### 해석 요청/결과

```typescript
interface ReadingRequest {
  spreadId: string;
  question?: string;
  category?: "love" | "career" | "wealth" | "health" | "daily";
  cards: DrawnCard[];
}

interface DrawnCard {
  cardId: number;
  positionIndex: number;
  isReversed: boolean;
}

interface ReadingResult {
  id: string;
  userId?: string;
  request: ReadingRequest;
  interpretation: string;      // AI 생성 해석 문장
  summary: string;             // 공유용 한 줄 요약
  createdAt: string;
}
```

### 기회 관리

```typescript
interface UserChance {
  userId: string;
  freeUsed: boolean;           // 최초 1회 무료 사용 여부
  remainingChances: number;    // 남은 기회
  lastAdWatch?: string;        // 마지막 광고 시청 시각
}
```

---

## 아키텍처

Supabase Edge Function 무료 티어 개수 제한(10~15개)을 고려하여, 서버 검증이 필수인 로직만 Edge Function으로 처리. 나머지는 클라이언트 + Supabase SDK(RLS)로 직접 처리.

```
[앱 (클라이언트)]
  ├── 카드 뽑기 (랜덤) ─────────────────→ 자체 처리
  ├── 결과 저장/조회, 기회 조회 ─────────→ Supabase DB (SDK + RLS)
  ├── 기회 차감 + 프롬프트 요청 ─────────→ Edge Function (interpret)
  ├── AI 해석 요청 ─────────────────────→ Ollama (Cloudflare Tunnel, 직접 호출)
  └── 광고 보상 ────────────────────────→ Edge Function (chances-ad)
```

---

## API 설계

### Edge Functions (서버 검증 필수 — MVP 2개)

#### 1. 해석 요청
```
POST /functions/v1/interpret
```
- 요청: { spreadId, question?, category?, cards: DrawnCard[] }
- 처리: 기회 잔여 확인 → 기회 1회 차감 → 카드 정적 데이터 + 스프레드 위치 + 질문으로 프롬프트 조합
- 응답: { prompt: string, ollamaUrl: string }
- 클라이언트는 반환된 prompt로 Ollama에 직접 요청

#### 2. 기회 충전 (광고)
```
POST /functions/v1/chances-ad
```
- 처리: 광고 시청 완료 콜백 검증 → 기회 +1
- 응답: { remainingChances: number }

### 클라이언트 직접 처리

#### 3. 카드 뽑기
- 클라이언트에서 78장 중 랜덤 선택 + 정/역방향 결정
- 서버 호출 없음

#### 4. AI 해석 호출
```
POST {ollamaUrl}/api/generate
```
- 요청: interpret에서 받은 prompt 전달
- 응답: SSE 스트리밍 (해석 문장)
- Edge Function 타임아웃 우회를 위해 클라이언트에서 직접 호출
- 참고: 응답 속도는 PC 사양에 따라 다름 (속도 최적화는 백로그)

#### 5. 결과 저장 (Supabase SDK + RLS)
- Supabase client SDK로 readings 테이블에 직접 insert
- 비로그인시 로컬 스토리지 저장

#### 6. 결과 조회 (Supabase SDK + RLS)
- Supabase client SDK로 readings 테이블 직접 조회
- 최신순 정렬

#### 7. 기회 조회 (Supabase SDK + RLS)
- Supabase client SDK로 user_chances 테이블 직접 조회

### Phase 2 추가 예정
#### 기회 충전 (결제)
```
POST /functions/v1/chances-purchase
```
- 요청: { productId }
- 처리: 결제 검증 → 기회 추가

---

## MVP 범위

### 포함
- 원카드 / 쓰리카드 스프레드
- 카드 뽑기 + AI 해석
- 1회 무료 → 광고로 기회 추가
- 결과 공유 (링크 복사)
- 비로그인 이용 가능 (결과 로컬 저장)

### 제외 (Phase 2 이후)
- 켈틱크로스 등 고급 스프레드
- 회원가입/로그인 (소셜)
- 결과 히스토리 (서버 저장)
- 인앱 결제
- 카카오톡/인스타 공유 연동
- 푸시 알림
