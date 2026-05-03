import { ConfigEntry, ResolverMockT, RouteT } from '../types';

/**
 * Mock 정의 인터페이스
 */
export interface MockDefinition<Method extends string, Path extends string, Name extends string> {
    route: {
        method: Method;
        path: Path;
        name: Name;
    };
    resolver: ResolverMockT;
    config: ConfigEntry;
}

/**
 * Type-safe Mock 생성을 위한 유틸리티 함수
 * @param mock - Mock 정의 객체
 * @returns Type check가 완료된 Mock 객체 (as const 효과 포함)
 */
export const createMock = <Method extends RouteT['method'], Path extends string, Name extends string>(mock: MockDefinition<Method, Path, Name>) =>
    mock;
