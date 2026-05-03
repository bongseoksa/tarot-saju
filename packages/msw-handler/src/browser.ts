/**
 * 브라우저 테스트 환경
 */
import { setupWorker } from 'msw/browser';

import { gatewayHandler } from './gateway';

// console.log('[MSW Browser] Handlers:', gatewayHandler);

export const worker = setupWorker(gatewayHandler);
