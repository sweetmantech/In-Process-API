import { NextResponse } from 'next/server';

const uploadHandler = async (
  fileName: string,
  fileSize: number,
  contentType: string,
  hash: string
): Promise<NextResponse> => {
  const res = await fetch('https://here.now/api/v1/publish', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HERENOW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: [{ path: fileName, size: fileSize, contentType, hash }],
      ttlSeconds: 3600,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { message: err.message ?? 'Failed to create upload session' },
      { status: 500 }
    );
  }

  const data = (await res.json()) as {
    slug: string;
    upload: {
      versionId: string;
      uploads: Array<{ url: string; headers: Record<string, string> }>;
    };
  };

  const upload = data.upload.uploads[0];

  return NextResponse.json({
    uploadUrl: upload.url,
    uploadHeaders: upload.headers ?? {},
    slug: data.slug,
    versionId: data.upload.versionId,
    filePath: fileName,
  });
};

export default uploadHandler;
