# Mock System Reference

MSW 기반 API Mocking 시스템의 아키텍처 및 사용법 문서입니다.

## 0. 서비스 레벨 환경에서 Mocking 방지

`NEXT_PUBLIC_ENV`, `VITE_APP_ENV` 환경변수가 `dev` 또는 `local`인 경우에만 MSW가 허용됩니다.

## 1. 각 앱에서 사용법 (Integration Guide)

각 서비스 애플리케이션(`apps/*`)에서 MSW를 연동하는 방법입니다.

### 패키지 Export 구조

- `@packages/msw-handler`: `MSWProvider`, `useMSWContext` 및 관련 타입 (기본 export)
- `@packages/msw-handler/core`: Core API (`initMSW`, `closeMSW`, `createMock`, `setMocks`, `setConfig`, `setConfigAll`)
- `@packages/msw-handler/react`: React Component & Hook export

대부분의 경우 기본 export(`@packages/msw-handler`)를 사용하면 됩니다.

### 1.1 사전 준비 (Prerequisites)

1. **msw-handler 패키지 빌드**
    ```bash
    # fromm-web 루트 에서 실행합니다.
    pnpm add @packages/msw-handler
    ```

2. **mockServiceWorker.js 설치 및 msw-handler 빌드**
    ```bash
    # 각 앱의 package.json 파일의 script에 커맨드 추가
    "init:msw-handler": "pnpm --filter @packages/msw-handler init:app --$(basename $(pwd))"
    ```

### 1.2 앱 연동 (Implementation)

**1. Mock 데이터 파일 정의**

각 앱에 Feature별 Mock 파일을 생성하고 하나의 배열에 취합합니다.
- 사용성을 위해 mock 데이터를 msw-handler에 일괄 등록합니다.

```typescript
// apps/[app-name]/src/mocks/index.ts
import { artiMocks } from './arti';
import { channelMocks } from './channel';

// 모든 Mock을 하나의 배열로 병합 (spread 연산자 활용)
export const features = [...artiMocks, ...channelMocks] as const;
```

**2. _app.tsx 또는 main.tsx 설정**

`_app.tsx` (Next.js) 또는 `main.tsx` (Vite)에서 `MSWProvider`를 사용하여 MSW를 초기화하고 핸들러를 등록합니다.

```typescript
// Next.js: apps/[app-name]/src/pages/_app.tsx
import { MSWProvider } from '@packages/msw-handler';
import { features } from 'mocks'; // 위에서 정의한 mocks/index.ts

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <MSWProvider 
            mocks={features} 
            defaultConfig={{ enabled: false }}
        >
            {/* 기존 Provider 구조 */}
            <QueryClientProvider client={queryClient}>
                <Component {...pageProps} />
            </QueryClientProvider>
        </MSWProvider>
    );
};
```

```typescript
// Vite: apps/[app-name]/src/main.tsx
import { MSWProvider } from '@packages/msw-handler';
import { features } from './mocks';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MSWProvider 
        mocks={features} 
        defaultConfig={{ enabled: false }}
    >
        <App />
    </MSWProvider>
);
```

### 1.3 단일 Mock Config 제어 (Dynamic Configuration)

하위 컴포넌트에서 `useMSWContext` hook을 사용하여 특정 Mock의 설정을 동적으로 변경할 수 있습니다.

```typescript
// 특정 페이지나 컴포넌트에서
import { useMSWContext } from '@packages/msw-handler';

function MyComponent() {
    const { setConfig } = useMSWContext();
    
    useEffect(() => {
        // 이 컴포넌트에서만 특정 mock 활성화
        setConfig('getMyChannels', { enabled: true });
        
        // 에러 모드로 변경하여 에러 케이스 테스트
        setConfig('getArtiList', { enabled: true, mode: 'error' });
        
        return () => {
            // 컴포넌트 언마운트 시 다시 비활성화 (선택사항)
            setConfig('getMyChannels', { enabled: false });
        };
    }, [setConfig]);
    
    return <div>...</div>;
}
```

**사용 가능한 설정 옵션:**
- `enabled`: Mock 활성화 여부 (`true` | `false`)
- `mode`: 응답 모드 (`'success'` | `'error'`)
- `withAuth`: 인증 필요 여부 (`true` | `false`)

### 1.4 권장 사항 (Recommendations)

*   **기본 비활성화 (`enabled: false`)**:
    *   안정성과 통일성을 위해 기본적으로 모든 Mock을 꺼두고(`defaultConfig={{ enabled: false }}`), 작업 중인 특정 API만 `useMSWContext`의 `setConfig`를 통해 켜는 방식을 권장합니다.
    *   이렇게 하면 실제 API와 혼동을 줄이고, 부분적인 테스트가 용이해집니다.


