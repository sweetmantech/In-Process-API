import { v4 as uuidv4 } from 'uuid';

const toFile = (buffer: Buffer, name: string, mimeType: string): File => {
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  return new File([arrayBuffer], name || uuidv4(), { type: mimeType });
};

export default toFile;
