# 점하나 MVP — 진행 관리

> 최종 업데이트: 2026-05-10
>
> 상세 작업 내용은 [handoff/](./handoff/) 하위 문서 참조.

---

## 전체 진행률

| Sprint | 진행률 | 상태 |
|---|---|---|
| [Sprint 0: 공통 기반](./handoff/sprint-0.md) | 3/3 | 완료 |
| [Sprint 1-FE: 프론트엔드](./handoff/sprint-1-fe.md) | 3/3 | 완료 |
| [Sprint 1-BE: 백엔드](./handoff/sprint-1-be.md) | 0/5 | 대기 |
| [Sprint 1-AI: AI](./handoff/sprint-1-ai.md) | 0/5 | 대기 |
| [Sprint 2: 통합](./handoff/sprint-2.md) | 0/4 | 대기 |
| [Sprint 3: 폴리싱+인프라](./handoff/sprint-3.md) | 0/9 | 대기 |
| **합계** | **6/29** | |

---

## Task 상태 일람

> `TODO` / `IN_PROGRESS` / `DONE` / `BLOCKED`

### Sprint 0: 공통 기반

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 0-1 | 정적 데이터 packages/shared 통합 | DONE | — | 공통 |
| 0-2 | API 계약 타입 정의 | DONE | — | 공통 |
| 0-3 | MSW interpret mock 핸들러 | DONE | 0-1, 0-2 | FE |

### Sprint 1-FE: 프론트엔드

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 1-FE-1 | FE 재구축 + 테스트 통과 | DONE | — | FE |
| 1-FE-2 | SSE 클라이언트 API 계약 정합성 | DONE | 0-2 | FE |
| 1-FE-3 | 디자인 시안 적용 + 반응형 레이아웃 검증 | DONE | 1-FE-1 | FE |

### Sprint 1-BE: 백엔드

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 1-BE-1 | Supabase 프로젝트 초기화 | TODO | — | BE |
| 1-BE-2 | shared_readings DB 마이그레이션 | TODO | 1-BE-1 | BE |
| 1-BE-3 | interpret Edge Function 스켈레톤 | TODO | 0-1, 0-2, 1-BE-1 | BE |
| 1-BE-4 | 공유 결과 저장/조회 (SDK + RLS) | TODO | 1-BE-2 | BE |
| 1-BE-5 | 동적 OG 태그 Edge Function | TODO | 1-BE-4 | BE |

### Sprint 1-AI: AI

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 1-AI-1 | prompt-builder 구현 | TODO | 0-1 | AI |
| 1-AI-2 | 시스템 프롬프트 v1 + Ollama 수동 테스트 | TODO | 1-AI-1 | AI |
| 1-AI-3 | 응답 파싱 + 출력 가드레일 | TODO | 1-AI-1 | AI |
| 1-AI-4 | AI 테스트 인프라 (runner/guard/evaluator) | TODO | 1-AI-1, 1-AI-3 | AI |
| 1-AI-5 | test:ai:quick 실행 + 프롬프트 튜닝 | TODO | 1-AI-4 | AI |

### Sprint 2: 통합

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 2-1 | BE에 prompt-builder 연결 | TODO | 1-BE-3, 1-AI-1 | BE+AI |
| 2-2 | FE에 실제 API 연결 | TODO | 2-1, 1-FE-2 | FE+BE |
| 2-3 | 공유 기능 E2E | TODO | 2-2, 1-BE-4, 1-BE-5 | FE+BE |
| 2-4 | 에지 케이스 통합 테스트 | TODO | 2-2 | 전체 |

### Sprint 3: 폴리싱 + 인프라

| Task | 이름 | 상태 | 의존 | 담당 |
|---|---|---|---|---|
| 3-1 | 광고 연동 (AdSense) | TODO | 2-2 | FE |
| 3-2 | 카드 선택 애니메이션 폴리싱 | TODO | 1-FE-1 | FE |
| 3-3 | 반응형 레이아웃 최종 검증 | TODO | 2-2 | FE |
| 3-4 | Vercel 배포 + Cloudflare Tunnel | TODO | 2-2 | Infra |
| 3-5 | GA4 이벤트 트래킹 | TODO | 3-4 | Infra |
| 3-6 | Sentry 에러 트래킹 | TODO | 2-2 | Infra+FE+BE |
| 3-7 | test:ai:full 실행 | TODO | 2-1, 1-AI-4 | AI |
| 3-8 | SEO 프리렌더 + 메타데이터 | TODO | 3-4 | FE+Infra |
| 3-9 | CI/CD + Git Hooks | TODO | 1-FE-1 | Infra |

