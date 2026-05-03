import { mockConfigInstance } from './config';
import type { ConfigEntry, RouteT } from './types';
import type { MockDefinition } from './utils/createMock';
import { createMock } from './utils/createMock';
import { validateEnvironment } from './utils/validateEnvironment';

/**
 * MSW 실행 초기화 함수 (브라우저 only)
 */
async function initMSW() {
    // stage, prod 환경에서 MSW 차단
    if (!validateEnvironment()) {
        throw new Error('MSW is not allowed in current environment.');
    }

    if (typeof window === 'undefined') {
        // Node SSR 환경에서의 MSW는 필요 시 주석 해제해서 사용하세요.
        // const { server } = await import('./server');
        // server.listen();
        return;
    }

    try {
        const { worker } = await import('./browser');
        await worker.start({
            onUnhandledRequest: 'warn'
        });
    } catch (error) {
        return error;
    }
}

/**
 * MSW 종료 함수 (브라우저 only)
 */
async function closeMSW() {
    if (!validateEnvironment()) return;

    if (typeof window === 'undefined') {
        // const { server } = await import('./server');
        // server.close();
        return;
    }

    try {
        const { worker } = await import('./browser');
        await worker.stop();
    } catch (_) {
        // noop
    }
}

/**
 * React 훅 없이도 Mock 목록/설정을 제어할 수 있도록 core API 제공
 */
const setMocks = (mocks: ReadonlyArray<MockDefinition<RouteT['method'], string, string>>) => {
    mockConfigInstance.setMocks(mocks);
};

const setConfigAll = (config: Partial<ConfigEntry>) => {
    mockConfigInstance.setConfigAll(config);
};

const setConfig = (api: string, config: Partial<ConfigEntry>) => {
    mockConfigInstance.setConfig(api as any, config);
};

export { initMSW, closeMSW, createMock, setMocks, setConfigAll, setConfig };