## 2. Mock 정의 및 추가 (Usage)

새로운 API Mock을 추가하는 방법입니다.

### 2.1 새로운 Mock 추가

1. `apps/[app-name]/src/mocks/` 아래에 적절한 파일을 생성하거나 기존 파일을 수정합니다.
2. (권장) `apps/[app-name]/src/mocks/` 디렉토리 구조는 대상 앱의 api 디렉토리 구조를 따릅니다.
3. `createMock` 유틸리티를 사용하여 Mock을 정의합니다.

- API status는 성공이지만 에러 응답이 필요한 경우, success에 에러 데이터를 정의하면 됩니다.
    ```typescript
    import { createMock } from '@packages/msw-handler';

    export const getPaymentList = createMock({
        // 1. Route 정의
        route: {
            name: 'getPaymentList', // 고유한 식별자 (필수)
            method: 'GET',
            path: '/payment/list',
        },
        // 2. Resolver (응답 데이터) 정의
        // 값 객체 또는 함수((info) => result) 형태로 정의 가능
        resolver: {
            success: {
                data: { list: [] },
                status: 200
            },
            error: {
                data: { message: '결제 내역 조회 실패' },
                status: 500
            }
        },
        // 3. 초기 Config 정의
        config: {
            enabled: false, // 기본 활성화 여부
            mode: 'success', // 초기 모드 ('success' | 'error')
            withAuth: true // 인증 필요 여부
        }
    });

    // feature 단위로 묶어서 export (as const 필수)
    export const paymentMocks = [getPaymentList] as const;
    ```

3.  `apps/[app-name]/src/mocks/index.ts`에 추가합니다.

    ```typescript
    import { paymentMocks } from './payment';

    export const features = [
        ...artiMocks,
        ...channelMocks,
        ...paymentMocks // 추가
    ] as const;
    ```

### 2.2 런타임 설정 변경 (Runtime Configuration)

하위 컴포넌트에서 `useMSWContext` hook을 통해 Mock 동작을 동적으로 제어할 수 있습니다.

```typescript
// 특정 페이지나 컴포넌트에서
import { useMSWContext } from '@packages/msw-handler';

function MyPage() {
    const { setConfig, setConfigAll } = useMSWContext();
    
    useEffect(() => {
        // 특정 API Mock 활성화
        setConfig('getMyChannels', { enabled: true });
        
        // 에러 응답 테스트를 위해 모드 변경
        setConfig('getPaymentList', { enabled: true, mode: 'error' });
        
        // 모든 Mock 일괄 설정 (주의: 전역 설정 변경)
        // setConfigAll({ enabled: true, mode: 'success', withAuth: true });
    }, [setConfig, setConfigAll]);
    
    return <div>...</div>;
}
```

> [!WARNING]
> `setConfigAll`은 모든 Mock의 설정을 변경하므로 신중하게 사용해야 합니다. 특정 Mock만 제어하려면 `setConfig`를 사용하세요.


### 2.3 Resolver 함수 사용

Resolver는 값 객체뿐만 아니라 함수 형태로도 정의할 수 있어, 요청 정보를 기반으로 동적인 응답을 생성할 수 있습니다.

```typescript
export const getPaymentList = createMock({
    route: {
        name: 'getPaymentList',
        method: 'GET',
        path: '/payment/list',
    },
    resolver: {
        success: ({ request, params }) => {
            // 요청 헤더나 쿼리 파라미터를 기반으로 동적 응답 생성
            const url = new URL(request.url);
            const page = url.searchParams.get('page') || '1';
            
            return {
                data: { 
                    list: [],
                    page: parseInt(page),
                    total: 100
                },
                status: 200
            };
        },
        error: {
            data: { message: '결제 내역 조회 실패' },
            status: 500
        }
    },
    config: {
        enabled: false,
        mode: 'success',
        withAuth: true
    }
});
```

## 3. 아키텍처 (Architecture)

`packages/msw-handler` 패키지의 내부 구조입니다.

