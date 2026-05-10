/**
 * Node 테스트 환경
 */
import { setupServer } from 'msw/node';

import { gatewayHandler } from './gateway';
import { interpretHandler } from './gateway/interpret';

export const server = setupServer(interpretHandler, gatewayHandler);
