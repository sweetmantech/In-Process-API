const readFtypBrands = (buffer: Buffer): string[] => {
  if (buffer.length < 16 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
    return [];
  }

  const ftypLength = buffer.readUInt32BE(0);
  if (ftypLength < 16 || ftypLength > buffer.length) return [];

  const brands: string[] = [];
  for (let offset = 16; offset + 4 <= ftypLength; offset += 4) {
    brands.push(buffer.toString('ascii', offset, offset + 4));
  }
  return brands;
};

export default readFtypBrands;
