declare module 'heic-convert' {
  type HeicConvertInput = {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  };

  const convert: (input: HeicConvertInput) => Promise<Uint8Array>;
  export default convert;
}
