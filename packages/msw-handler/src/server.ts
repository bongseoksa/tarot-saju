/**
 * Node 테스트 환경
 */
import { setupServer } from 'msw/node';

import { gatewayHandler } from './gateway';

export const server = setupServer(gatewayHandler);
