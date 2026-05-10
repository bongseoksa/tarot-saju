/**
 * 브라우저 테스트 환경
 */
import { setupWorker } from 'msw/browser';

import { gatewayHandler } from './gateway';
import { interpretHandler } from './gateway/interpret';

export const worker = setupWorker(interpretHandler, gatewayHandler);
