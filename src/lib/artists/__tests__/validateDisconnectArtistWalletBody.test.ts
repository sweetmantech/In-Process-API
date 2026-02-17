import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import validateDisconnectArtistWalletBody from '@/lib/artists/validateDisconnectArtistWalletBody';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/artists/wallets', {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

describe('validateDisconnectArtistWalletBody', () => {
  it('returns validated data when social_wallet is provided', async () => {
    const result = await validateDisconnectArtistWalletBody(
      makeRequest({ social_wallet: '0xsocial' })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).social_wallet).toBe('0xsocial');
  });

  it('returns 400 when social_wallet is missing', async () => {
    const result = await validateDisconnectArtistWalletBody(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when social_wallet is empty string', async () => {
    const result = await validateDisconnectArtistWalletBody(
      makeRequest({ social_wallet: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
