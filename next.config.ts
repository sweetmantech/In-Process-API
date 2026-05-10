import type { NextConfig } from 'next';
import { withWorkflow } from 'workflow/next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@opentelemetry/resources',
    '@opentelemetry/context-zone',
    '@opentelemetry/exporter-trace-otlp-http',
    '@ar.io/wayfinder-core',
  ],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-api-key, x-recaptcha-token',
          },
        ],
      },
    ];
  },
};

export default withWorkflow(nextConfig);
