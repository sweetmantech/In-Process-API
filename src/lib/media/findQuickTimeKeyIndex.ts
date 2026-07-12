import type { Mp4Box } from './readMp4BoxHeader';

/**
 * Finds the 1-based index of `targetKeyName` inside a QuickTime `keys` box.
 * `keys` is a full box: 4-byte version/flags, 4-byte entry count, then
 * entries of [4-byte size][4-byte namespace][key name bytes].
 */
const findQuickTimeKeyIndex = (
  buffer: Buffer,
  keysBox: Mp4Box,
  targetKeyName: string
): number | undefined => {
  let offset = keysBox.contentStart + 4;
  const count = buffer.readUInt32BE(offset);
  offset += 4;

  for (let index = 1; index <= count; index += 1) {
    const entrySize = buffer.readUInt32BE(offset);
    if (entrySize < 8 || offset + entrySize > keysBox.contentEnd)
      return undefined;
    const keyName = buffer.toString('utf8', offset + 8, offset + entrySize);
    if (keyName === targetKeyName) return index;
    offset += entrySize;
  }

  return undefined;
};

export default findQuickTimeKeyIndex;
