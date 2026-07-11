const bufferStartsWith = (buffer: Buffer, magic: number[]): boolean =>
  magic.every((byte, index) => buffer[index] === byte);

export default bufferStartsWith;
