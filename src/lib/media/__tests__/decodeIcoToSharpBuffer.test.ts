import { describe, it, expect } from 'vitest';
import isIcoBuffer from '@/lib/media/isIcoBuffer';
import decodeIcoToSharpBuffer from '@/lib/media/decodeIcoToSharpBuffer';
import prepareImageBufferForSharp from '@/lib/media/prepareImageBufferForSharp';
import sharp from 'sharp';

describe('isIcoBuffer', () => {
  it('detects ICO magic bytes', () => {
    const buffer = Buffer.alloc(22);
    buffer.writeUInt16LE(0, 0);
    buffer.writeUInt16LE(1, 2);
    buffer.writeUInt16LE(1, 4);
    expect(isIcoBuffer(buffer)).toBe(true);
  });

  it('returns false for non-ICO buffers', () => {
    expect(isIcoBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });
});

describe('decodeIcoToSharpBuffer', () => {
  it('extracts the largest embedded PNG from an ICO', async () => {
    const png = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const ico = Buffer.alloc(6 + 16 + png.length);
    ico.writeUInt16LE(0, 0);
    ico.writeUInt16LE(1, 2);
    ico.writeUInt16LE(1, 4);
    ico.writeUInt8(64, 6);
    ico.writeUInt8(64, 7);
    ico.writeUInt32LE(png.length, 14);
    ico.writeUInt32LE(22, 18);
    png.copy(ico, 22);

    const decoded = decodeIcoToSharpBuffer(ico);
    const metadata = await sharp(decoded).metadata();
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(64);
  });
});

describe('prepareImageBufferForSharp', () => {
  it('decodes ICO buffers before Sharp processing', async () => {
    const png = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 0, g: 255, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const ico = Buffer.alloc(6 + 16 + png.length);
    ico.writeUInt16LE(0, 0);
    ico.writeUInt16LE(1, 2);
    ico.writeUInt16LE(1, 4);
    ico.writeUInt8(32, 6);
    ico.writeUInt8(32, 7);
    ico.writeUInt32LE(png.length, 14);
    ico.writeUInt32LE(22, 18);
    png.copy(ico, 22);

    const prepared = await prepareImageBufferForSharp(ico);
    const webp = await sharp(prepared).webp().toBuffer();
    expect(webp.length).toBeGreaterThan(0);
  });
});
