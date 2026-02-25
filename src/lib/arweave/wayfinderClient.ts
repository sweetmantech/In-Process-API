import {
  createWayfinderClient,
  HashVerificationStrategy,
  SimpleCacheRoutingStrategy,
  FastestPingRoutingStrategy,
  StaticGatewaysProvider,
} from '@ar.io/wayfinder-core';

// Curated list of reliable, high-quality Arweave gateways
const gatewaysProvider = new StaticGatewaysProvider({
  gateways: [
    'https://arweave.net',
    'https://permagate.io',
    'https://ar-io.net',
    'https://g8way.io',
  ],
});

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
        timeoutMs: 5000,
        gatewaysProvider,
      }),
      ttlSeconds: 300,
    }),
  },
  verificationSettings: {
    enabled: true,
    strict: false, // non-blocking: log verification failures but don't reject the response
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
