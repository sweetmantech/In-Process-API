import getMimeTypeFromFilePath from './getMimeTypeFromFilePath';
import detectMimeTypeFromBuffer from './detectMimeTypeFromBuffer';

const resolveTelegramFileMimeType = (
  filePath: string,
  buffer: Buffer
): string => {
  const fromPath = getMimeTypeFromFilePath(filePath);
  if (fromPath !== 'application/octet-stream') return fromPath;
  return detectMimeTypeFromBuffer(buffer) ?? fromPath;
};

export default resolveTelegramFileMimeType;
