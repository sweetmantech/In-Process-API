const getContentInfo = async (url: string) => {
  const response = await fetch(url, { method: 'HEAD' });
  const contentLength = response.headers.get('content-length');
  const acceptRanges = response.headers.get('accept-ranges');
  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';

  return {
    totalSize: contentLength ? parseInt(contentLength, 10) : null,
    supportsRange: acceptRanges === 'bytes',
    contentType,
  };
};

export default getContentInfo;
