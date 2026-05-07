import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

vi.mock('@/lib/auth/authenticateWithFarcasterToken', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/auth/authenticateWithBearerToken', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/auth/authenticateWithApiKey', () => ({
  default: vi.fn(),
}));

import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import { AuthErrorMessages, AuthErrorTypes } from '@/errors';
import { AuthMethod } from '@/types/auth';
import authenticate from '@/lib/auth/authenticate';

const ARTIST_ADDRESS = '0xartist';

describe('authenticate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to authenticateWithFarcasterToken when farcasterToken is provided', async () => {
    vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.FARCaster,
    });

    const result = await authenticate({
      farcasterToken: 'fc-token',
      bearerToken: null,
      apiKey: null,
    });

    expect(authenticateWithFarcasterToken).toHaveBeenCalledWith('fc-token');
    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.FARCaster,
    });
  });

  it('delegates to authenticateWithBearerToken when bearerToken is provided', async () => {
    vi.mocked(authenticateWithBearerToken).mockResolvedValue({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.Privy,
    });

    const result = await authenticate({
      farcasterToken: null,
      bearerToken: 'bearer-token',
      apiKey: null,
    });

    expect(authenticateWithBearerToken).toHaveBeenCalledWith('bearer-token');
    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.Privy,
    });
  });

  it('delegates to authenticateWithApiKey when apiKey is provided', async () => {
    vi.mocked(authenticateWithApiKey).mockResolvedValue({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.ApiKey,
    });

    const result = await authenticate({
      farcasterToken: null,
      bearerToken: null,
      apiKey: 'api-key',
    });

    expect(authenticateWithApiKey).toHaveBeenCalledWith('api-key');
    expect(result).toEqual({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.ApiKey,
    });
  });

  it('prefers farcasterToken over bearerToken and apiKey', async () => {
    vi.mocked(authenticateWithFarcasterToken).mockResolvedValue({
      artistAddress: ARTIST_ADDRESS,
      authMethod: AuthMethod.FARCaster,
    });

    await authenticate({
      farcasterToken: 'fc-token',
      bearerToken: 'bearer-token',
      apiKey: 'api-key',
    });

    expect(authenticateWithFarcasterToken).toHaveBeenCalled();
    expect(authenticateWithBearerToken).not.toHaveBeenCalled();
    expect(authenticateWithApiKey).not.toHaveBeenCalled();
  });

  it('returns 401 NextResponse when no token is provided', async () => {
    const result = await authenticate({
      farcasterToken: null,
      bearerToken: null,
      apiKey: null,
    });

    expect(result).toBeInstanceOf(NextResponse);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({ message: AuthErrorTypes.INVALID_AUTHENTICATION });
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 401 NextResponse when an auth error is thrown', async () => {
    vi.mocked(authenticateWithApiKey).mockRejectedValue(
      new Error(AuthErrorMessages.INVALID_API_KEY)
    );

    const result = await authenticate({
      farcasterToken: null,
      bearerToken: null,
      apiKey: 'bad-key',
    });

    expect(result).toBeInstanceOf(NextResponse);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({ message: AuthErrorTypes.INVALID_AUTHENTICATION });
  });

  it('rethrows unexpected errors', async () => {
    vi.mocked(authenticateWithBearerToken).mockRejectedValue(
      new Error('Database connection lost')
    );

    await expect(
      authenticate({ farcasterToken: null, bearerToken: 'token', apiKey: null })
    ).rejects.toThrow('Database connection lost');
  });
});
