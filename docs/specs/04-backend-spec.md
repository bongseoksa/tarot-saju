# 백엔드 스펙

> MVP는 Supabase를 사용하지만, 백엔드 구성은 교체 가능하도록 설계한다.
> Supabase 관련 내용은 현재 선택된 구현체이며, 요구사항이 변경되면 다른 솔루션으로 대체할 수 있다.

---

## 아키텍처

> 벤치마킹 반영: 기회 관리 제거, 매회 광고 시청 모델로 전환. Edge Function 1개로 축소.

```
[앱 (클라이언트)]
  ├── 테마 목록 / 카드 뽑기 (랜덤) ────→ 자체 처리 (정적 데이터)
  ├── AI 해석 요청 ─────────────────────→ Edge Function (interpret)
  │                                         ├── 프롬프트 조합
  │                                         ├── Ollama 호출 (Cloudflare Tunnel)
  │                                         └── SSE 스트리밍 중계 → 클라이언트
  ├── 결과 저장/조회 ──────────────────→ Supabase DB (SDK + RLS)
  └── 광고 표시 ────────────────────────→ Google AdMob/AdSense (클라이언트)
```

---

## API 설계

### Edge Functions (서버 검증 필수 — MVP 1개)

#### 1. 해석 요청 + AI 스트리밍 (interpret)
```
POST /functions/v1/interpret
```
- 요청: `{ themeId: string, cards: DrawnCard[] }`
- 처리:
  1. 카드 정적 데이터 + 테마 정보 + 스프레드 위치로 프롬프트 조합
  2. Ollama API 호출 (`OLLAMA_URL` — Supabase Secret, 백엔드 전용)
  3. SSE 스트리밍 응답을 클라이언트로 중계
- 응답 (200): SSE 스트리밍 (해석 문장)
- 에러 (400/500): `{ error: string }`
- 인증: Supabase anon key (기본)
- Ollama URL은 프론트엔드에 노출되지 않음 — 보안 근본 해결
- Supabase Edge Function 스트리밍 타임아웃: 150초 (AI 생성 5~30초 충분 커버)

> 기회 차감/광고 검증 로직 제거 — 광고는 클라이언트에서 직접 처리 (AdMob SDK)
> MVP 사용자 추적: GA4/GTM으로만. DB에 사용자 관련 데이터 없음

### 클라이언트 직접 처리

#### 2. 카드 뽑기
- 클라이언트에서 22장(메이저 아르카나) 중 랜덤 선택 + 정/역방향 결정
- 서버 호출 없음

#### 3. 광고 표시 (결과 게이트)
- 전면 광고(Interstitial) 매회 1회. 웹: AdSense / 앱: AdMob (Capacitor)
- 결과 화면 하단 배너 광고 1개 (홈 배너 없음)
- 클라이언트에서 SDK로 직접 처리. 서버 검증 불필요 (기회 관리 없음)

#### 5. 결과 저장
- localStorage에 저장 (암호화+압축, storageUtil 경유)
- 서버 DB 저장 없음 (MVP 비로그인)

#### 6. 공유 결과 저장 (Supabase SDK + RLS)
- "공유하기" 클릭 시에만 shared_readings 테이블에 insert
- 30일 후 자동 삭제

#### 7. 공유 결과 조회 (Supabase SDK + RLS)
- `/shared/:shareId` 접근 시 shared_readings 테이블 조회
- 최신순 정렬

### Phase 2 추가 예정
#### 행운패스 (광고 제거 구독)
```
POST /functions/v1/subscription
```
- 요청: { productId }
- 처리: 결제 검증 → 구독 상태 변경 → 광고 제거

---

## DB 스키마

MVP에서 DB는 공유 기능 전용. 결과 히스토리는 localStorage.

