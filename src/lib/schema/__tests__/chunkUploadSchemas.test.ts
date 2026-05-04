import { describe, it, expect } from 'vitest';
import chunkUploadSessionBodySchema from '@/lib/schema/chunkUploadSessionBodySchema';
import chunkUploadCompleteBodySchema from '@/lib/schema/chunkUploadCompleteBodySchema';
import chunkUploadMaxPartBytes, {
  chunkUploadMaxChunkCount,
  chunkUploadMaxTotalBytes,
} from '@/lib/chunk-upload/chunkUploadMaxPartBytes';

const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('chunkUploadSessionBodySchema', () => {
  const minimal = {
    filename: 'a.bin',
    total_chunks: 1,
  };

  it('parses minimal valid body and applies default content_type', () => {
    const r = chunkUploadSessionBodySchema.safeParse(minimal);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.content_type).toBe('application/octet-stream');
    expect(r.data.filename).toBe('a.bin');
    expect(r.data.total_chunks).toBe(1);
  });

  it('rejects total_chunks above max', () => {
    const r = chunkUploadSessionBodySchema.safeParse({
      ...minimal,
      total_chunks: chunkUploadMaxChunkCount + 1,
    });
    expect(r.success).toBe(false);
  });

  it('rejects total_size_bytes above global max', () => {
    const r = chunkUploadSessionBodySchema.safeParse({
      ...minimal,
      total_size_bytes: chunkUploadMaxTotalBytes + 1,
    });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(
      r.error.issues.some((i) => i.path.includes('total_size_bytes'))
    ).toBe(true);
  });

  it('rejects total_size_bytes above total_chunks * part size', () => {
    const r = chunkUploadSessionBodySchema.safeParse({
      filename: 'x',
      total_chunks: 2,
      total_size_bytes: 2 * chunkUploadMaxPartBytes + 1,
    });
    expect(r.success).toBe(false);
  });

  it('accepts total_size_bytes within chunk ceiling', () => {
    const r = chunkUploadSessionBodySchema.safeParse({
      filename: 'x',
      total_chunks: 2,
      total_size_bytes: 2 * chunkUploadMaxPartBytes,
    });
    expect(r.success).toBe(true);
  });
});

describe('chunkUploadCompleteBodySchema', () => {
  it('requires a UUID session_id', () => {
    expect(
      chunkUploadCompleteBodySchema.safeParse({ session_id: 'not-uuid' })
        .success
    ).toBe(false);
    expect(
      chunkUploadCompleteBodySchema.safeParse({ session_id: SESSION_ID })
        .success
    ).toBe(true);
  });
});