```
packages/msw-handler/
├── src/
│   ├── utils/                    # 유틸리티 함수 모음
│   │   ├── createMock.ts         # Mock 정의 생성 헬퍼 (Type-Safe)
│   │   ├── response.ts           # 응답 생성 헬퍼 (json, error)
│   │   ├── router.ts             # URL Route 매칭 로직
│   │   └── validateAuth.ts       # 인증 검증 로직
│   ├── gateway/                  # MSW Request Handler 진입점
│   │   └── index.ts              # 모든 요청을 가로채서 Feature와 매칭 및 응답 처리
│   ├── types/                    # Mock 시스템 공통 타입
│   │   ├── index.ts              # 타입 통합 Export
│   │   └── base.ts               # 기본 타입 정의 (MockT, RouteT 등)
│   ├── Constants.ts              # 환경 변수 상수 정의
│   ├── core.ts                   # MSW 초기화/종료 및 환경 체크 로직
│   ├── config.ts                 # Mock 설정 관리 싱글톤 (MockConfig)
│   ├── index.ts                  # 패키지 진입점
│   ├── react.ts                  # React 관련 Export
│   ├── browser.ts                # Browser 환경 MSW Worker 설정
│   ├── server.ts                 # Server (Node) 환경 MSW Server 설정
│   ├── MSWProvider.tsx           # Context Provider 컴포넌트
│   └── MSWContext.tsx            # Context 및 Hook 정의
└── scripts/
    └── init-app.js               # MSW 워커 파일 자동 생성 스크립트
```

### 핵심 구성 요소

1.  **Utilities (`utils/`)**
    *   `createMock`: 각 App에서 Mock을 정의할 때 사용하는 헬퍼 함수입니다. 타입 추론과 검증을 지원합니다.
    *   `router`: 요청 URL과 등록된 Mock의 Route를 매칭하는 로직을 담당합니다.
    *   `response`: 성공/에러 응답을 생성하는 헬퍼 함수입니다.
    *   `validateAuth`: 인증 토큰 검증 로직을 담당합니다.

2.  **Centralized Gateway (`gateway/`)**
    *   모든 HTTP 요청을 가로채는 단일 핸들러입니다.
    *   등록된 `features` 리스트를 순회하며 요청 URL과 매칭되는 Mock을 찾습니다.
    *   매칭된 Mock의 설정(`enabled`, `mode`, `withAuth`)을 확인하고 적절한 응답(Success/Error)을 반환합니다.
    *   공통 응답 형태로 변환하여 다양한 앱(store, channel 등)의 API 래퍼와 호환되도록 처리합니다.

3.  **Core Logic (`core.ts`)**
    *   MSW 초기화(`initMSW`) 및 종료(`closeMSW`) 함수를 제공합니다.
    *   환경 변수 체크를 통해 서비스 레벨 환경(stage, prod, qa)에서 MSW 실행을 차단합니다.

4.  **React Integration (`MSWProvider`, `useMSWContext`)**
    *   `MSWProvider`: 애플리케이션 Root를 감싸 MSW를 초기화하고 핸들러를 등록합니다. **Initialization Gate** 역할을 하여 Worker가 준비되기 전 API 요청이 발생하는 Race Condition을 방지합니다.
    *   `useMSWContext`: 하위 컴포넌트에서 동적으로 Mock 설정을 제어할 수 있는 Hook입니다.

5.  **Runtime Configuration (`config.ts`)**
    *   애플리케이션 실행 중에 Mock의 동작(활성화 여부, 성공/실패 모드 등)을 동적으로 변경할 수 있는 **MockConfig** 싱글톤을 제공합니다.

6.  **Initialization Script (`scripts/init-app.js`)**
    *   각 앱의 `public` 디렉토리에 `mockServiceWorker.js` 파일을 자동으로 생성하는 스크립트입니다.
    *   패키지 빌드도 함께 실행하여 최신 코드가 반영되도록 합니다.

## 4. 주의사항 (Troubleshooting)

### 4.1 Path 매칭 규칙 (Pathname Matching)
`msw-handler`의 라우터는 요청 URL의 **Pathname**만을 기준으로 매칭합니다. Querystring 파라미터는 무시됩니다.
- ❌ **안됨:** `path: '/home/banner?type=hero'` (Querystring 포함 시 매칭 실패)
- ✅ **됨:** `path: '/home/banner'` (순수 Pathname만 입력)

### 4.2 Wildcard 사용 주의
Mock 정의 시 `path`에 Wildcard(`*`)를 사용할 때 주의가 필요합니다. 내부 라우터가 `*`를 포함한 경로를 정규표현식으로 변환할 때, 잘못된 위치의 `*`는 SyntaxError를 유발할 수 있습니다.
- ❌ **안됨:** `path: '*/home/banner'` (regex 변환 시 `^*/...` 형태가 되어 SyntaxError 발생)
- ✅ **됨:** `path: '/home/banner'` (가능하면 정확한 경로 사용 권장)