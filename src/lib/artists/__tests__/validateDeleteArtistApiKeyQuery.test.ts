import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { verifyAuthTokenMock } = vi.hoisted(() => ({
  verifyAuthTokenMock: vi.fn(),
}));

vi.mock('@/lib/privy/client', () => ({
  default: {
    utils: () => ({
      auth: () => ({
        verifyAuthToken: verifyAuthTokenMock,
      }),
    }),
  },
}));

import validateDeleteArtistApiKeyQuery from '@/lib/artists/validateDeleteArtistApiKeyQuery';

describe('validateDeleteArtistApiKeyQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAuthTokenMock.mockResolvedValue(undefined as any);
  });

  it('returns keyId when bearer and keyId are valid', async () => {
    const req = new NextRequest(
      'http://localhost/api/artists/api-keys?keyId=id-1',
      {
        headers: { authorization: 'Bearer token' },
      }
    );

    const result = await validateDeleteArtistApiKeyQuery(req);

    expect(result).not.toBeInstanceOf(NextResponse);
    expect(result).toEqual({ keyId: 'id-1' });
    expect(verifyAuthTokenMock).toHaveBeenCalledWith('token');
  });

  it('returns 500 when Authorization header is missing', async () => {
    const req = new NextRequest(
      'http://localhost/api/artists/api-keys?keyId=id-1'
    );

    const result = await validateDeleteArtistApiKeyQuery(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(500);
    const json = await (result as NextResponse).json();
    expect(json.message).toBe(
      'Authorization header with Bearer token required'
    );
  });

  it('returns 400 when keyId is missing', async () => {
    const req = new NextRequest('http://localhost/api/artists/api-keys', {
      headers: { authorization: 'Bearer token' },
    });

    const result = await validateDeleteArtistApiKeyQuery(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.message).toBe('keyId parameter required');
  });

  it('returns 500 when verifyAuthToken rejects', async () => {
    verifyAuthTokenMock.mockRejectedValue(new Error('invalid jwt'));

    const req = new NextRequest(
      'http://localhost/api/artists/api-keys?keyId=id-1',
      {
        headers: { authorization: 'Bearer token' },
      }
    );

    const result = await validateDeleteArtistApiKeyQuery(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(500);
  });
});
