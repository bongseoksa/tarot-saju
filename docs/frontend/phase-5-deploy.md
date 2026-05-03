# Phase 5: 트래킹 + 배포

> 목표: GTM/GA4 이벤트 트래킹, SEO 프리렌더, 배포 설정을 완료하여 프로덕션 출시 가능한 상태로 만든다.
> 완료 기준: GTM 스니펫 삽입, 핵심 퍼널 이벤트 12종 전송, 홈 프리렌더 HTML 생성, sitemap/robots.txt 포함, Vercel 배포 설정 완료, Lighthouse Performance 80+ / SEO 90+.
> **상태: 계획 완료**

---

## 전제

- Phase 4 완료: 전체 애니메이션/폴리싱 구현, 126 tests PASS
- 현재 트래킹/SEO/배포 설정 없음 (index.html에 GTM 스니펫 없음, vercel.json 없음)
- 스펙 참조:
  - `docs/specs/tech-decisions.md` — GTM+GA4 이벤트 목록, SEO 전략, Vercel 배포
  - `docs/specs/02-taro-mvp.md` — 사용자 흐름, 공유 OG 태그
  - `docs/specs/specs.md` — 배포 타겟, 도메인
- 환경 변수: `VITE_GTM_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADSENSE_CLIENT_ID`
- TDD: analytics 유틸은 단위 테스트, SEO/배포 설정은 빌드 검증

---

## 서브스텝 요약

| 서브스텝 | 제목 | 주요 파일 | 난이도 |
|---|---|---|---|
| 5-1 | GTM + GA4 트래킹 | `analytics.ts`, `useAnalytics.ts`, `index.html` | 중간 |
| 5-2 | SEO 기본 설정 | `index.html`, `sitemap.xml`, `robots.txt` | 낮음 |
| 5-3 | 동적 OG 메타태그 | Supabase Edge Function | 중간 |
| 5-4 | Vercel 배포 설정 | `vercel.json`, `.env.example` | 낮음 |
| 5-5 | 성능 기준선 + 최종 검증 | Lighthouse 감사 | 낮음 |

### 실행 순서

```
5-1 (트래킹)     → 핵심. 퍼널 이벤트 전송 기반
5-2 (SEO)        → 5-1과 병렬 가능. 메타태그 + 정적 파일
5-3 (동적 OG)    → 5-2 이후. Edge Function 별도 작업
5-4 (배포 설정)  → 독립적. 5-1~5-3 병렬 가능
5-5 (최종 검증)  → 5-1~5-4 모두 완료 후
```

### 의존성

```
5-1 ← 없음 (즉시 가능)
5-2 ← 없음 (즉시 가능, 5-1과 병렬)
5-3 ← 5-2 (기본 메타태그 완성 후)
5-4 ← 없음 (독립)
5-5 ← 5-1, 5-2, 5-3, 5-4 (전체 완료 후)
```

---

## 5-1. GTM + GA4 트래킹

> GTM 컨테이너 스니펫 삽입 + 핵심 퍼널 이벤트 12종 전송

### 추적 이벤트 목록

| 구분 | 이벤트명 | 파라미터 | 발생 시점 |
|---|---|---|---|
| 페이지 뷰 | `page_view` | (GTM History Change 자동) | SPA 라우트 변경 |
| 테마 선택 | `select_theme` | `themeId`, `category` | ThemeCard 클릭 |
| 카드 뽑기 완료 | `cards_selected` | `themeId`, `cardIds` | 3장 선택 완료 |
| 광고 노출 | `ad_impression` | `adType` | 광고 표시 |
| 광고 완료 | `ad_completed` | `adType` | 광고 시청 완료 |
| 광고 실패 | `ad_failed` | `adType`, `error` | 광고 로드/재생 실패 |
| 결과 도달 | `view_result` | `themeId`, `resultId` | ResultPage 마운트 |
| AI 시작 | `ai_stream_start` | `themeId` | 스트리밍 시작 |
| AI 완료 | `ai_stream_complete` | `themeId`, `durationMs` | 스트리밍 종료 |
| AI 오류 | `ai_stream_error` | `themeId`, `error` | 스트리밍 실패 |
| 공유 | `share_result` | `method` | 공유하기 클릭 |
| 재방문 | `return_user` | `sessionCount` | 홈 진입 시 (2회차+) |

