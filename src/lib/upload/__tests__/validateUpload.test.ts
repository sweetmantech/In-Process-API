import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/authMiddleware', () => ({ authMiddleware: vi.fn() }));
vi.mock('@/lib/getBlob', () => ({ default: vi.fn() }));
vi.mock('@/lib/upload/getUploadType', () => ({ default: vi.fn() }));
vi.mock('@/lib/smartwallets/getArtistSmartWallet', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/smartwallets/getSmartWalletUsdcBalance', () => ({
  default: vi.fn(),
}));

import { authMiddleware } from '@/authMiddleware';
import getBlob from '@/lib/getBlob';
import getUploadType from '@/lib/upload/getUploadType';
import getArtistSmartWallet from '@/lib/smartwallets/getArtistSmartWallet';
import getSmartWalletUsdcBalance from '@/lib/smartwallets/getSmartWalletUsdcBalance';
import validateUpload from '@/lib/upload/validateUpload';

const ARTIST_ADDRESS = '0xartist' as `0x${string}`;
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
      primaryWallet: ARTIST_ADDRESS,
      artistId: 'artist-1',
      wallets: [],
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
    expect(getArtistSmartWallet).not.toHaveBeenCalled();
  });

  it('returns 402 when USDC balance is insufficient', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'paid',
      usdcAmountMicros: USDC,
    });
    vi.mocked(getArtistSmartWallet).mockResolvedValue(SMART_WALLET);
    vi.mocked(getSmartWalletUsdcBalance).mockResolvedValue(BigInt(100));

    const result = await validateUpload(makeRequest());
    const body = await (result as NextResponse).json();

    expect((result as NextResponse).status).toBe(402);
    expect(body.required).toBe(USDC.toString());
    expect(body.available).toBe('100');
    expect(body.smart_wallet).toBe(SMART_WALLET.toLowerCase());
  });

  it('returns validated data with artist when USDC balance is sufficient', async () => {
    vi.mocked(getUploadType).mockResolvedValue({
      uploadType: 'paid',
      usdcAmountMicros: USDC,
    });
    vi.mocked(getArtistSmartWallet).mockResolvedValue(SMART_WALLET);
    vi.mocked(getSmartWalletUsdcBalance).mockResolvedValue(BigInt(9999));

    const result = await validateUpload(makeRequest());

    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as any).uploadType).toBe('paid');
    expect((result as any).usdcAmountMicros).toBe(USDC);
    expect((result as any).artist.primaryWallet).toBe(ARTIST_ADDRESS);
  });
});
