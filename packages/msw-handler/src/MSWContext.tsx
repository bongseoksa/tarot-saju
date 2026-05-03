import { createContext, useContext } from 'react';
import type { ConfigEntry } from './types';

/**
 * MSWContext 값 타입 정의
 */
export interface MSWContextValue {
    initialized: boolean;
    setConfig: (api: string, config: Partial<ConfigEntry>) => void;
    setConfigAll: (config: Partial<ConfigEntry>) => void;
}

/**
 * MSW Context 생성
 */
export const MSWContext = createContext<MSWContextValue | null>(null);

/**
 * MSWContext를 사용하는 Hook
 * Provider 외부에서 사용 시 에러 발생
 */
export function useMSWContext(): MSWContextValue {
    const context = useContext(MSWContext);
    if (!context) {
        throw new Error('useMSWContext must be used within MSWProvider');
    }
    return context;
}
