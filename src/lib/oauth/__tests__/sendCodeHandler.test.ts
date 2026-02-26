import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/consts', () => ({
  SITE_ORIGINAL_URL: 'https://inprocess.world',
}));

import sendCodeHandler from '@/lib/oauth/sendCodeHandler';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('sendCodeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('PRIVY_APP_ID', 'test-privy-app-id');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls Privy init endpoint with correct params', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    await sendCodeHandler('user@example.com');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://auth.privy.io/api/v1/passwordless/init',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' }),
        headers: expect.objectContaining({
          'privy-app-id': 'test-privy-app-id',
          'Content-Type': 'application/json',
          origin: 'https://inprocess.world',
        }),
      })
    );
  });

  it('returns { success: true } on success', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const res = await sendCodeHandler('user@example.com');
    const json = await res.json();

    expect(res).toBeInstanceOf(NextResponse);
    expect(json).toEqual({ success: true });
  });

  it('throws with Privy error message when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Email not found' }),
    });

    await expect(sendCodeHandler('user@example.com')).rejects.toThrow(
      'Email not found'
    );
  });

  it('throws default message when Privy error response has no message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    await expect(sendCodeHandler('user@example.com')).rejects.toThrow(
      'Failed to send verification code'
    );
  });

  it('throws default message when Privy error response body cannot be parsed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('parse error');
      },
    });

    await expect(sendCodeHandler('user@example.com')).rejects.toThrow(
      'Failed to send verification code'
    );
  });
});
