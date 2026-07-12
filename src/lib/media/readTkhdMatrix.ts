import type { Mp4Box } from './readMp4BoxHeader';

export type TkhdMatrix = {
  a: number;
  b: number;
  c: number;
  d: number;
  width: number;
  height: number;
};

const readInt32Fixed1616 = (buffer: Buffer, offset: number): number =>
  buffer.readInt32BE(offset) / 65536;

/**
 * Reads the display transformation matrix (a, b, c, d of the 3x3 row-major
 * matrix; the translation/perspective terms are irrelevant for rotation)
 * plus the track's declared width/height from a `tkhd` full box. Handles
 * both the 32-bit (version 0) and 64-bit (version 1) time-field layouts.
 */
const readTkhdMatrix = (
  buffer: Buffer,
  tkhd: Mp4Box
): TkhdMatrix | undefined => {
  if (tkhd.contentEnd - tkhd.contentStart < 5) return undefined;

  const version = buffer.readUInt8(tkhd.contentStart);
  const timesSize = version === 1 ? 8 + 8 + 4 + 4 + 8 : 4 + 4 + 4 + 4 + 4;
  const matrixOffset = tkhd.contentStart + 4 + timesSize + 8 + 8;
  if (matrixOffset + 44 > tkhd.contentEnd) return undefined;

  return {
    a: readInt32Fixed1616(buffer, matrixOffset),
    b: readInt32Fixed1616(buffer, matrixOffset + 4),
    c: readInt32Fixed1616(buffer, matrixOffset + 12),
    d: readInt32Fixed1616(buffer, matrixOffset + 16),
    width: readInt32Fixed1616(buffer, matrixOffset + 36),
    height: readInt32Fixed1616(buffer, matrixOffset + 40),
  };
};

export default readTkhdMatrix;
