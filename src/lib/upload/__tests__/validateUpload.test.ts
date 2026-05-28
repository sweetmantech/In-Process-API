import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock('@/lib/getBlob', () => ({ default: vi.fn() }));
vi.mock('@/lib/upload/getUploadType', () => ({ default: vi.fn() }));
vi.mock('@/lib/smartwallets/getSmartWalletAddress', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getSmartWalletUsdcBalance', () => ({
  default: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import getBlob from '@/lib/getBlob';
import getUploadType from '@/lib/upload/getUploadType';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import getSmartWalletUsdcBalance from '@/lib/smartwallets/getSmartWalletUsdcBalance';
import validateUpload from '@/lib/upload/validateUpload';

const ARTIST = '0xartist';
const SMART_WALLET = '0xwallet' as `0x${string}`;
const BLOB = new Blob(['data'], { type: 'image/png' });
const USDC = BigInt(1000);

const makeRequest = (body: unknown = { url: 'https://example.com/file.png' }) =>
  new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('validateUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authMiddleware).mockResolvedValue({
      primaryWallet: ARTIST,
    } as any);
    vi.mocked(getBlob).mockResolvedValue({ blob: BLOB, type: 'image/png' });
  });

  it('returns auth response when auth fails', async () => {
    vi.mocked(authMiddleware).mockResolvedValue(
      NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    );

    const result = await validateUpload(makeRequest());

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it('returns 400 on invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: 'not json',
    });

    const result = await validateUpload(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 400 when url field is missing', async () => {
    const result = await validateUpload(makeRequest({}));

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns 500 when getUploadType returns an error', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      error: 'Failed to check upload quota',
      status: 500,
    });

    const result = await validateUpload(makeRequest());
    const body = await (result as NextResponse).json();

    expect((result as NextResponse).status).toBe(500);
    expect(body.message).toBe('Failed to check upload quota');
  });

  it('returns validated data for free upload without balance check', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'free',
      usdcAmountMicros: BigInt(0),
    });

    const result = await validateUpload(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).uploadType).toBe('free');
    expect((result as any).usdcAmountMicros).toBe(BigInt(0));
    expect(getSmartWalletAddress).not.toHaveBeenCalled();
  });

  it('returns 500 when smart wallet resolution fails for paid upload', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'paid',
      usdcAmountMicros: USDC,
    });
    vi.mocked(getSmartWalletAddress).mockRejectedValue(new Error('rpc error'));

    const result = await validateUpload(makeRequest());
    const body = await (result as NextResponse).json();

    expect((result as NextResponse).status).toBe(500);
    expect(body.message).toBe('Failed to resolve smart wallet');
  });

  it('returns 402 when USDC balance is insufficient', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'paid',
      usdcAmountMicros: USDC,
    });
    vi.mocked(getSmartWalletAddress).mockResolvedValue(SMART_WALLET);
    vi.mocked(getSmartWalletUsdcBalance).mockResolvedValue(BigInt(100));

    const result = await validateUpload(makeRequest());
    const body = await (result as NextResponse).json();

    expect((result as NextResponse).status).toBe(402);
    expect(body.required).toBe(USDC.toString());
    expect(body.available).toBe('100');
    expect(body.smart_wallet).toBe(SMART_WALLET.toLowerCase());
  });

  it('returns validated data when USDC balance is sufficient for paid upload', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'paid',
      usdcAmountMicros: USDC,
    });
    vi.mocked(getSmartWalletAddress).mockResolvedValue(SMART_WALLET);
    vi.mocked(getSmartWalletUsdcBalance).mockResolvedValue(BigInt(9999));

    const result = await validateUpload(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).uploadType).toBe('paid');
    expect((result as any).usdcAmountMicros).toBe(USDC);
    expect((result as any).artistAddress).toBe(ARTIST);
  });
});
