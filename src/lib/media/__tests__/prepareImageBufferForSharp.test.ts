import { describe, it, expect } from 'vitest';
import prepareImageBufferForSharp from '../prepareImageBufferForSharp';

describe('prepareImageBufferForSharp', () => {
  it('passes through non-HEIC buffers unchanged', async () => {
    const input = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const output = await prepareImageBufferForSharp(input);
    expect(output).toBe(input);
  });
});
