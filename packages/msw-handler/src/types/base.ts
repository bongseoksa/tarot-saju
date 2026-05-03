/**
 * 기본 Mock 타입 정의
 * 순환 참조 방지를 위해 기본 타입만 분리
 */

/**
 * 단일 Mock 응답 데이터 구조
 */
export type MockT = {
    data: any;
    status?: number;
    success?: boolean;
};

/**
 * Resolver의 Success/Error Pair
 * 값 객체 또는 함수 형태 허용
 */
export type ResolverMockT = {
    success: MockT | ((info: any) => MockT | Promise<MockT>);
    error: MockT | ((info: any) => MockT | Promise<MockT>);
};

/**
 * Route 정의 (Group 제거됨)
 */
export type RouteT = {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    name: string; // Unique Identifier
};

/**
 * Mock 설정 모드
 */
export type ModeT = keyof ResolverMockT; // 'success' | 'error'

/**
 * 개별 Mock 설정
 */
export type ConfigEntry = {
    enabled: boolean;
    mode: ModeT;
    withAuth?: boolean;
};
