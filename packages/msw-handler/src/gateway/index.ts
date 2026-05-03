import { http, passthrough } from 'msw';

import { mockConfigInstance } from '../config';
import { error, json } from '../utils/response';
import { matchRoute } from '../utils/router';
import { authFailResponse, validateAuth } from '../utils/validateAuth';

/**
 * MSW Gateway Handler
 * 모든 요청을 가로채서 Mocking 여부를 판단하고 응답을 반환
 */
export const gatewayHandler = http.all('*', async ({ request }) => {
    /* ----- API 구분 ----- */
    // normalize url string
    const urlString = String(request.url);

    // 1. 모든 feature의 route를 순회하며 매칭 확인
    let matchedFeature: (typeof mockConfigInstance.features)[number] | null = null;
    let matchedParams: Record<string, string> | undefined;

    for (const feature of mockConfigInstance.features) {
        const route = feature.route;
        const result = matchRoute(route, urlString, request.method);
        if (result) {
            matchedFeature = feature;
            matchedParams = result.params;
            break;
        }
    }

    if (!matchedFeature) return passthrough(); // 매칭되는 Mock 정의가 없으면 패스

    const name = matchedFeature.route.name;

    /* ----- Config 설정 확인 ----- */
    // Get live config from singleton
    const entry = mockConfigInstance.getConfig(name as string);

    if (!entry || !entry.enabled) return passthrough(); // Mock이 비활성화 상태면 패스

    /* ----- Config - withAuth 인증 검증 ----- */
    // Check auth if withAuth is true
    if (entry.withAuth && !validateAuth(request)) {
        console.warn(`[MSW Gateway] Auth validation failed for ${name}`);
        throw authFailResponse();
    }

    /* ----- 결과 반환 ----- */
    const mode = entry.mode; // 'success' or 'error'
    console.log(`[MSW Gateway] Handling ${name} in ${mode} mode`);

    const rawResolver = matchedFeature.resolver[mode];

    // 함수 형태인 경우 실행하여 결과 추출, 아니면 그대로 사용
    // async 함수(request body 읽기 등)를 지원하기 위해 Promise 여부 확인 후 await
    const rawResult = typeof rawResolver === 'function' ? rawResolver({ request, params: matchedParams }) : rawResolver;
    const mockResponse = rawResult instanceof Promise ? await rawResult : rawResult;

    try {
        // NOTE:
        // - apps/store: `{ code, data }` 형태를 기대 (axios wrapper가 code로 성공/실패 판단)
        // - apps/channel: `{ success: true|... , data }` 형태를 기대 (fetch wrapper가 success로 판단)
        // 그래서 두 앱 모두 통과하도록 공통 응답 형태로 변환합니다.

        if (mode === 'error') {
            const payload = (mockResponse?.data ?? {}) as any;
            const code = typeof payload.code === 'number' ? payload.code : (mockResponse?.status ?? 500);
            const message = payload.message ?? payload.errorType ?? 'Mock error';
            const errorType = payload.errorType ?? 'MOCK_ERROR';
            const errorData = payload.errorData ?? payload;

            const status = mockResponse?.status ?? 500;
            return json(
                {
                    success: false,
                    code,
                    message,
                    errorType,
                    errorData
                },
                status
            );
        }

        // mode === 'success'
        const status = mockResponse?.status ?? 200;
        return json(
            {
                success: true,
                code: 200,
                data: mockResponse.data
            },
            status
        );
    } catch (_) {
        throw error(mockResponse.data, mockResponse.status);
    }
});
