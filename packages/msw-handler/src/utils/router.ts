import { RouteT } from '../types';

/**
 * 요청 URL과 HTTP method를 기준으로 특정 Route와 매칭되는지 확인
 * @param route - 확인할 대상 Route
 * @param url - 실제 요청 URL
 * @param method - 실제 요청 Method
 * @returns 매칭 성공 시 params 객체 반환, 실패 시 null
 */
export const matchRoute = (route: RouteT, url: string, method: string) => {
    if (route.method !== method) return null;

    const pathname = new URL(url).pathname;

    // :param 추출 → ([^/]+)로 변환
    const regex = new RegExp(`^${route.path.replace(/:[^/]+/g, '([^/]+)')}$`);
    const match = pathname.match(regex);
    if (match) {
        // 파라미터 이름 추출
        const keys = (route.path.match(/:[^/]+/g) || []).map((k) => k.slice(1));
        const params: Record<string, string> = {};
        keys.forEach((key, idx) => (params[key] = match[idx + 1])); // match[0]은 전체, match[1]부터 capture group
        return { params };
    }

    return null;
};
