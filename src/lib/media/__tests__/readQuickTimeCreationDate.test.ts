import { describe, it, expect } from 'vitest';
import readQuickTimeCreationDate from '../readQuickTimeCreationDate';

const box = (type: string, payload: Buffer): Buffer => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length, 0);
  header.write(type, 4, 'ascii');
  return Buffer.concat([header, payload]);
};

const keysBox = (keyNames: string[]): Buffer => {
  const entries = keyNames.map((name) => {
    const nameBytes = Buffer.from(name, 'utf8');
    const entry = Buffer.alloc(8 + nameBytes.length);
    entry.writeUInt32BE(8 + nameBytes.length, 0);
    entry.write('mdta', 4, 'ascii');
    nameBytes.copy(entry, 8);
    return entry;
  });

  const header = Buffer.alloc(8);
  header.writeUInt32BE(0, 0); // version + flags
  header.writeUInt32BE(keyNames.length, 4); // entry count
  return box('keys', Buffer.concat([header, ...entries]));
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

const buildQuickTimeBuffer = (
  keyNames: string[],
  entriesByIndex: { keyIndex: number; value: string }[]
): Buffer => {
  const hdlr = box('hdlr', Buffer.alloc(4));
  const meta = box(
    'meta',
    Buffer.concat([hdlr, keysBox(keyNames), ilstBox(entriesByIndex)])
  );
  const mvhd = box('mvhd', Buffer.alloc(4));
  const moov = box('moov', Buffer.concat([mvhd, meta]));
  const ftyp = box('ftyp', Buffer.from('qt  '));
  return Buffer.concat([ftyp, moov]);
};

describe('readQuickTimeCreationDate', () => {
  it('extracts com.apple.quicktime.creationdate from moov/meta/keys+ilst', () => {
    const buffer = buildQuickTimeBuffer(
      ['com.apple.quicktime.make', 'com.apple.quicktime.creationdate'],
      [
        { keyIndex: 1, value: 'Apple' },
        { keyIndex: 2, value: '2026-06-17T12:30:03-0400' },
      ]
    );

    expect(readQuickTimeCreationDate(buffer)).toBe('2026-06-17T12:30:03-0400');
  });

  it('returns undefined when there is no moov box', () => {
    expect(readQuickTimeCreationDate(Buffer.from('not-mp4'))).toBeUndefined();
  });

  it('returns undefined when moov has no meta box', () => {
    const moov = box('moov', box('mvhd', Buffer.alloc(4)));
    expect(readQuickTimeCreationDate(moov)).toBeUndefined();
  });

  it('returns undefined when the creationdate key is absent', () => {
    const buffer = buildQuickTimeBuffer(
      ['com.apple.quicktime.make'],
      [{ keyIndex: 1, value: 'Apple' }]
    );

    expect(readQuickTimeCreationDate(buffer)).toBeUndefined();
  });
});
