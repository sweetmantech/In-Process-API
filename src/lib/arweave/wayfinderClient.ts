import {
  createWayfinderClient,
  HashVerificationStrategy,
  PreferredWithFallbackRoutingStrategy,
  RoundRobinRoutingStrategy,
  StaticGatewaysProvider,
} from '@ar.io/wayfinder-core';
import gateways from './gateways';

const wayfinderClient = createWayfinderClient({
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
  routingSettings: {
    // Prefer arweave.net (canonical, proven to serve data). Fall back to
    // round-robin across the remaining gateways if arweave.net is unavailable.
    // FastestPingRoutingStrategy was removed: a gateway that responds to pings
    // is not guaranteed to serve TX data, causing silent fetch failures.
    strategy: new PreferredWithFallbackRoutingStrategy({
      preferredGateway: 'https://turbo-gateway.com',
      fallbackStrategy: new RoundRobinRoutingStrategy({
        gatewaysProvider: new StaticGatewaysProvider({ gateways }),
      }),
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
