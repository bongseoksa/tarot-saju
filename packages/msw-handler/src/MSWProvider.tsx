import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { closeMSW, initMSW } from './core';
import { mockConfigInstance } from './config';
import { MSWContext } from './MSWContext';
import type { ConfigEntry, RouteT } from './types';
import type { MockDefinition } from './utils/createMock';

/**
 * MSWProvider Props 타입
 */
export interface MSWProviderProps {
    children: ReactNode;
    mocks: ReadonlyArray<MockDefinition<RouteT['method'], string, string>>;
    defaultConfig?: Partial<ConfigEntry>;
}

/**
 * MSW Provider 컴포넌트
 * 앱 최상위에서 MSW를 초기화하고 설정을 관리합니다.
 */
export function MSWProvider({ children, mocks, defaultConfig }: MSWProviderProps) {
    const [initialized, setInitialized] = useState(false);

    /**
     * 특정 API Mock의 설정 변경
     */
    const setConfig = (api: string, config: Partial<ConfigEntry>) => {
        mockConfigInstance.setConfig(api as any, config);
    };

    /**
     * 모든 API Mock의 설정 일괄 변경
     */
    const setConfigAll = (config: Partial<ConfigEntry>) => {
        mockConfigInstance.setConfigAll(config);
    };

    // 1. MSW 초기화 및 종료 (Lifecycle)
    useEffect(() => {
        const initialize = async () => {
            const timeout = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('[MSWProvider] worker.start() timeout (3000ms) — 렌더링 강제 진행')), 3000)
            );
            try {
                await Promise.race([initMSW(), timeout]);
                console.log('[MSWProvider] MSW initialized successfully');
            } catch (error) {
                // MSW가 비활성화되어 있거나, 프로덕션 환경이거나, worker.start()가 hang한 경우 정상 진행
                console.warn('[MSWProvider] MSW initialization skipped:', error);
            } finally {
                setInitialized(true);
            }
        };

        initialize();

        return () => {
            closeMSW();
        };
    }, []);

    // 2. 설정 및 Mock 데이터 업데이트
    useEffect(() => {
        if (!initialized) return;

        // Mock 데이터 등록
        mockConfigInstance.setMocks(mocks);

        // 기본 설정 적용
        if (defaultConfig) {
            mockConfigInstance.setConfigAll(defaultConfig);
        }
    }, [initialized, mocks, defaultConfig]);

    // MSW 초기화 완료 전까지 렌더링 차단
    if (!initialized) {
        return null;
    }

    return (
        <MSWContext.Provider value={{ initialized, setConfig, setConfigAll }}>
            {children}
        </MSWContext.Provider>
    );
}
