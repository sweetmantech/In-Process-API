import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({
  authMiddleware: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import validateAirdropMoment from '@/lib/moment/validateAirdropMoment';

const ARTIST = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const RECIPIENT = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
const COLLECTION = '0x0000000000000000000000000000000000000001';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/moment/airdrop', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

const validBody = {
  recipients: [RECIPIENT],
  moment: { collectionAddress: COLLECTION, tokenId: '1', chainId: 8453 },
};

describe('validateAirdropMoment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: ARTIST,
    } as any);
  });

  it('returns validated data for valid input', async () => {
    const result = await validateAirdropMoment(makeRequest(validBody));

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).recipients).toEqual([RECIPIENT]);
    expect((result as any).moment.collectionAddress).toBe(COLLECTION);
    expect((result as any).moment.tokenId).toBe('1');
    expect((result as any).moment.chainId).toBe(8453);
  });

  it('returns 401 when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateAirdropMoment(makeRequest(validBody));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when recipients is missing', async () => {
    const result = await validateAirdropMoment(
      makeRequest({ moment: validBody.moment })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when recipients contains an invalid address', async () => {
    const result = await validateAirdropMoment(
      makeRequest({ ...validBody, recipients: ['not-an-address'] })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when recipients is not an array', async () => {
    const result = await validateAirdropMoment(
      makeRequest({ ...validBody, recipients: RECIPIENT })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when moment is missing', async () => {
    const result = await validateAirdropMoment(
      makeRequest({ recipients: [RECIPIENT] })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when moment.collectionAddress is invalid', async () => {
    const result = await validateAirdropMoment(
      makeRequest({
        ...validBody,
        moment: { ...validBody.moment, collectionAddress: 'bad' },
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when body is malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/moment/airdrop', {
      method: 'POST',
      body: 'not json',
      headers: { 'content-type': 'application/json' },
    });

    const result = await validateAirdropMoment(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
    const json = await (result as NextResponse).json();
    expect(json.errors[0].message).toBe('Malformed JSON body');
  });
});
