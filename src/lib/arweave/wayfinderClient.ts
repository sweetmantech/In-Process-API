import {
  createWayfinderClient,
  HashVerificationStrategy,
  SimpleCacheRoutingStrategy,
  FastestPingRoutingStrategy,
} from '@ar.io/wayfinder-core';

const wayfinderClient = createWayfinderClient({
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
  routingSettings: {
    strategy: new SimpleCacheRoutingStrategy({
      routingStrategy: new FastestPingRoutingStrategy({
        timeoutMs: 500,
      }),
      ttlSeconds: 60,
    }),
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
