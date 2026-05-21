import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/privy/authenticatePrivyPasswordless', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/privy/ensurePrivySocialWallet', () => ({
  default: vi.fn(),
}));

import authenticatePrivyPasswordless from '@/lib/privy/authenticatePrivyPasswordless';
import ensurePrivySocialWallet from '@/lib/privy/ensurePrivySocialWallet';
import loginWithCodeHandler from '@/lib/oauth/loginWithCodeHandler';

describe('loginWithCodeHandler', () => {
  const authResult = {
    token: 'privy-token-abc',
    user: { id: 'did:privy:abc', linked_accounts: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authenticatePrivyPasswordless).mockResolvedValue(authResult);
    vi.mocked(ensurePrivySocialWallet).mockResolvedValue('0xsocial');
  });

  it('returns token and social_wallet on success', async () => {
    const res = await loginWithCodeHandler('user@example.com', '123456');
    const json = await res.json();

    expect(res).toBeInstanceOf(NextResponse);
    expect(json).toEqual({
      token: 'privy-token-abc',
      social_wallet: '0xsocial',
    });
    expect(authenticatePrivyPasswordless).toHaveBeenCalledWith(
      'user@example.com',
      '123456'
    );
    expect(ensurePrivySocialWallet).toHaveBeenCalledWith(authResult);
  });

  it('propagates authenticate errors', async () => {
    vi.mocked(authenticatePrivyPasswordless).mockRejectedValue(
      new Error('Invalid code')
    );

    await expect(
      loginWithCodeHandler('user@example.com', '000000')
    ).rejects.toThrow('Invalid code');
  });

  it('propagates ensurePrivySocialWallet errors', async () => {
    vi.mocked(ensurePrivySocialWallet).mockRejectedValue(
      new Error('Privy user id missing')
    );

    await expect(
      loginWithCodeHandler('user@example.com', '123456')
    ).rejects.toThrow('Privy user id missing');
  });
});
