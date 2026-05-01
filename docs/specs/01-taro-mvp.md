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

## API 설계

### 1. 카드 뽑기
```
POST /api/draw
```
- 요청: { spreadId, question?, category? }
- 처리: 78장에서 스프레드 카드 수만큼 랜덤 선택 + 정/역방향 결정
- 응답: { cards: DrawnCard[], spread: Spread }
- 기회 1회 차감

### 2. 해석 요청
```
POST /api/interpret
```
- 요청: { spreadId, question?, category?, cards: DrawnCard[] }
- 처리: Supabase Edge Function → 로컬 AI 서버(Cloudflare Tunnel) 호출
  - 카드 정적 데이터 + 스프레드 위치 + 질문을 프롬프트로 조합 → AI 문장 생성
- 응답: SSE 스트리밍 { interpretation (청크), summary }
- 참고: 응답 속도는 PC 사양에 따라 다름 (속도 최적화는 백로그)

### 3. 결과 저장
```
POST /api/readings
```
- 요청: ReadingResult
- 처리: Supabase DB에 저장
- 인증 필요 (비로그인시 로컬 저장)

### 4. 결과 조회
```
GET /api/readings
```
- 응답: ReadingResult[] (최신순)
- 인증 필요

### 5. 기회 조회
```
GET /api/chances
```
- 응답: UserChance

### 6. 기회 충전 (광고)
```
POST /api/chances/ad
```
- 처리: 광고 시청 완료 콜백 검증 → 기회 +1

### 7. 기회 충전 (결제)
```
POST /api/chances/purchase
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
