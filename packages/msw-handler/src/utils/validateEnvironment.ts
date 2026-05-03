
import { getEnvVar, validateENV } from '../Constants'

/**
 * 현재 환경이 서비스 레벨이 아닌지 체크.
 * 각 앱마다 다른 환경변수 이름을 사용하므로 모두 체크합니다.
 *
 * 지원하는 환경변수:
 * - NEXT_PUBLIC_ENV (Next.js 앱: store, channel)
 * - VITE_APP_ENV (Vite 앱: account, partner)
 * @returns prod 또는 stage 또는 qa 환경이면 true
 */
export function validateEnvironment(): boolean {
    const nextEnv = getEnvVar('NEXT_PUBLIC_ENV') ?? '';
    const viteEnv = getEnvVar('VITE_APP_ENV') ?? '';
  
    return validateENV.includes(nextEnv) || validateENV.includes(viteEnv)
  }