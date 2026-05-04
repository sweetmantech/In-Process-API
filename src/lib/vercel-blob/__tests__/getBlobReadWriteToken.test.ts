import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import getBlobReadWriteToken from '@/lib/vercel-blob/getBlobReadWriteToken';

describe('getBlobReadWriteToken', () => {
  const prev = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = prev;
  });

  it('throws when BLOB_READ_WRITE_TOKEN is unset', () => {
    expect(() => getBlobReadWriteToken()).toThrow(/BLOB_READ_WRITE_TOKEN/);
  });

  it('returns the configured token', () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'tok_test';
    expect(getBlobReadWriteToken()).toBe('tok_test');
  });
});
