import { describe, it, expect } from 'vitest';
import readTkhdMatrix from '../readTkhdMatrix';
import readMp4BoxHeader from '../readMp4BoxHeader';

const fixed1616 = (value: number): number => Math.round(value * 65536);

const tkhdV0 = (matrix: {
  a: number;
  b: number;
  c: number;
  d: number;
  width: number;
  height: number;
}): Buffer => {
  const payload = Buffer.alloc(84);
  payload.writeUInt8(0, 0); // version
  // bytes 1-3 flags, 4..23 = creation/modification/trackId/reserved/duration (5 x 4 bytes)
  // 24..31 = reserved[2], 32..39 = layer/altgroup/volume/reserved
  const matrixOffset = 4 + 20 + 8 + 8;
  payload.writeInt32BE(fixed1616(matrix.a), matrixOffset);
  payload.writeInt32BE(fixed1616(matrix.b), matrixOffset + 4);
  payload.writeInt32BE(0, matrixOffset + 8); // u
  payload.writeInt32BE(fixed1616(matrix.c), matrixOffset + 12);
  payload.writeInt32BE(fixed1616(matrix.d), matrixOffset + 16);
  payload.writeInt32BE(0, matrixOffset + 20); // v
  payload.writeInt32BE(0, matrixOffset + 24); // x
  payload.writeInt32BE(0, matrixOffset + 28); // y
  payload.writeInt32BE(0x40000000, matrixOffset + 32); // w (2.30 fixed, 1.0)
  payload.writeInt32BE(fixed1616(matrix.width), matrixOffset + 36);
  payload.writeInt32BE(fixed1616(matrix.height), matrixOffset + 40);

  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write('tkhd', 4, 'ascii');
  return Buffer.concat([header, payload]);
};

describe('readTkhdMatrix', () => {
  it('reads the identity matrix and dimensions of a landscape track', () => {
    const buffer = tkhdV0({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      width: 1920,
      height: 1080,
    });
    const tkhd = readMp4BoxHeader(buffer, 0)!;

    expect(readTkhdMatrix(buffer, tkhd)).toEqual({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      width: 1920,
      height: 1080,
    });
  });

  it('reads a 90-degree portrait-recording matrix (matches real iPhone MOV bytes)', () => {
    const buffer = tkhdV0({
      a: 0,
      b: 1,
      c: -1,
      d: 0,
      width: 1920,
      height: 1080,
    });
    const tkhd = readMp4BoxHeader(buffer, 0)!;

    expect(readTkhdMatrix(buffer, tkhd)).toEqual({
      a: 0,
      b: 1,
      c: -1,
      d: 0,
      width: 1920,
      height: 1080,
    });
  });

  it('returns undefined when the box is too short', () => {
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(8, 0);
    buffer.write('tkhd', 4, 'ascii');
    const tkhd = readMp4BoxHeader(buffer, 0)!;

    expect(readTkhdMatrix(buffer, tkhd)).toBeUndefined();
  });
});
