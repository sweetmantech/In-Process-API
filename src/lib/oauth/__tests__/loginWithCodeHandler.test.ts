import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/consts', () => ({
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import loginWithCodeHandler from '@/lib/oauth/loginWithCodeHandler';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('loginWithCodeHandler', () => {
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
      json: async () => ({ token: 'privy-token-abc' }),
    });

    await loginWithCodeHandler('user@example.com', '123456');

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

  it('returns only token on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'privy-token-abc',
        refresh_token: 'refresh-xyz',
        user: { id: 'did:privy:abc', linked_accounts: [] },
        is_new_user: false,
      }),
    });

    const res = await loginWithCodeHandler('user@example.com', '123456');
    const json = await res.json();

    expect(res).toBeInstanceOf(NextResponse);
    expect(json).toEqual({ token: 'privy-token-abc' });
  });

  it('throws with Privy error message when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid code' }),
    });

    await expect(
      loginWithCodeHandler('user@example.com', '000000')
    ).rejects.toThrow('Invalid code');
  });

  it('throws default message when Privy error response has no message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      loginWithCodeHandler('user@example.com', '000000')
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
      loginWithCodeHandler('user@example.com', '000000')
    ).rejects.toThrow('Failed to authenticate');
  });
});
