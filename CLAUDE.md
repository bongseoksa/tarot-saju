# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드 문서입니다.

## 프로젝트 개요

타로 + 사주 웹 애플리케이션. 타로는 무료 진입 훅(유저 획득), 사주는 유료 수익화 레이어(Phase 2). 현재 사전 개발 단계로 스펙 문서만 존재하며 애플리케이션 코드는 아직 없음.

## 계획된 아키텍처

모노레포 구조:
- `apps/web/` — React + Vite SPA (TypeScript, Tailwind CSS, React Router, Zustand)
- `supabase/functions/` — Supabase Edge Functions (Deno/TypeScript) 백엔드 API
- `supabase/migrations/` — PostgreSQL 마이그레이션 파일
- `packages/shared/` — 공유 타입 및 상수

배포: Vercel (프론트엔드), Supabase (DB/Auth/Edge Functions), 로컬 PC + Cloudflare Tunnel (Ollama + Gemma를 통한 AI 모델 서빙)

모바일: Capacitor로 SPA를 WebView 기반 네이티브 Android/iOS 앱으로 패키징.

## 핵심 설계 결정

- **AI 역할은 해석 문장 생성에만 한정.** 카드 뽑기는 랜덤, 카드 의미와 스프레드 규칙은 정적 데이터(DB/JSON). AI가 생성하는 것은 최종 해석 문장뿐.
- **프롬프트 품질 = 서비스 품질.** Gemma 모델에 정적 카드 데이터 + 사용자 질문을 프롬프트 컨텍스트로 전달.
- **MVP 운영 비용 목표: 0원.** 모든 인프라는 무료 티어 또는 로컬 자원 활용.
- **문서 먼저, 코드는 나중에.** 코드 작성 전에 스펙 문서 먼저 작성. 설계 -> 검증 -> 개발 순서 유지.
- 모든 문서는 `docs/specs/`에 위치. 모든 기능 결정은 근거와 함께 문서화 필수.

## 스펙 문서

- `docs/specs/specs.md` — 마스터 서비스 스펙 (기술스택, 수익모델, 배포 타겟)
- `docs/specs/tech-decisions.md` — 기술스택 선정 근거
- `docs/specs/00-brainstorming.md` — 프로젝트 구조 및 개발 원칙
- `docs/specs/01-taro-mvp.md` — 타로 MVP 기능 설계 (사용자 흐름, 데이터 타입, API 엔드포인트)
- `docs/specs/backlog.md` — 백로그 (지연 항목)
- `docs/specs/04-harness-engineering.md` — 하네스 엔지니어링 적용 방안

## 언어 규칙

프로젝트 문서는 한국어로 작성. 코드와 코드 주석은 영어 사용. 사용자에게 노출되는 문자열은 한국어.

## 작업 후 문서 최신화

Claude를 통한 작업(코드 생성, 기능 추가, 구조 변경 등) 이후에는 반드시 `docs/` 하위 문서를 최신 상태로 업데이트해야 한다. 코드와 문서의 불일치를 방지하기 위해, 작업 완료 시 관련 스펙 문서의 변경 필요 여부를 확인하고 반영할 것.
