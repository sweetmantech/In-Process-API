import {
  createWayfinderClient,
  HashVerificationStrategy,
} from '@ar.io/wayfinder-core';

const wayfinderClient = createWayfinderClient({
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
  verificationSettings: {
    enabled: true,
    strategy: new HashVerificationStrategy({
      trustedGateways: [
        new URL('https://arweave.net'),
        new URL('https://permagate.io'),
        new URL('https://ar-io.net'),
      ],
    }),
  },
});

export const getArweaveGateway = async (): Promise<URL> => {
  const { strategy } = wayfinderClient.routingSettings;
  if (!strategy) throw new Error('Wayfinder routing strategy not configured');
  return strategy.selectGateway({});
};

export default wayfinderClient;
