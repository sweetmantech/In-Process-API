import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';
import buildCreateBatchInput from '@/lib/telegram/chat/moment/buildCreateBatchInput';
import type { PendingMediaGroupAsset } from '@/types/telegram';

const artistAddress = '0x1234567890123456789012345678901234567890' as Address;
const collectionAddress =
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;

const asset = (overrides: Partial<PendingMediaGroupAsset> = {}) =>
  ({
    fileId: 'file-1',
    name: 'moment.jpg',
    mimeType: 'image/jpeg',
    attachmentType: 'image',
    ...overrides,
  }) satisfies PendingMediaGroupAsset;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-09T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('buildCreateBatchInput', () => {
  it('uses upload time as saleStart for every token', () => {
    const uploadTime = Math.floor(Date.now() / 1000);

    const result = buildCreateBatchInput(
      [asset({ fileId: 'file-1' }), asset({ fileId: 'file-2' })],
      [{ uri: 'ar://token-uri-1' }, { uri: 'ar://token-uri-2' }],
      collectionAddress,
      artistAddress
    );

    expect(result.tokens[0].salesConfig.saleStart).toBe(BigInt(uploadTime));
    expect(result.tokens[1].salesConfig.saleStart).toBe(BigInt(uploadTime));
  });
});
