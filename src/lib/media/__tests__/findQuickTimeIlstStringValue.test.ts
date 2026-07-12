import { describe, it, expect } from 'vitest';
import findQuickTimeIlstStringValue from '../findQuickTimeIlstStringValue';
import readMp4BoxHeader from '../readMp4BoxHeader';

const box = (type: string, payload: Buffer): Buffer => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'ascii');
  return Buffer.concat([header, payload]);
};

const dataBox = (value: string): Buffer => {
  const valueBytes = Buffer.from(value, 'utf8');
  const payload = Buffer.alloc(8 + valueBytes.length);
  payload.writeUInt32BE(1, 0); // type indicator: UTF-8 text
  payload.writeUInt32BE(0, 4); // locale
  valueBytes.copy(payload, 8);
  return box('data', payload);
};

const ilstBox = (
  entriesByIndex: { keyIndex: number; value: string }[]
): Buffer => {
  const entries = entriesByIndex.map(({ keyIndex, value }) => {
    const data = dataBox(value);
    const header = Buffer.alloc(8);
    header.writeUInt32BE(8 + data.length, 0);
    header.writeUInt32BE(keyIndex, 4); // "type" is the 1-based key index
    return Buffer.concat([header, data]);
  });
  return box('ilst', Buffer.concat(entries));
};

describe('findQuickTimeIlstStringValue', () => {
  it('resolves the string value for a matching key index', () => {
    const buffer = ilstBox([
      { keyIndex: 1, value: 'Apple' },
      { keyIndex: 2, value: '2026-06-17T12:30:03-0400' },
    ]);
    const box = readMp4BoxHeader(buffer, 0)!;

    expect(findQuickTimeIlstStringValue(buffer, box, 2)).toBe(
      '2026-06-17T12:30:03-0400'
    );
  });

  it('returns undefined when no entry matches the key index', () => {
    const buffer = ilstBox([{ keyIndex: 1, value: 'Apple' }]);
    const box = readMp4BoxHeader(buffer, 0)!;

    expect(findQuickTimeIlstStringValue(buffer, box, 2)).toBeUndefined();
  });
});
