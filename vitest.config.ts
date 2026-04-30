import { defineConfig } from 'vitest/config';
import path from 'path';

const nextReact = path.resolve(
  __dirname,
  './node_modules/next/dist/compiled/react'
);

export default defineConfig({
  test: {
    globals: true,
    env: {
      PRIVY_PROJECT_SECRET: 'test-secret',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: nextReact,
      'react/jsx-dev-runtime': path.join(nextReact, 'jsx-dev-runtime.js'),
      'react/jsx-runtime': path.join(nextReact, 'jsx-runtime.js'),
    },
  },
});
