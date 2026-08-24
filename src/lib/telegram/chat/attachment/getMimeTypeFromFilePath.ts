const mimeTypeMap: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mp3: 'audio/mpeg',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  aiff: 'audio/aiff',
  aif: 'audio/aiff',
  wma: 'audio/x-ms-wma',
  pdf: 'application/pdf',
};

const getMimeTypeFromFilePath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  return (ext && mimeTypeMap[ext]) || 'application/octet-stream';
};

export default getMimeTypeFromFilePath;
