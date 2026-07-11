import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import imageProxyHandler from '@/lib/media/imageProxyHandler';

vi.mock('@/lib/arweave/fetchUri');

import fetchUri from '@/lib/arweave/fetchUri';

const readHeicFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, '../../telegram/chat/__tests__/fixtures', name));

describe('imageProxyHandler HEIC integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('converts HEIC to webp blur output via sharp', async () => {
    const heicBuffer = readHeicFixture('apple-styled-photo.heic');

    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(heicBuffer.buffer),
    } as Response);

    const result = await imageProxyHandler({
      url: 'ar://test-heic',
      width: 16,
      height: undefined,
      quality: 10,
      format: 'webp',
    });

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('image/webp');

    const body = Buffer.from(await result.arrayBuffer());
    expect(body.length).toBeGreaterThan(0);
    expect(body.toString('ascii', 0, 4)).toBe('RIFF');
  });
});
