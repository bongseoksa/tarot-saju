import { HttpResponse } from 'msw';

/**
 * 성공 JSON 응답 생성
 * @param data 응답 데이터
 * @param status HTTP 상태 코드 (기본 200)
 * @returns HttpResponse
 */
export const json = (data: any, status = 200) => HttpResponse.json(data, { status });

/**
 * 에러 응답 생성
 * @param data 에러 데이터
 * @param status HTTP 상태 코드 (기본 500)
 * @returns HttpResponse
 */
export const error = (data: any, status = 500) => HttpResponse.json(data, { status });
