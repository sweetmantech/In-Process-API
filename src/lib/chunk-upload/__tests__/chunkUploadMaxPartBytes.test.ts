import { describe, it, expect } from 'vitest';
import {
  CHUNK_UPLOAD_MAX_PART_BYTES,
  CHUNK_UPLOAD_MAX_TOTAL_BYTES,
  CHUNK_UPLOAD_MAX_CHUNK_COUNT,
} from '@/lib/consts';

describe('chunk upload limits', () => {
  it('exports 4 MiB part limit', () => {
    expect(CHUNK_UPLOAD_MAX_PART_BYTES).toBe(4 * 1024 * 1024);
  });

  it('exports 444 MiB total limit', () => {
    expect(CHUNK_UPLOAD_MAX_TOTAL_BYTES).toBe(444 * 1024 * 1024);
  });

  it('computes max chunk count as ceil(total / part)', () => {
    expect(CHUNK_UPLOAD_MAX_CHUNK_COUNT).toBe(
      Math.ceil(CHUNK_UPLOAD_MAX_TOTAL_BYTES / CHUNK_UPLOAD_MAX_PART_BYTES)
    );
    expect(CHUNK_UPLOAD_MAX_CHUNK_COUNT).toBe(111);
  });
});
