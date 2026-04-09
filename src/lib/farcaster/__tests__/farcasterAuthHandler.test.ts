import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/farcaster/verifyFarcasterAuth', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/jwt/signJwt', () => ({
  signJwt: vi.fn(),
}));

import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { signJwt } from '@/lib/jwt/signJwt';
import farcasterAuthHandler from '@/lib/farcaster/farcasterAuthHandler';

const message = 'siwe message';
const signature = '0xabc';
const address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const token = 'signed.jwt.token';

describe('farcasterAuthHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FARCASTER_JWT_SECRET = 'test-secret';
  });

  it('returns a token on valid message and signature', async () => {
    vi.mocked(verifyFarcasterAuth).mockResolvedValue(address);
    vi.mocked(signJwt).mockReturnValue(token);

    const result = await farcasterAuthHandler(message, signature);

    expect(result).toEqual({ token });
  });

  it('calls verifyFarcasterAuth with message and signature', async () => {
    vi.mocked(verifyFarcasterAuth).mockResolvedValue(address);
    vi.mocked(signJwt).mockReturnValue(token);

    await farcasterAuthHandler(message, signature);

    expect(verifyFarcasterAuth).toHaveBeenCalledWith(message, signature);
  });

  it('calls signJwt with message, signature, and FARCASTER_JWT_SECRET', async () => {
    vi.mocked(verifyFarcasterAuth).mockResolvedValue(address);
    vi.mocked(signJwt).mockReturnValue(token);

    await farcasterAuthHandler(message, signature);

    expect(signJwt).toHaveBeenCalledWith({ message, signature }, 'test-secret');
  });

  it('throws when verifyFarcasterAuth rejects', async () => {
    vi.mocked(verifyFarcasterAuth).mockRejectedValue(
      new Error('Invalid signature')
    );

    await expect(farcasterAuthHandler(message, signature)).rejects.toThrow(
      'Invalid signature'
    );
  });

  it('does not call signJwt when verification fails', async () => {
    vi.mocked(verifyFarcasterAuth).mockRejectedValue(
      new Error('Invalid chainId')
    );

    await expect(farcasterAuthHandler(message, signature)).rejects.toThrow();
    expect(signJwt).not.toHaveBeenCalled();
  });
});
