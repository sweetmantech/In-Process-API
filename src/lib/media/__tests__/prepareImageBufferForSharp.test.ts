import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import prepareImageBufferForSharp from '../prepareImageBufferForSharp';

const readHeicFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, '../../telegram/chat/__tests__/fixtures', name));

describe('prepareImageBufferForSharp', () => {
  it('decodes HEIC fixtures to JPEG for sharp', async () => {
    for (const fixture of [
      'apple-styled-photo.heic',
      'shelf-christmas-decoration.heic',
    ]) {
      const output = await prepareImageBufferForSharp(readHeicFixture(fixture));
      expect(output[0]).toBe(0xff);
      expect(output[1]).toBe(0xd8);
    }
  });

  it('passes through non-HEIC buffers unchanged', async () => {
    const input = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const output = await prepareImageBufferForSharp(input);
    expect(output).toBe(input);
  });
});
