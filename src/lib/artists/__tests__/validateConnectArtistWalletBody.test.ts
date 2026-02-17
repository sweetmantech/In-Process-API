import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateConnectArtistWalletBody from '@/lib/artists/validateConnectArtistWalletBody';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/artists/wallets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

describe('validateConnectArtistWalletBody', () => {
  it('returns validated data when body is valid', async () => {
    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: '0xartist', social_wallet: '0xsocial' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artist_wallet).toBe('0xartist');
    expect((result as any).social_wallet).toBe('0xsocial');
  });

  it('returns 400 when artist_wallet is missing', async () => {
    const result = await validateConnectArtistWalletBody(
      makeRequest({ social_wallet: '0xsocial' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when social_wallet is missing', async () => {
    const result = await validateConnectArtistWalletBody(
      makeRequest({ artist_wallet: '0xartist' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const result = await validateConnectArtistWalletBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
