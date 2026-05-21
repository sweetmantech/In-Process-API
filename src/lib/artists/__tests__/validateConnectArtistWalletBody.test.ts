import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateConnectArtistWalletBody from '@/lib/artists/validateConnectArtistWalletBody';

const ARTIST = '0xa123456789012345678901234567890123456789';
const SOCIAL = '0xb234567890123456789012345678901234567891';

const makeRequest = (
  body: unknown,
  headers?: Record<string, string>
): NextRequest =>
  new NextRequest('http://localhost/api/artists/wallets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });

const privyAuth = ({
  artistAddress,
  socialWallet = SOCIAL,
}: {
  artistAddress: string;
  socialWallet?: string;
}) => ({
  artistAddress,
  socialWallet,
  authMethod: AuthMethod.Privy,
});

describe('validateConnectArtistWalletBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue(
      privyAuth({ artistAddress: SOCIAL }) as any
    );
  });

  it('returns normalized artist_wallet and social_wallet from Privy auth', async () => {
    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      artist_wallet: ARTIST.toLowerCase(),
      social_wallet: SOCIAL.toLowerCase(),
    });
  });

  it('uses socialWallet from Privy auth, not artistAddress when both are present', async () => {
    const newArtist = '0x0000000000000000000000000000000000000003';
    vi.mocked(authMiddleware).mockResolvedValue(
      privyAuth({
        artistAddress: ARTIST,
        socialWallet: SOCIAL,
      }) as any
    );

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: newArtist })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({
      artist_wallet: newArtist.toLowerCase(),
      social_wallet: SOCIAL.toLowerCase(),
    });
  });

  it('returns 403 when auth method is not Privy', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: SOCIAL,
      authMethod: AuthMethod.ApiKey,
    } as any);

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('returns 403 when authenticated social wallet equals artist_wallet', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      privyAuth({ artistAddress: ARTIST, socialWallet: ARTIST }) as any
    );

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({
      message: 'An external wallet is already connected',
    });
  });

  it('returns 400 when artist_wallet has invalid format', async () => {
    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: 'not-an-address' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const result = await validateConnectArtistWalletBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 403 when artistAddress already matches artist_wallet (external wallet connected)', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      privyAuth({ artistAddress: ARTIST, socialWallet: SOCIAL }) as any
    );

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({
      message: 'An external wallet is already connected',
    });
  });

  it('returns 403 when socialWallet is missing from Privy auth', async () => {
    vi.mocked(authMiddleware).mockResolvedValue({
      artistAddress: ARTIST,
      authMethod: AuthMethod.Privy,
    } as any);

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
    const body = await (result as NextResponse).json();
    expect(body).toEqual({ message: 'Privy social wallet not found' });
  });

  it('returns auth response when authMiddleware fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: ARTIST })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });
});
