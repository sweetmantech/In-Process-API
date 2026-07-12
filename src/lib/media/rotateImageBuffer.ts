import sharp from 'sharp';

/**
 * Rotates an image buffer clockwise by `degrees` (must be a multiple of 90),
 * preserving the source format.
 */
const rotateImageBuffer = (buffer: Buffer, degrees: number): Promise<Buffer> =>
  sharp(buffer).rotate(degrees).toBuffer();

export default rotateImageBuffer;
