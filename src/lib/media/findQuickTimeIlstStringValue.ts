import listMp4ChildBoxes from './listMp4ChildBoxes';
import type { Mp4Box } from './readMp4BoxHeader';

/**
 * Finds the string value for `keyIndex` inside a QuickTime `ilst` box. Each
 * ilst entry's 4-byte "type" is actually the 1-based key index from the
 * `keys` box, not an ASCII tag; the value itself lives in a nested `data`
 * box (4-byte type indicator, 4-byte locale, then the value bytes).
 */
const findQuickTimeIlstStringValue = (
  buffer: Buffer,
  ilstBox: Mp4Box,
  keyIndex: number
): string | undefined => {
  const entries = listMp4ChildBoxes(
    buffer,
    ilstBox.contentStart,
    ilstBox.contentEnd
  );
  const entry = entries.find(
    (box) => buffer.readUInt32BE(box.start + 4) === keyIndex
  );
  if (!entry) return undefined;

  const dataBox = listMp4ChildBoxes(
    buffer,
    entry.contentStart,
    entry.contentEnd
  ).find((box) => box.type === 'data');
  if (!dataBox) return undefined;

  return buffer.toString('utf8', dataBox.contentStart + 8, dataBox.contentEnd);
};

export default findQuickTimeIlstStringValue;
