import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

vi.mock('@/lib/catalog/validateCatalogCollect', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/catalog/collectCatalogMomentHandler', () => ({
  default: vi.fn(),
}));

import validateCatalogCollect from '@/lib/catalog/validateCatalogCollect';
import collectCatalogMomentHandler from '@/lib/catalog/collectCatalogMomentHandler';
import { POST } from './route';

const makeRequest = () =>
  new NextRequest('http://localhost/api/catalog/collect', { method: 'POST' });

const validatedData = {
  artistAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb01',
  moment: {
    tokenId: '1',
    collectionAddress: '0xcccccccccccccccccccccccccccccccccccccc01',
    chainId: 8453,
  },
  amount: 1,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('POST /api/catalog/collect', () => {
  it('returns auth error when validateCatalogCollect returns a NextResponse', async () => {
    const authError = NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
    vi.mocked(validateCatalogCollect).mockResolvedValue(authError as any);

    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 400 when validateCatalogCollect returns a validation error', async () => {
    const validationError = NextResponse.json(
      { message: 'Invalid input', errors: [] },
      { status: 400 }
    );
    vi.mocked(validateCatalogCollect).mockResolvedValue(validationError as any);

    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
  });

  it('calls handler with validated data and returns its response', async () => {
    vi.mocked(validateCatalogCollect).mockResolvedValue(validatedData as any);
    const handlerResponse = NextResponse.json({ hash: '0xabc', chainId: 8453 });
    vi.mocked(collectCatalogMomentHandler).mockResolvedValue(handlerResponse);

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(collectCatalogMomentHandler).toHaveBeenCalledWith(validatedData);
    expect(body.hash).toBe('0xabc');
  });

  it('returns 500 when handler throws', async () => {
    vi.mocked(validateCatalogCollect).mockResolvedValue(validatedData as any);
    vi.mocked(collectCatalogMomentHandler).mockRejectedValue(
      new Error('Insufficient USDC balance')
    );

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Insufficient USDC balance');
  });

  it('returns 500 with fallback message when error has no message', async () => {
    vi.mocked(validateCatalogCollect).mockResolvedValue(validatedData as any);
    vi.mocked(collectCatalogMomentHandler).mockRejectedValue({});

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('failed to collect catalog moment');
  });
});