```sql
-- 공유 결과 저장 (공유하기 클릭 시에만 INSERT)
CREATE TABLE shared_readings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id    text NOT NULL,
  theme_title text NOT NULL,
  cards       jsonb NOT NULL,        -- [{cardId, positionIndex, isReversed}]
  interpretation text NOT NULL,      -- AI 해석 전문
  summary     text NOT NULL,         -- 공유용 한줄 요약
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT now() + interval '30 days'
);

CREATE INDEX idx_shared_readings_expires ON shared_readings (expires_at);

-- RLS
ALTER TABLE shared_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read" ON shared_readings FOR SELECT USING (true);
CREATE POLICY "anyone can insert" ON shared_readings FOR INSERT WITH CHECK (true);
```

- 만료 삭제: pg_cron 또는 Supabase scheduled function (`DELETE FROM shared_readings WHERE expires_at < now()`)
- readings 테이블 (유저별 결과 서버 저장): P0 백로그 — 회원가입 구현 후 추가

---

## 백엔드 기술 선정

### Supabase Edge Functions + SDK (RLS)

#### 설계 원칙
무료 티어 Edge Function 개수 제한(10~15개)이 있으므로, **서버 검증이 필수인 로직만** Edge Function으로 처리. CRUD 작업은 Supabase SDK + RLS로 클라이언트에서 직접 DB 접근.

#### Edge Function 사용 기준
| 처리 방식 | 기준 | 예시 |
|---|---|---|
| Edge Function | 서버에서 검증해야 하는 로직 | 프롬프트 조합, 결제 검증 (Phase 2) |
| Supabase SDK + RLS | 단순 CRUD, 사용자 본인 데이터 | 결과 저장/조회, 기회 조회 |
| 클라이언트 자체 처리 | 서버 불필요 | 카드 랜덤 뽑기 |

#### MVP Edge Functions (1개)
1. **interpret** — 프롬프트 조합 + Ollama 호출 + SSE 스트리밍 중계 (카드 정적 데이터 + 테마 정보 → 프롬프트 생성 → Ollama로 해석 요청 → 클라이언트로 스트리밍 중계)

> 기회 차감/광고 검증 로직 제거 — 매회 무료 + 클라이언트 광고 시청 방식으로 전환. 상세: [01-benchmark.md](./01-benchmark.md)

#### 선정 이유
- **서버 관리 불필요**: MVP 단계에서 별도 서버 운영/배포 부담 제거
- **Supabase 통합**: DB, Auth, Storage와 동일 플랫폼에서 함수 실행
- **TypeScript 지원**: 프론트엔드와 언어 통일 (Deno 런타임)
- **무료 티어**: MVP 검증에 충분한 사용량 제공
- **RLS 활용**: Edge Function 개수 최소화하면서도 보안 유지

#### 확장 계획
- 트래픽 증가 또는 복잡한 비즈니스 로직 필요시 Node.js (NestJS) 도입 검토

### 데이터베이스: Supabase (PostgreSQL)

#### 선정 이유
- **관계형 DB + 실시간 기능**: PostgreSQL 기반으로 안정적이며 Realtime 구독 지원
- **인증 내장**: Supabase Auth로 소셜 로그인 등 별도 인증 서버 불필요
- **Row Level Security**: DB 레벨 접근 제어로 보안 확보
- **pgvector 확장**: 사주 확장시 벡터 검색 동일 DB에서 처리 가능
- **무료 티어**: 500MB 스토리지, 50K 월간 활성 유저

#### 검토했지만 제외한 대안
- **Firebase**: NoSQL 구조가 사주 데이터(관계 많음)에 부적합
- **PlanetScale**: MySQL 기반, 벡터 검색 미지원

### Python 백엔드를 선택하지 않은 이유
- 별도 서버 인프라 필요 (배포, 모니터링, 스케일링)
- MVP 단계에서 과도한 인프라 복잡도
- 프론트엔드(TypeScript)와 언어 분리로 인한 개발 속도 저하
- AI 서빙은 Ollama가 담당하므로 Python 서버 불필요
