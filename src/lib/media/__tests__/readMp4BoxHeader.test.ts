import { describe, it, expect } from 'vitest';
import readMp4BoxHeader from '../readMp4BoxHeader';

const box = (type: string, payload: Buffer): Buffer => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'ascii');
  return Buffer.concat([header, payload]);
};

describe('readMp4BoxHeader', () => {
  it('reads a standard 32-bit box header', () => {
    const buffer = box('ftyp', Buffer.from('payload'));

    expect(readMp4BoxHeader(buffer, 0)).toEqual({
      type: 'ftyp',
      start: 0,
      contentStart: 8,
      contentEnd: 15,
    });
  });

  it('reads a 64-bit extended-size box (size === 1)', () => {
    const payload = Buffer.from('payload');
    const buffer = Buffer.alloc(16 + payload.length);
    buffer.writeUInt32BE(1, 0);
    buffer.write('mdat', 4, 'ascii');
    buffer.writeUInt32BE(0, 8);
    buffer.writeUInt32BE(16 + payload.length, 12);
    payload.copy(buffer, 16);

    expect(readMp4BoxHeader(buffer, 0)).toEqual({
      type: 'mdat',
      start: 0,
      contentStart: 16,
      contentEnd: 16 + payload.length,
    });
  });

  it('treats size === 0 as extending to end of buffer', () => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(0, 0);
    header.write('mdat', 4, 'ascii');
    const buffer = Buffer.concat([header, Buffer.from('rest-of-file')]);

    const result = readMp4BoxHeader(buffer, 0);
    expect(result?.contentEnd).toBe(buffer.length);
  });

  it('returns undefined when fewer than 8 bytes remain', () => {
    expect(readMp4BoxHeader(Buffer.from('ab'), 0)).toBeUndefined();
  });

  it('returns undefined when the declared size overruns the buffer', () => {
    const header = Buffer.alloc(8);
    header.writeUInt32BE(999, 0);
    header.write('ftyp', 4, 'ascii');

    expect(readMp4BoxHeader(header, 0)).toBeUndefined();
  });
});
