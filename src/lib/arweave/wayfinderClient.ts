import {
  createWayfinderClient,
  HashVerificationStrategy,
  SimpleCacheRoutingStrategy,
  FastestPingRoutingStrategy,
  StaticGatewaysProvider,
} from '@ar.io/wayfinder-core';
import gateways from './gateways';

// Curated list of reliable, high-quality Arweave gateways
const gatewaysProvider = new StaticGatewaysProvider({
  gateways,
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
      trustedGateways: gateways.map((g) => new URL(g)),
    }),
  },
});

export default wayfinderClient;
