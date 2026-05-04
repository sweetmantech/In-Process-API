import { describe, it, expect } from 'vitest';
import chunkUploadMaxPartBytes, {
  chunkUploadMaxChunkCount,
  chunkUploadMaxTotalBytes,
} from '@/lib/chunk-upload/chunkUploadMaxPartBytes';

describe('chunkUploadMaxPartBytes', () => {
  it('exports 4 MiB part limit', () => {
    expect(chunkUploadMaxPartBytes).toBe(4 * 1024 * 1024);
  });

  it('exports 444 MiB total limit', () => {
    expect(chunkUploadMaxTotalBytes).toBe(444 * 1024 * 1024);
  });

  it('computes max chunk count as ceil(total / part)', () => {
    expect(chunkUploadMaxChunkCount).toBe(
      Math.ceil(chunkUploadMaxTotalBytes / chunkUploadMaxPartBytes)
    );
    expect(chunkUploadMaxChunkCount).toBe(111);
  });
});
