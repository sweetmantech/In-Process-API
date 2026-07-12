import { describe, it, expect } from 'vitest';
import readMp4VideoRotationDegrees from '../readMp4VideoRotationDegrees';

const fixed1616 = (value: number): number => Math.round(value * 65536);

const box = (type: string, payload: Buffer): Buffer => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'ascii');
  return Buffer.concat([header, payload]);
};

const tkhdV0 = (matrix: {
  a: number;
  b: number;
  c: number;
  d: number;
  width: number;
  height: number;
}): Buffer => {
  const payload = Buffer.alloc(84);
  const matrixOffset = 4 + 20 + 8 + 8;
  payload.writeInt32BE(fixed1616(matrix.a), matrixOffset);
  payload.writeInt32BE(fixed1616(matrix.b), matrixOffset + 4);
  payload.writeInt32BE(fixed1616(matrix.c), matrixOffset + 12);
  payload.writeInt32BE(fixed1616(matrix.d), matrixOffset + 16);
  payload.writeInt32BE(0x40000000, matrixOffset + 32);
  payload.writeInt32BE(fixed1616(matrix.width), matrixOffset + 36);
  payload.writeInt32BE(fixed1616(matrix.height), matrixOffset + 40);
  return box('tkhd', payload);
};

const trak = (tkhdBuffer: Buffer): Buffer => box('trak', tkhdBuffer);

const buildMoovBuffer = (traks: Buffer[]): Buffer =>
  box('moov', Buffer.concat(traks));

describe('readMp4VideoRotationDegrees', () => {
  it('returns 0 for an unrotated (landscape, identity matrix) video track', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: 1, b: 0, c: 0, d: 1, width: 1920, height: 1080 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBe(0);
  });

  it('returns 90 for the real iPhone portrait-recording matrix (a=0,b=1,c=-1,d=0)', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: 0, b: 1, c: -1, d: 0, width: 1920, height: 1080 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBe(90);
  });

  it('returns 180 for an upside-down matrix', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: -1, b: 0, c: 0, d: -1, width: 1920, height: 1080 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBe(180);
  });

  it('returns 270 for a -90-class matrix', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: 0, b: -1, c: 1, d: 0, width: 1920, height: 1080 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBe(270);
  });

  it('skips audio/metadata tracks (zero width/height) and finds the video track', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: 1, b: 0, c: 0, d: 1, width: 0, height: 0 })),
      trak(tkhdV0({ a: 0, b: 1, c: -1, d: 0, width: 1920, height: 1080 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBe(90);
  });

  it('returns undefined when there is no moov box', () => {
    expect(readMp4VideoRotationDegrees(Buffer.from('not-mp4'))).toBeUndefined();
  });

  it('returns undefined when no track has a non-zero-dimension tkhd', () => {
    const buffer = buildMoovBuffer([
      trak(tkhdV0({ a: 1, b: 0, c: 0, d: 1, width: 0, height: 0 })),
    ]);

    expect(readMp4VideoRotationDegrees(buffer)).toBeUndefined();
  });
});
