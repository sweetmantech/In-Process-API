import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import createPrivyEmbeddedWallet from '@/lib/privy/createPrivyEmbeddedWallet';

describe('createPrivyEmbeddedWallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PRIVY_APP_ID', 'test-app-id');
    vi.stubEnv('PRIVY_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls Privy create wallet endpoint with user owner', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ address: '0xABC' }),
    });

    await createPrivyEmbeddedWallet('did:privy:abc');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.privy.io/v1/wallets',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chain_type: 'ethereum',
          owner: { user_id: 'did:privy:abc' },
        }),
        headers: expect.objectContaining({
          'privy-app-id': 'test-app-id',
          Authorization: `Basic ${Buffer.from('test-app-id:test-api-key').toString('base64')}`,
        }),
      })
    );
  });

  it('returns lowercase wallet address on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ address: '0xABC' }),
    });

    const address = await createPrivyEmbeddedWallet('did:privy:abc');
    expect(address).toBe('0xabc');
  });

  it('throws with Privy error field when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Invalid parameter(s) passed: wallets',
        code: 'invalid_data',
      }),
    });

    await expect(createPrivyEmbeddedWallet('did:privy:abc')).rejects.toThrow(
      'Invalid parameter(s) passed: wallets'
    );
  });

  it('throws when response has no address', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    await expect(createPrivyEmbeddedWallet('did:privy:abc')).rejects.toThrow(
      'Privy wallet was not created'
    );
  });
});
