export type Mp4Box = {
  type: string;
  start: number;
  contentStart: number;
  contentEnd: number;
};

/**
 * Reads one ISO-BMFF/QuickTime box header at `offset`: 4-byte size, 4-byte
 * type, with the standard 64-bit-size (size === 1) and rest-of-file
 * (size === 0) extensions.
 */
const readMp4BoxHeader = (
  buffer: Buffer,
  offset: number
): Mp4Box | undefined => {
  if (offset + 8 > buffer.length) return undefined;

  let size = buffer.readUInt32BE(offset);
  const type = buffer.toString('ascii', offset + 4, offset + 8);
  let headerSize = 8;

  if (size === 1) {
    if (offset + 16 > buffer.length) return undefined;
    const high = buffer.readUInt32BE(offset + 8);
    const low = buffer.readUInt32BE(offset + 12);
    size = high * 2 ** 32 + low;
    headerSize = 16;
  } else if (size === 0) {
    size = buffer.length - offset;
  }

  if (size < headerSize || offset + size > buffer.length) return undefined;

  return {
    type,
    start: offset,
    contentStart: offset + headerSize,
    contentEnd: offset + size,
  };
};

export default readMp4BoxHeader;