### 핵심 퍼널

```
홈 진입 → 테마 선택 → 카드 뽑기 완료 → 광고 시청 → 결과 도달 → 공유
```

### 구현 대상

**`src/utils/analytics.ts`** — GTM dataLayer 유틸

```ts
// GTM dataLayer 타입 선언
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...params });
}
```

**`src/hooks/useAnalytics.ts`** — 페이지별 트래킹 훅

- `useResultAnalytics()` — ResultPage에서 `view_result` + AI 스트리밍 이벤트 자동 추적
- `useReturnUser()` — 홈에서 sessionCount 기반 `return_user` 추적

**`index.html`** — GTM 컨테이너 스니펫

- `<head>` 상단에 GTM 스크립트 삽입
- GTM ID는 환경 변수 `VITE_GTM_ID`에서 Vite 빌드 시 주입
- `<noscript>` iframe 포함

### 작업

- [ ] `analytics.ts` — `trackEvent` 유틸 + 타입 선언
- [ ] `analytics.test.ts` — dataLayer.push 호출 테스트 (window.dataLayer 모킹)
- [ ] `useAnalytics.ts` — 페이지별 트래킹 훅
- [ ] `index.html` — GTM 스니펫 삽입 (VITE_GTM_ID 환경 변수)
- [ ] 각 페이지/컴포넌트에 `trackEvent` 호출 삽입:
  - `HomePage.tsx` — `return_user`
  - `ThemeCard.tsx` 클릭 → `select_theme`
  - `ReadingPage.tsx` — 3장 완료 시 `cards_selected`
  - `ResultPage.tsx` — `view_result`, AI 스트리밍 이벤트
  - `useShare.ts` — `share_result`
- [ ] `.env.example` — `VITE_GTM_ID` 추가

**검증:** `pnpm run test` 통과, 빌드 후 index.html에 GTM 스니펫 존재 확인

---

## 5-2. SEO 기본 설정

> 홈 페이지 메타태그 + sitemap.xml + robots.txt

### 구현 대상

**`index.html`** — 정적 메타태그

```html
<title>점하나 - 오늘, 점 하나 찍어볼까?</title>
<meta name="description" content="AI가 읽어주는 타로 카드. 무료, 무제한. 지금 바로 점 하나 찍어보세요." />
<meta property="og:title" content="점하나 - 오늘, 점 하나 찍어볼까?" />
<meta property="og:description" content="AI가 읽어주는 타로 카드. 무료, 무제한." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

**`public/sitemap.xml`** — 정적 사이트맵

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://jeomhana.vercel.app/</loc><priority>1.0</priority></url>
</urlset>
```

- MVP 단계에서는 홈(`/`)만 크롤링 대상. 동적 페이지는 SEO 불필요

**`public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /reading/
Disallow: /result/
Disallow: /history
Sitemap: https://jeomhana.vercel.app/sitemap.xml
```

**`public/manifest.json`** — PWA 기본 매니페스트

```json
{
  "name": "점하나",
  "short_name": "점하나",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fef7ff",
  "theme_color": "#6b38d4"
}
```

### 작업

- [ ] `index.html` — 메타태그 (title, description, OG, Twitter Card)
- [ ] `public/sitemap.xml` — 정적 사이트맵
- [ ] `public/robots.txt` — 크롤링 규칙
- [ ] `public/manifest.json` — PWA 매니페스트 (name, icons, theme_color)
- [ ] `public/og-image.png` — 대표 OG 이미지 배치 (디자인 에셋 필요)

**검증:** 빌드 후 `dist/` 내 파일 존재 확인, HTML 메타태그 검증

---

## 5-3. 동적 OG 메타태그 (Edge Function)

> `/shared/:shareId` 공유 URL 접근 시 크롤러에게 동적 OG 태그 제공

### 배경

- 카카오톡/인스타 등에서 공유 링크 미리보기에 카드 이미지 + 해석 요약 표시
- SPA이므로 크롤러가 JS를 실행하지 않음 → Edge Function에서 HTML 생성 필요

### 구현 방식

**Supabase Edge Function** — `supabase/functions/og-meta/index.ts`