---

## 병렬 실행 그룹

작업 순서 결정 시 참고. 같은 그룹 내 Task는 동시 착수 가능.

| 그룹 | Task | 선행 조건 |
|---|---|---|
| **A** | 0-1, 0-2, 1-FE-1, 1-BE-1 | 없음 |
| **B** | 0-3, 1-AI-1, 1-BE-2, 1-BE-3 | Group A |
| **C** | 1-FE-2, 1-FE-3, 1-AI-2, 1-AI-3, 1-BE-4 | Group B |
| **D** | 1-AI-4, 1-BE-5 | Group C |
| **E** | 2-1→2-2→2-3→2-4 (순차), 1-AI-5 | Group D |
| **F** | 3-1, 3-2, 3-3, 3-6 (병렬), 3-4→3-5→3-8 (순차), 3-7, 3-9 | Group E (3-9는 Group A) |

---

## 의존 관계 그래프

```
Sprint 0                Sprint 1                    Sprint 2        Sprint 3
─────────────────────────────────────────────────────────────────────────────

0-1 ─┬──→ 0-3 ──→ 1-FE-2 ──┐
     ├──→ 1-AI-1 ──┬→ 1-AI-2│                                      3-1
     │             ├→ 1-AI-3 ┤                                      3-2
     │             │    └→ 1-AI-4 → 1-AI-5              ┌──→ 3-4 → 3-5
     │             │              └────────────→ 3-7     │          3-6
     └──→ 1-BE-3 ──┘──→ 2-1 → 2-2 ──┬→ 2-3              │
                                     ├→ 2-4     ─────────┘          3-3
0-2 ─┬──→ 0-3                       │
     ├──→ 1-FE-2 ───────────────────┘
     └──→ 1-BE-3

1-FE-1 ──→ 1-FE-3

1-FE-1 ──→ 3-9

1-BE-1 ──→ 1-BE-2 ──→ 1-BE-4 ──→ 1-BE-5
     └──→ 1-BE-3                  └──→ 2-3

3-4 ──→ 3-5 ──→ 3-8
```

---

## 완료 이력

| 영역 | 내용 |
|---|---|
| 스펙 문서 | `docs/specs/` 전체 구조화 (01~07 + backlog + README) |
| 디자인 시스템 | `docs/design/stitch/design-system.md` |
| 공유 타입 | `packages/shared/src/types.ts` |
| 공유 데이터 | `packages/shared/src/data/` (themes, spreads, cards) + `data/tarot-cards.json` |
| API 계약 타입 | `packages/shared/src/api.ts` (InterpretRequest, SSEEvent, InterpretResult) |
| MSW 패키지 | `packages/msw-handler/` (createMock, server, browser, gateway, interpret mock) |
| FE 재구축 | `apps/web/` 처음부터 재구축 (라우팅, 페이지, 스토어, SSE 클라이언트, 테스트) |
| GTM | `index.html` GTM 스니펫 (`GTM-549LQWSC`), `.env.example` 업데이트 |
| 디자인 시안 | `docs/design/stitch/stitch_jeomhana_mvp_v2/` (7 페이지 HTML + 스크린샷) |
| 디자인 시스템 | `docs/design/stitch/design-system.md` (컬러, 타이포, 컴포넌트) |
| 이미지 자산 | 타로 카드 22장(`card_00~21.png`) + 뒷면(`card_back.png`), 마스코트 3종, 파비콘 |
| 핸드오프 디자인 가이드 | `docs/handoff/page-design-guide.md` (페이지별 시안↔코드 매핑) |

---

## 싱크 규칙

| 규칙 | 설명 |
|---|---|
| **계약 변경 시 전 트랙 공유** | `packages/shared/` 타입·API 계약 변경 → 스펙 문서 즉시 갱신 |
| **Sprint 경계에서 통합 테스트** | Sprint 1 완료 후 반드시 Sprint 2 통합 수행 |
| **MSW mock = API 계약의 거울** | FE mock 응답 = BE 실제 응답 포맷. 계약 변경 시 mock도 갱신 |
| **prompt-builder 단일 소스** | BE(Edge Function)와 AI(테스트)가 동일 소스 사용. 복사본 금지 |
| **문서 최신화** | Task 완료 시 관련 `docs/` 문서 변경 여부 확인 + 반영 |
