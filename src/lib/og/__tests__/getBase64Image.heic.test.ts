import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import getBase64Image from '@/lib/og/getBase64Image';

vi.mock('@/lib/arweave/fetchUri');

import fetchUri from '@/lib/arweave/fetchUri';

const readHeicFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, '../../telegram/chat/__tests__/fixtures', name));

describe('getBase64Image HEIC integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('converts HEIC to a JPEG data URL', async () => {
    const heicBuffer = readHeicFixture('apple-styled-photo.heic');

    vi.mocked(fetchUri).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(heicBuffer.buffer),
    } as Response);

    const result = await getBase64Image('ar://test-heic');

    expect(result).toMatch(/^data:image\/jpeg;base64,/);
    expect(
      Buffer.from(result!.split(',')[1]!, 'base64').length
    ).toBeGreaterThan(0);
  });
});