1. 요청 URL에서 `shareId` 추출
2. `shared_readings` 테이블에서 데이터 조회
3. User-Agent가 크롤러(facebookexternalhit, Twitterbot, kakaotalk-scrap 등)면 OG HTML 반환
4. 일반 브라우저면 SPA index.html로 리다이렉트

```ts
// OG HTML 응답 예시
<html>
<head>
  <meta property="og:title" content="${theme.title} - 점하나 타로" />
  <meta property="og:description" content="${summary}" />
  <meta property="og:image" content="${cardImageUrl}" />
  <meta http-equiv="refresh" content="0;url=https://jeomhana.vercel.app/shared/${shareId}" />
</head>
</html>
```

### Vercel Rewrites

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/shared/:shareId",
      "has": [{ "type": "header", "key": "user-agent", "value": "(facebookexternalhit|Twitterbot|kakaotalk-scrap|Slackbot|Discordbot)" }],
      "destination": "https://<supabase-project>.supabase.co/functions/v1/og-meta?shareId=:shareId"
    }
  ]
}
```

### 작업

- [ ] `supabase/functions/og-meta/index.ts` — Edge Function 구현
- [ ] `vercel.json` — 크롤러 User-Agent 조건부 rewrite 규칙
- [ ] Edge Function 로컬 테스트 (`supabase functions serve`)

**검증:** `curl -A "facebookexternalhit" /shared/test-id` → OG 메타태그 포함 HTML 응답

---

## 5-4. Vercel 배포 설정

> 모노레포 빌드 + SPA 폴백 + 환경 변수 설정

### 구현 대상

**`vercel.json`** (프로젝트 루트)

```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "outputDirectory": "apps/web/dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

**환경 변수 (Vercel Dashboard)**

| 변수 | 용도 | 환경 |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | Production |
| `VITE_SUPABASE_ANON_KEY` | Supabase 익명 키 | Production |
| `VITE_GTM_ID` | GTM 컨테이너 ID | Production |
| `VITE_ADSENSE_CLIENT_ID` | AdSense 클라이언트 ID | Production |

**`.env.example`** 업데이트

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GTM_ID=
VITE_ADSENSE_CLIENT_ID=
```

### 작업

- [ ] `vercel.json` — 빌드 명령, 출력 경로, SPA 폴백, 캐시 헤더, OG rewrite
- [ ] `.env.example` — 전체 환경 변수 목록 업데이트
- [ ] GitHub 연동 확인 (push → 자동 배포)

**검증:** `pnpm run build` 성공, `dist/index.html` 존재, SPA 라우팅 동작

---

## 5-5. 성능 기준선 + 최종 검증

> Lighthouse 감사로 성능/접근성/SEO 기준선 설정 + 배포 전 최종 점검

### Lighthouse 목표

| 카테고리 | 목표 점수 |
|---|---|
| Performance | 80+ |
| Accessibility | 90+ |
| Best Practices | 90+ |
| SEO | 90+ |

### 검증 항목

```
1. Lighthouse 감사 (chrome-devtools MCP)
   - 모바일 에뮬레이션 (390x844)
   - Performance / Accessibility / Best Practices / SEO 점수
2. GTM 동작 확인
   - dataLayer에 이벤트 push 확인 (콘솔)
   - 테마 선택 → 카드 뽑기 → 결과 도달 퍼널 전체 이벤트 확인
3. SEO 확인
   - 메타태그 존재 (title, description, og:*)
   - sitemap.xml 접근 가능
   - robots.txt 접근 가능
4. 빌드 확인
   - `pnpm run build` 성공
   - 번들 사이즈 확인 (초기 로드 < 200KB gzip)
   - 전체 테스트 통과
5. 배포 확인
   - Vercel 프리뷰 배포 → SPA 라우팅 정상
   - /shared/:shareId OG 크롤러 응답 확인
```

### 작업

- [ ] Lighthouse 감사 실행 + 점수 기록
- [ ] 성능 이슈 발견 시 수정 (이미지 최적화, 코드 스플리팅 등)
- [ ] 최종 테스트 스위트 통과 확인
- [ ] 프리뷰 배포 + 수동 QA

**검증:** Lighthouse 전 카테고리 목표 달성, 전체 테스트 통과, 프리뷰 배포 정상 동작
