import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/logArweaveUpload', () => ({ default: vi.fn() }));

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

  it('logs all uploads and returns them in logged', async () => {
    const uploads = [makeUpload(1), makeUpload(2)];

    const res = await logArweaveUploadsHandler(artistAddress, uploads);
    const body = await res.json();

    expect(body).toEqual({ logged: ['ar://tx1', 'ar://tx2'] });
  });

  it('calls logArweaveUpload for every upload', async () => {
    const uploads = [makeUpload(1), makeUpload(2)];

    await logArweaveUploadsHandler(artistAddress, uploads);

    expect(logArweaveUpload).toHaveBeenCalledTimes(2);
    expect(logArweaveUpload).toHaveBeenCalledWith(
      { arweave_uri: 'ar://tx1', winc_cost: '1000' },
      {
        file_size_bytes: 1024,
        content_type: 'image/png',
        artist_address: artistAddress,
      }
    );
  });

  it('returns empty logged for empty uploads', async () => {
    const res = await logArweaveUploadsHandler(artistAddress, []);
    const body = await res.json();

    expect(body).toEqual({ logged: [] });
    expect(logArweaveUpload).not.toHaveBeenCalled();
  });
});
