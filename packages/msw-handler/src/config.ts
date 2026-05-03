import { ConfigEntry, ModeT, RouteT } from './types';
import { MockDefinition } from './utils/createMock';

/**
 * Mock 설정 관리 클래스
 */
export class MockConfig {
    public features: ReadonlyArray<MockDefinition<RouteT['method'], string, string>> = []; // 각 앱의 mock config 리스트

    private static instance: MockConfig;
    private config: Record<string, ConfigEntry> = {};

    private constructor() {}

    public static getInstance(): MockConfig {
        if (!MockConfig.instance) {
            MockConfig.instance = new MockConfig();
        }
        return MockConfig.instance;
    }

    public setMocks(mocks: ReadonlyArray<MockDefinition<RouteT['method'], string, string>>) {
        this.features = mocks;
        this.config = Object.fromEntries(mocks.map((mock) => [mock.route.name, mock.config]));
    }

    /**
     * config의 모든 enabled 값을 일괄 변경
     * @param options
     */
    public setConfigAll(
        options?: Partial<{
            enabled: boolean;
            mode: ModeT;
            withAuth: boolean;
        }>
    ) {
        for (const key of Object.keys(this.config)) {
            const current = this.config[key];
            if (options?.enabled !== undefined) current.enabled = options.enabled;
            if (options?.mode !== undefined) current.mode = options.mode;
            if (options?.withAuth !== undefined) current.withAuth = options.withAuth;
        }
    }

    /**
     * 단일 mock config 설정
     * @param name - Mock 이름
     * @param options
     */
    public setConfig<Name extends keyof typeof this.config>(
        name: Name,
        options?: Partial<{
            enabled: boolean;
            mode: ModeT;
            withAuth: boolean;
        }>
    ) {
        const current = this.config[name];

        if (current) {
            if (options?.enabled !== undefined) current.enabled = options.enabled;
            if (options?.mode !== undefined) current.mode = options.mode;
            if (options?.withAuth !== undefined) current.withAuth = options.withAuth;

            // console.log(`[MockConfig] Updated ${String(name)}:`, options);
        } else {
            console.warn(`[MockConfig] Config not found for ${String(name)}`);
        }
    }

    /**
     * Mock Config 조회
     * @param name
     * @returns
     */
    public getConfig<Name extends keyof typeof this.config>(name: Name): ConfigEntry | null {
        return this.config[name] || null;
    }
}

// Export singleton instance
export const mockConfigInstance = MockConfig.getInstance();
