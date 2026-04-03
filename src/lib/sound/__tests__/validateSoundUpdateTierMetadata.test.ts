import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));

import { authMiddleware } from '@/authMiddleware';
import validateSoundUpdateTierMetadata from '@/lib/sound/validateSoundUpdateTierMetadata';

const ARTIST = '0xaf1452d289e22fbd0dea9d5097353c72a90fac33';
const COLLECTION_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const NEW_URI = 'ar://some-arweave-hash';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/sound/metadata/tier', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const validBody = {
  collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
  tier: 0,
  newUri: NEW_URI,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authMiddleware).mockResolvedValue({ artistAddress: ARTIST } as any);
});

describe('validateSoundUpdateTierMetadata', () => {
  it('returns validated data with artistAddress on valid input', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest(validBody)
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).artistAddress).toBe(ARTIST);
    expect((result as any).collection.address).toBe(COLLECTION_ADDRESS);
    expect((result as any).tier).toBe(0);
    expect((result as any).newUri).toBe(NEW_URI);
  });

  it('returns auth error when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateSoundUpdateTierMetadata(
      makeRequest(validBody)
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 when collection is missing', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({ tier: 0, newUri: NEW_URI })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when collection address is invalid', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({
        collection: { address: 'not-an-address', chainId: 8453 },
        tier: 0,
        newUri: NEW_URI,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when tier is missing', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({
        collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
        newUri: NEW_URI,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when tier is below 0', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({ ...validBody, tier: -1 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when tier exceeds 255', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({ ...validBody, tier: 256 })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('accepts tier at boundary value 255', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({ ...validBody, tier: 255 })
    );

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).tier).toBe(255);
  });

  it('returns 400 when newUri is missing', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({
        collection: { address: COLLECTION_ADDRESS, chainId: 8453 },
        tier: 0,
      })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when newUri is empty string', async () => {
    const result = await validateSoundUpdateTierMetadata(
      makeRequest({ ...validBody, newUri: '' })
    );

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
