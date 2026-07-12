import { describe, it, expect } from 'vitest';
import findQuickTimeKeyIndex from '../findQuickTimeKeyIndex';
import readMp4BoxHeader from '../readMp4BoxHeader';

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
  const payload = Buffer.concat([header, ...entries]);

  const boxHeader = Buffer.alloc(8);
  boxHeader.writeUInt32BE(8 + payload.length, 0);
  boxHeader.write('keys', 4, 'ascii');
  return Buffer.concat([boxHeader, payload]);
};

describe('findQuickTimeKeyIndex', () => {
  it('returns the 1-based index of a matching key', () => {
    const buffer = keysBox([
      'com.apple.quicktime.make',
      'com.apple.quicktime.creationdate',
    ]);
    const box = readMp4BoxHeader(buffer, 0)!;

    expect(
      findQuickTimeKeyIndex(buffer, box, 'com.apple.quicktime.creationdate')
    ).toBe(2);
  });

  it('returns undefined when the key is absent', () => {
    const buffer = keysBox(['com.apple.quicktime.make']);
    const box = readMp4BoxHeader(buffer, 0)!;

    expect(
      findQuickTimeKeyIndex(buffer, box, 'com.apple.quicktime.creationdate')
    ).toBeUndefined();
  });
});
