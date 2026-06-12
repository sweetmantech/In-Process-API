const toFile = (buffer: Buffer, name: string, mimeType: string): File => {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  return new File([arrayBuffer], name, { type: mimeType });
};

export default toFile;
