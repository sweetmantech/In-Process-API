const isIcoBuffer = (buffer: Buffer): boolean =>
  buffer.length >= 6 &&
  buffer.readUInt16LE(0) === 0 &&
  buffer.readUInt16LE(2) === 1;

export default isIcoBuffer;
