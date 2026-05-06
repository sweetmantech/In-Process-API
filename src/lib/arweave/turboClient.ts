import { TurboFactory } from '@ardrive/turbo-sdk/node';
import { ARWEAVE_KEY } from '@/lib/consts';

const turboClient = TurboFactory.authenticated({ privateKey: ARWEAVE_KEY });

export const unauthTurboClient = TurboFactory.unauthenticated({
  token: 'base-usdc',
});

export default turboClient;
