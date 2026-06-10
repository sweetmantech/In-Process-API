import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/logArweaveUpload', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/topUpTurboCredits', () => ({ default: vi.fn() }));

import uploadToArweave from '@/lib/arweave/uploadToArweave';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import topUpTurboCredits from '@/lib/arweave/topUpTurboCredits';
import uploadHandler from '@/lib/upload/uploadHandler';
import type { ArtistContext } from '@/types/artist';
import type { EvmSmartAccount } from '@coinbase/cdp-sdk';

const ARTIST: ArtistContext = {
  artistId: 'artist-1',
  primaryWallet: '0xabc' as `0x${string}`,
  wallets: [],
};
const SMART_ACCOUNT = { address: '0xsmart' } as unknown as EvmSmartAccount;
const BLOB = new Blob(['data'], { type: 'image/png' });
const CONTENT_TYPE = 'image/png';
const UPLOAD_RESULT = { arweave_uri: 'ar://test123', winc_cost: '500' };
const USDC = BigInt(1000);

describe('uploadHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(uploadToArweave).mockResolvedValue(UPLOAD_RESULT);
  });

  it('returns uri from arweave upload result', async () => {
    const res = await uploadHandler(
      ARTIST,
      BLOB,
      CONTENT_TYPE,
      'free',
      BigInt(0)
    );
    const body = await res.json();

    expect(body).toEqual({ uri: 'ar://test123' });
  });

  it('skips topUpTurboCredits for free upload', async () => {
    await uploadHandler(ARTIST, BLOB, CONTENT_TYPE, 'free', BigInt(0));

    expect(topUpTurboCredits).not.toHaveBeenCalled();
  });

  it('calls topUpTurboCredits with smartAccount and usdcAmountMicros for paid upload', async () => {
    await uploadHandler(
      ARTIST,
      BLOB,
      CONTENT_TYPE,
      'paid',
      USDC,
      SMART_ACCOUNT
    );

    expect(topUpTurboCredits).toHaveBeenCalledWith(SMART_ACCOUNT, USDC);
  });

  it('skips topUpTurboCredits when paid but smartAccount is missing', async () => {
    await uploadHandler(ARTIST, BLOB, CONTENT_TYPE, 'paid', USDC);

    expect(topUpTurboCredits).not.toHaveBeenCalled();
  });

  it('always calls uploadToArweave with a File built from blob', async () => {
    await uploadHandler(ARTIST, BLOB, CONTENT_TYPE, 'free', BigInt(0));

    expect(uploadToArweave).toHaveBeenCalledTimes(1);
    const [file] = vi.mocked(uploadToArweave).mock.calls[0];
    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe(CONTENT_TYPE);
    expect(file.size).toBe(BLOB.size);
  });

  it('always calls logArweaveUpload with upload result and meta', async () => {
    await uploadHandler(ARTIST, BLOB, CONTENT_TYPE, 'free', BigInt(0));

    expect(logArweaveUpload).toHaveBeenCalledWith(UPLOAD_RESULT, {
      file_size_bytes: BLOB.size,
      content_type: CONTENT_TYPE,
      artist_address: ARTIST.primaryWallet,
    });
  });
});
