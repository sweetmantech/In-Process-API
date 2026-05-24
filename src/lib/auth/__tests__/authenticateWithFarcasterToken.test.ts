import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/jwt/verifyJwt', () => ({
  verifyJwt: vi.fn(),
}));

vi.mock('@/lib/farcaster/verifyFarcasterAuth', () => ({
  default: vi.fn(),
}));

import { verifyJwt } from '@/lib/jwt/verifyJwt';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { AuthErrorMessages } from '@/errors';
import { AuthMethod } from '@/types/auth';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';

const VALID_PAYLOAD = { message: 'sign this', signature: '0xsig' };
const ARTIST_ADDRESS = '0xartist';

describe('authenticateWithFarcasterToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FARCASTER_JWT_SECRET = 'test-secret';
  });

  it('returns artistAddress, farcasterUsername and Farcaster authMethod on success', async () => {
    vi.mocked(verifyJwt).mockReturnValue(VALID_PAYLOAD);
    vi.mocked(verifyFarcasterAuth).mockResolvedValue({
      verifiedAddress: ARTIST_ADDRESS,
      farcasterUsername: 'testuser',
    });

    const result = await authenticateWithFarcasterToken('valid-token');

    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      farcasterUsername: 'testuser',
      authMethod: AuthMethod.Farcaster,
    });
  });

  it('throws when FARCASTER_JWT_SECRET is not set', async () => {
    delete process.env.FARCASTER_JWT_SECRET;

    await expect(authenticateWithFarcasterToken('token')).rejects.toThrow(
      'FARCASTER_JWT_SECRET is not configured'
    );
  });

  it('throws INVALID_AUTH_TOKEN when JWT payload fails schema validation', async () => {
    vi.mocked(verifyJwt).mockReturnValue({ message: '', signature: '' });

    await expect(authenticateWithFarcasterToken('token')).rejects.toThrow(
      AuthErrorMessages.INVALID_AUTH_TOKEN
    );
  });

  it('throws INVALID_AUTH_TOKEN when verifyJwt throws', async () => {
    vi.mocked(verifyJwt).mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    await expect(authenticateWithFarcasterToken('bad-token')).rejects.toThrow(
      AuthErrorMessages.INVALID_AUTH_TOKEN
    );
  });

  it('throws when verifyFarcasterAuth rejects', async () => {
    vi.mocked(verifyJwt).mockReturnValue(VALID_PAYLOAD);
    vi.mocked(verifyFarcasterAuth).mockRejectedValue(
      new Error('Invalid signature')
    );

    await expect(authenticateWithFarcasterToken('token')).rejects.toThrow(
      'Invalid signature'
    );
  });
});
