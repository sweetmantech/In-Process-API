import decodeHeicToJpegBuffer from './decodeHeicToJpegBuffer';
import decodeIcoToSharpBuffer from './decodeIcoToSharpBuffer';
import isHeicBuffer from './isHeicBuffer';
import isIcoBuffer from './isIcoBuffer';

const prepareImageBufferForSharp = async (buffer: Buffer): Promise<Buffer> => {
  if (isHeicBuffer(buffer)) return decodeHeicToJpegBuffer(buffer);
  if (isIcoBuffer(buffer)) return decodeIcoToSharpBuffer(buffer);
  return buffer;
};

export default prepareImageBufferForSharp;
