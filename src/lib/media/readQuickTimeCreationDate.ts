import listMp4ChildBoxes from './listMp4ChildBoxes';
import findQuickTimeKeyIndex from './findQuickTimeKeyIndex';
import findQuickTimeIlstStringValue from './findQuickTimeIlstStringValue';

const QUICKTIME_CREATIONDATE_KEY = 'com.apple.quicktime.creationdate';

/**
 * Reads the raw `com.apple.quicktime.creationdate` value that iPhone/
 * QuickTime writes into moov/meta/keys+ilst (e.g.
 * "2026-06-17T12:30:03-0400"). Returns the raw string uninterpreted —
 * callers own timezone/epoch conversion. Errors (malformed/foreign atom
 * tree) propagate to the caller rather than being swallowed here.
 */
const readQuickTimeCreationDate = (buffer: Buffer): string | undefined => {
  const moov = listMp4ChildBoxes(buffer, 0, buffer.length).find(
    (box) => box.type === 'moov'
  );
  if (!moov) return undefined;

  const meta = listMp4ChildBoxes(
    buffer,
    moov.contentStart,
    moov.contentEnd
  ).find((box) => box.type === 'meta');
  if (!meta) return undefined;

  // Unlike the ISO-BMFF `meta` box, QuickTime's `meta` has no version/flags
  // header — its children start immediately at contentStart.
  const metaChildren = listMp4ChildBoxes(
    buffer,
    meta.contentStart,
    meta.contentEnd
  );
  const keysBox = metaChildren.find((box) => box.type === 'keys');
  const ilstBox = metaChildren.find((box) => box.type === 'ilst');
  if (!keysBox || !ilstBox) return undefined;

  const keyIndex = findQuickTimeKeyIndex(
    buffer,
    keysBox,
    QUICKTIME_CREATIONDATE_KEY
  );
  if (keyIndex === undefined) return undefined;

  return findQuickTimeIlstStringValue(buffer, ilstBox, keyIndex);
};

export default readQuickTimeCreationDate;
