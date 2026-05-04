import { describe, it, expect } from 'vitest';
import chunkUploadBlobPathname from '@/lib/chunk-upload/chunkUploadBlobPathname';

describe('chunkUploadBlobPathname', () => {
  it('returns a deterministic private pathname for session and index', () => {
    expect(chunkUploadBlobPathname('sess-1', 0)).toBe(
      'in-process-chunk-uploads/sess-1/0'
    );
    expect(chunkUploadBlobPathname('abc', 42)).toBe(
      'in-process-chunk-uploads/abc/42'
    );
  });
});
