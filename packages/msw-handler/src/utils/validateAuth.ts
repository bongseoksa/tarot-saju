/**
 * 공통 미들웨어
 */
import { json } from './response';

/**
 * 계정 인증 미들웨어
 * Authorization 요청헤더가 필요한 경우 사용
 * @param request - MSW request 객체
 * @returns boolean - 인증 성공 여부
 */
export function validateAuth(request: Request): boolean {
    const authorization = request.headers.get('Authorization');
    return !(!authorization || authorization === 'Bearer null');
}

/**
 * 인증 실패 응답 반환
 */
export function authFailResponse() {
    return json({ success: false, data: { message: 'Authorization 요청헤더를 확인해주세요.' } }, 401);
}
