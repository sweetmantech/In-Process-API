import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/verifyArweaveTx', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/logArweaveUpload', () => ({ default: vi.fn() }));

import verifyArweaveTx from '@/lib/arweave/verifyArweaveTx';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import logArweaveUploadsHandler from '@/lib/arweave/logArweaveUploadsHandler';

const artistAddress = '0xartist';

const makeUpload = (n: number) => ({
  arweave_uri: `ar://tx${n}`,
  winc_cost: '1000',
  file_size_bytes: 1024,
  content_type: 'image/png',
});

describe('logArweaveUploadsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all uris in logged when all txs are valid', async () => {
    vi.mocked(verifyArweaveTx).mockResolvedValue(true);
    const uploads = [makeUpload(1), makeUpload(2)];

    const res = await logArweaveUploadsHandler(artistAddress, uploads);
    const body = await res.json();

    expect(body).toEqual({ logged: ['ar://tx1', 'ar://tx2'], failed: [] });
  });

  it('returns all uris in failed when all txs are invalid', async () => {
    vi.mocked(verifyArweaveTx).mockResolvedValue(false);
    const uploads = [makeUpload(1), makeUpload(2)];

    const res = await logArweaveUploadsHandler(artistAddress, uploads);
    const body = await res.json();

    expect(body).toEqual({ logged: [], failed: ['ar://tx1', 'ar://tx2'] });
  });

  it('splits logged and failed for mixed results', async () => {
    vi.mocked(verifyArweaveTx)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const uploads = [makeUpload(1), makeUpload(2), makeUpload(3)];

    const res = await logArweaveUploadsHandler(artistAddress, uploads);
    const body = await res.json();

    expect(body).toEqual({
      logged: ['ar://tx1', 'ar://tx3'],
      failed: ['ar://tx2'],
    });
  });

  it('calls logArweaveUpload only for valid uploads', async () => {
    vi.mocked(verifyArweaveTx)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const uploads = [makeUpload(1), makeUpload(2)];

    await logArweaveUploadsHandler(artistAddress, uploads);

    expect(logArweaveUpload).toHaveBeenCalledTimes(1);
    expect(logArweaveUpload).toHaveBeenCalledWith(
      { arweave_uri: 'ar://tx1', winc_cost: '1000' },
      {
        file_size_bytes: 1024,
        content_type: 'image/png',
        artist_address: artistAddress,
      }
    );
  });

  it('does not call logArweaveUpload when all txs are invalid', async () => {
    vi.mocked(verifyArweaveTx).mockResolvedValue(false);

    await logArweaveUploadsHandler(artistAddress, [makeUpload(1)]);

    expect(logArweaveUpload).not.toHaveBeenCalled();
  });

  it('calls verifyArweaveTx for every upload', async () => {
    vi.mocked(verifyArweaveTx).mockResolvedValue(true);
    const uploads = [makeUpload(1), makeUpload(2), makeUpload(3)];

    await logArweaveUploadsHandler(artistAddress, uploads);

    expect(verifyArweaveTx).toHaveBeenCalledTimes(3);
    expect(verifyArweaveTx).toHaveBeenCalledWith('ar://tx1');
    expect(verifyArweaveTx).toHaveBeenCalledWith('ar://tx2');
    expect(verifyArweaveTx).toHaveBeenCalledWith('ar://tx3');
  });
});
