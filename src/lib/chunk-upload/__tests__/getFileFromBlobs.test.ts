import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/vercel-blob/blobGetBuffer', () => ({ default: vi.fn() }));

import blobGetBuffer from '@/lib/vercel-blob/blobGetBuffer';
import getFileFromBlobs from '@/lib/chunk-upload/getFileFromBlobs';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getFileFromBlobs', () => {
  const opts = {
    filename: 'out.bin',
    contentType: 'application/octet-stream',
    totalSizeBytes: null as number | null,
    maxTotalBytes: 10_000,
  };

  it('assembles buffers into a File', async () => {
    vi.mocked(blobGetBuffer)
      .mockResolvedValueOnce(Buffer.from('ab'))
      .mockResolvedValueOnce(Buffer.from('cd'));

    const r = await getFileFromBlobs(
      [
        { blob_url: 'https://a', byte_length: 2 },
        { blob_url: 'https://b', byte_length: 2 },
      ],
      opts
    );

    expect(r.ok).toBe(true);
    if (!r.ok) throw new Error('expected ok');
    expect(r.file.name).toBe('out.bin');
    expect(r.file.type).toBe('application/octet-stream');
    expect(Buffer.from(await r.file.arrayBuffer()).toString()).toBe('abcd');
  });

  it('returns 500 when blobGetBuffer throws', async () => {
    vi.mocked(blobGetBuffer).mockRejectedValueOnce(new Error('x'));

    const r = await getFileFromBlobs(
      [{ blob_url: 'https://a', byte_length: 1 }],
      opts
    );

    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected fail');
    expect(r.status).toBe(500);
    expect(r.message).toMatch(/read chunk/);
  });

  it('returns 400 when buffer length does not match byte_length', async () => {
    vi.mocked(blobGetBuffer).mockResolvedValueOnce(Buffer.from('a'));

    const r = await getFileFromBlobs(
      [{ blob_url: 'https://a', byte_length: 2 }],
      opts
    );

    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected fail');
    expect(r.status).toBe(400);
    expect(r.message).toMatch(/mismatch/);
  });

  it('returns 400 when sum disagrees with total_size_bytes', async () => {
    vi.mocked(blobGetBuffer).mockResolvedValue(Buffer.from('a'));

    const r = await getFileFromBlobs(
      [{ blob_url: 'https://a', byte_length: 1 }],
      { ...opts, totalSizeBytes: 99 }
    );

    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected fail');
    expect(r.message).toMatch(/total_size_bytes/);
  });

  it('returns 400 when assembled size exceeds maxTotalBytes', async () => {
    vi.mocked(blobGetBuffer).mockResolvedValue(Buffer.from('abc'));

    const r = await getFileFromBlobs(
      [{ blob_url: 'https://a', byte_length: 3 }],
      { ...opts, maxTotalBytes: 2 }
    );

    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('expected fail');
    expect(r.status).toBe(400);
    expect(r.message).toMatch(/max size/);
  });
});
