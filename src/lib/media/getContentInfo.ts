export type ContentInfoSuccess = {
  ok: true;
  totalSize: number | null;
  supportsRange: boolean;
  contentType: string;
  finalUrl: string;
};

export type ContentInfoError = {
  ok: false;
  status: number;
  statusText: string;
};

export type ContentInfoResult = ContentInfoSuccess | ContentInfoError;

const getContentInfo = async (url: string): Promise<ContentInfoResult> => {
  const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      statusText: response.statusText,
    };
  }

  const contentLength = response.headers.get('content-length');
  const acceptRanges = response.headers.get('accept-ranges');
  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';

  // Use the final URL after any redirects
  const finalUrl = response.url || url;

  return {
    ok: true,
    totalSize: contentLength ? parseInt(contentLength, 10) : null,
    supportsRange: acceptRanges === 'bytes',
    contentType,
    finalUrl,
  };
};

export default getContentInfo;
