import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/consts', () => ({
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('authenticatePrivyPasswordless', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PRIVY_APP_ID', 'test-privy-app-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls Privy authenticate endpoint with correct params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'privy-token-abc',
        user: { id: 'did:privy:abc', linked_accounts: [] },
      }),
    });

    await authenticatePrivyPasswordless('user@example.com', '123456');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://auth.privy.io/api/v1/passwordless/authenticate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          code: '123456',
          mode: 'login-or-sign-up',
        }),
        headers: expect.objectContaining({
          'privy-app-id': 'test-privy-app-id',
          'Content-Type': 'application/json',
          origin: 'https://inprocess.world',
        }),
      })
    );
  });

  it('returns authenticate response on success', async () => {
    const payload = {
      token: 'privy-token-abc',
      refresh_token: 'refresh-xyz',
      user: { id: 'did:privy:abc', linked_accounts: [] },
      is_new_user: false,
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => payload,
    });

    const result = await authenticatePrivyPasswordless(
      'user@example.com',
      '123456'
    );

    expect(result).toEqual(payload);
  });

  it('throws with Privy error message when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid code' }),
    });

    await expect(
      authenticatePrivyPasswordless('user@example.com', '000000')
    ).rejects.toThrow('Invalid code');
  });

  it('throws with Privy error field when message is absent', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Invalid email and code combination',
        code: 'invalid_credentials',
      }),
    });

    await expect(
      authenticatePrivyPasswordless('user@example.com', '000000')
    ).rejects.toThrow('Invalid email and code combination');
  });

  it('throws default message when Privy error response has no message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      authenticatePrivyPasswordless('user@example.com', '000000')
    ).rejects.toThrow('Failed to authenticate');
  });

  it('throws when Privy error response body cannot be parsed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('parse error');
      },
    });

    await expect(
      authenticatePrivyPasswordless('user@example.com', '000000')
    ).rejects.toThrow('Failed to authenticate');
  });
});
