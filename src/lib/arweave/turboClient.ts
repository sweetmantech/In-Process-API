import { TurboFactory } from '@ardrive/turbo-sdk/node';
import { ARWEAVE_KEY } from '@/lib/consts';

const turboClient = TurboFactory.authenticated({ privateKey: ARWEAVE_KEY });

export default turboClient;
