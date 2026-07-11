import convert from 'heic-convert';

const decodeHeicToJpegBuffer = async (buffer: Buffer): Promise<Buffer> => {
  const output = await convert({
    buffer,
    format: 'JPEG',
    quality: 1,
  });

  return Buffer.from(output);
};

export default decodeHeicToJpegBuffer;
