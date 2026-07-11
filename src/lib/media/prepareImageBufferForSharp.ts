import decodeHeicToJpegBuffer from './decodeHeicToJpegBuffer';
import isHeicBuffer from './isHeicBuffer';

const prepareImageBufferForSharp = async (buffer: Buffer): Promise<Buffer> => {
  if (!isHeicBuffer(buffer)) return buffer;
  return decodeHeicToJpegBuffer(buffer);
};

export default prepareImageBufferForSharp;
