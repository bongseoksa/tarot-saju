/**
 * Next.js에서 지원하는 환경 변수 직접 접근 맵
 * Next.js는 동적 키 접근(process.env[key])을 지원하지 않으므로
 * 빌드 타임에 치환될 수 있도록 직접 접근해야 합니다.
 */
const NEXT_ENV_MAP: Record<string, string | undefined> = {
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
};

/**
 * 여러 프레임워크에서 동작하도록 환경 변수를 안전하게 읽는 헬퍼 함수
 */
export function getEnvVar(key: string): string | undefined {
  // Next.js 환경 - 직접 접근 맵 사용
  if (key in NEXT_ENV_MAP) {
    const value = NEXT_ENV_MAP[key];
    if (value !== undefined) return value;
  }

  // Vite/Astro 환경 (import.meta.env)
  if (typeof import.meta !== 'undefined') {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    if (metaEnv) {
      const value = metaEnv[key];
      if (value !== undefined) return value;
    }
  }

  return undefined;
}

export const validateENV = ['local', 'dev'];