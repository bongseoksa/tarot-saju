# tarot-saju

타로 + 사주 웹 애플리케이션 (점하나)

## 로컬 실행 방법

### 사전 조건

- Node.js 22+
- pnpm
- [Ollama](https://ollama.com/) 설치 + gemma4:e4b 모델 다운로드

```bash
ollama pull gemma4:e4b
```

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Ollama 실행

터널을 통한 외부 접근 허용을 위해 환경 변수를 설정하여 실행합니다.

```bash
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

### 3. 로컬 프록시 서버 실행

Supabase Edge Function을 대체하는 로컬 프록시입니다. Ollama에 프롬프트를 전달하고 SSE 스트리밍 응답을 중계합니다.

```bash
node scripts/local-proxy.mjs
```

프록시가 `http://localhost:54321`에서 실행됩니다.

### 4. FE 환경 변수 설정

`apps/web/.env.local`에서 로컬 프록시를 사용하도록 설정합니다.

```bash
# 로컬 프록시 모드
VITE_SUPABASE_URL=http://localhost:54321

# 프로덕션 모드 (Supabase Edge Function 사용 시)
# VITE_SUPABASE_URL=https://aecasypyugpftkpvngvs.supabase.co
```

### 5. FE 개발 서버 실행

```bash
cd apps/web
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속.

### 전체 실행 요약 (터미널 3개)

```bash
# 터미널 1: Ollama
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve

# 터미널 2: 로컬 프록시
node scripts/local-proxy.mjs

# 터미널 3: FE 개발 서버
cd apps/web && pnpm dev
```

### Cloudflare Tunnel (외부 접근)

로컬 Ollama를 외부에서 접근 가능하게 하려면 Cloudflare Tunnel을 사용합니다.

```bash
# Quick Tunnel (임시 URL, 도메인 불필요)
cloudflared tunnel --url http://localhost:11434
```

상세 설정은 `docs/reference/cloudflare-tunnel-setup.md` 참조.

## 프로젝트 구조

```
apps/web/              — React + Vite SPA (TypeScript, Tailwind CSS)
packages/shared/       — 공유 타입, 정적 데이터, 프롬프트 빌더
supabase/functions/    — Supabase Edge Functions (interpret, og-image)
supabase/migrations/   — PostgreSQL 마이그레이션
scripts/               — 로컬 프록시, AI 테스트
docs/                  — 스펙, 디자인, 참고 자료
```

## 스펙 문서

전체 인덱스: `docs/specs/README.md`
