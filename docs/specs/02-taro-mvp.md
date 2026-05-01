# 타로 MVP 기능 설계

## 핵심 목표
- 빠른 체험 → 감정 자극 → 공유 유도
- 무제한 무료 이용 + 결과 보기 전 매회 광고 시청

---

## 사용자 흐름

> 벤치마킹(점신) 반영하여 단순화. 상세 분석: [01-benchmark-jeomsin.md](./01-benchmark-jeomsin.md)

```
[1. 홈 (테마 목록)] → [2. 카드 뽑기 (3장)] → [3. 광고 시청] → [4. AI 해석 결과] → [5. 공유/저장]
```

### 화면별 정의

#### 1. 홈 (테마 목록)
- 상단: 일상 타로 섹션 (오늘의 타로, 이번 주 타로)
- 카테고리 탭 필터: 전체 / 연애 / 직장 / 재물 / 학업 / 기타
- 테마 카드 목록 (해시태그 키워드 포함)
- 테마 선택 시 바로 카드 뽑기 진입 (별도 질문 선택 없음)

#### 테마 콘텐츠 (테마 = 질문)

| 카테고리 | 테마 (MVP) | 해시태그 |
|---|---|---|
| 일상 | 오늘의 타로 | #오늘 #하루운세 |
| 일상 | 이번 주 타로 | #이번주 #주간운세 |
| 연애 | 나의 연애운 | #연애 #애정운 |
| 연애 | 그 사람의 마음 | #짝사랑 #속마음 |
| 연애 | 새로운 인연 | #인연 #만남 |
| 직장 | 직장에서의 전망 | #직장 #커리어 |
| 직장 | 이직 타이밍 | #이직 #전환 |
| 재물 | 나의 재물운 | #재물 #금전운 |
| 학업 | 시험/학업 결과 | #시험 #합격 |
| 기타 | 지금 필요한 메시지 | #조언 #메시지 |
| 기타 | 이 선택이 맞을까 | #선택 #결정 |

> 벤치마킹: 점신은 40+ 테마 운영. MVP는 11개로 시작, 점진 확장.

#### 2. 카드 뽑기 (쓰리카드 고정)
- MVP는 쓰리카드(과거/현재/미래) 고정 — 스프레드 선택 없음
- 카드 22장 뒷면 그리드 배치 (메이저 아르카나)
- 상단에 결과 슬롯 3개 미리 표시 (과거/현재/미래)
- 터치로 선택 → 뒤집기 애니메이션
- 정방향/역방향 랜덤 결정
- 3장 선택 완료 시: "다시 선택" / "결과 보기" 버튼

#### 3. 광고 시청 (결과 게이트)
- 결과 보기 전 광고 시청 필수
- 배너 광고 또는 전면 광고 (Google AdMob/AdSense)
- 기회 제한 없음 — 매번 무료 이용 + 매번 광고

#### 4. AI 해석 결과
- 선택한 카드 이미지 + 카드명
- 정방향/역방향 표시
- AI 생성 해석 문장 (스트리밍 표시) — 점신 대비 차별점
- 공유 버튼, 저장 버튼

#### 5. 공유
- 결과 이미지 생성 (카드 + 핵심 해석 요약)
- 링크 복사 (MVP)
- 카카오톡, 인스타 스토리 → Phase 2

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
  themeId: string;               // TarotTheme.id
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

### 테마 콘텐츠

```typescript
interface TarotTheme {
  id: string;                    // "daily-today" | "love-feeling" 등
  category: "daily" | "love" | "career" | "wealth" | "study" | "general";
  title: string;                 // "오늘의 타로"
  description: string;           // "오늘 하루는 어떨까?"
  tags: string[];                // ["#오늘", "#하루운세"]
  spreadType: "three-card";      // MVP는 쓰리카드 고정
  positions: string[];           // ["과거", "현재", "미래"]
}
```

> 기회 관리(UserChance) 제거 — 매번 광고 시청 방식으로 전환. 상세: [01-benchmark-jeomsin.md](./01-benchmark-jeomsin.md)

---

## 아키텍처

> 벤치마킹 반영: 기회 관리 제거, 매회 광고 시청 모델로 전환. Edge Function 1개로 축소.

```
[앱 (클라이언트)]
  ├── 테마 목록 / 카드 뽑기 (랜덤) ────→ 자체 처리 (정적 데이터)
  ├── 프롬프트 요청 ───────────────────→ Edge Function (interpret)
  ├── AI 해석 요청 ─────────────────────→ Ollama (Cloudflare Tunnel, 직접 호출)
  ├── 결과 저장/조회 ──────────────────→ Supabase DB (SDK + RLS)
  └── 광고 표시 ────────────────────────→ Google AdMob/AdSense (클라이언트)
```

---

## API 설계

### Edge Functions (서버 검증 필수 — MVP 1개)

#### 1. 해석 요청
```
POST /functions/v1/interpret
```
- 요청: { themeId, cards: DrawnCard[] }
- 처리: 카드 정적 데이터 + 테마 정보 + 스프레드 위치로 프롬프트 조합
- 응답: { prompt: string, ollamaUrl: string }
- 클라이언트는 반환된 prompt로 Ollama에 직접 요청

> 기회 차감 로직 제거 — 광고는 클라이언트에서 직접 처리 (AdMob SDK)

### 클라이언트 직접 처리

#### 2. 카드 뽑기
- 클라이언트에서 22장(메이저 아르카나) 중 랜덤 선택 + 정/역방향 결정
- 서버 호출 없음

#### 3. 광고 표시 (결과 게이트)
- 결과 보기 전 광고 시청 필수 (리워드 광고 또는 전면 광고)
- 클라이언트에서 AdMob/AdSense SDK로 직접 처리
- 서버 검증 불필요 (기회 관리 없음)

#### 4. AI 해석 호출
```
POST {ollamaUrl}/api/generate
```
- 요청: interpret에서 받은 prompt 전달
- 응답: SSE 스트리밍 (해석 문장)
- Edge Function 타임아웃 우회를 위해 클라이언트에서 직접 호출

#### 5. 결과 저장 (Supabase SDK + RLS)
- Supabase client SDK로 readings 테이블에 직접 insert
- 비로그인시 로컬 스토리지 저장

#### 6. 결과 조회 (Supabase SDK + RLS)
- Supabase client SDK로 readings 테이블 직접 조회
- 최신순 정렬

### Phase 2 추가 예정
#### 행운패스 (광고 제거 구독)
```
POST /functions/v1/subscription
```
- 요청: { productId }
- 처리: 결제 검증 → 구독 상태 변경 → 광고 제거

---

## MVP 범위

### 포함
- 테마 기반 타로 콘텐츠 (11개 테마)
- 쓰리카드 스프레드 (고정)
- 카드 뽑기 (메이저 아르카나 22장) + AI 해석
- 매회 무료 + 결과 보기 전 광고 시청
- 카테고리 탭 필터 (일상/연애/직장/재물/학업/기타)
- 결과 공유 (링크 복사)
- 비로그인 이용 가능 (결과 로컬 저장)

### 제외 (Phase 2 이후)
- 원카드 / 켈틱크로스 등 추가 스프레드
- 마이너 아르카나 (56장) 추가
- 카드덱 커스터마이징
- 연간/월간 시즌 타로 콘텐츠
- 회원가입/로그인 (소셜)
- 결과 히스토리 (서버 저장)
- 행운패스 (광고 제거 구독)
- 카카오톡/인스타 공유 연동
- 전문 상담 연결
- 푸시 알림
