import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import rotateImageBuffer from '../rotateImageBuffer';

const makeImageBuffer = (width: number, height: number): Promise<Buffer> =>
  sharp({
    create: { width, height, channels: 3, background: { r: 255, g: 0, b: 0 } },
  })
    .png()
    .toBuffer();

describe('rotateImageBuffer', () => {
  it('swaps width/height when rotated 90 degrees', async () => {
    const input = await makeImageBuffer(20, 10);

    const rotated = await rotateImageBuffer(input, 90);
    const metadata = await sharp(rotated).metadata();

    expect(metadata.width).toBe(10);
    expect(metadata.height).toBe(20);
  });

  it('leaves dimensions unchanged when rotated 180 degrees', async () => {
    const input = await makeImageBuffer(20, 10);

    const rotated = await rotateImageBuffer(input, 180);
    const metadata = await sharp(rotated).metadata();

    expect(metadata.width).toBe(20);
    expect(metadata.height).toBe(10);
  });
});
