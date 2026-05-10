import { NextResponse } from 'next/server';

const finalizeHandler = async (
  slug: string,
  versionId: string,
  filePath?: string
): Promise<NextResponse> => {
  const apiKey = process.env.HERENOW_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: 'HERENOW_API_KEY not configured' },
      { status: 500 }
    );
  }

  const res = await fetch(`https://here.now/api/v1/publish/${slug}/finalize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ versionId }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return NextResponse.json(
      { message: err.message ?? 'Failed to finalize upload' },
      { status: 500 }
    );
  }

  const data = (await res.json()) as { siteUrl: string };
  const url = filePath ? `${data.siteUrl}/${filePath}` : data.siteUrl;

  return NextResponse.json({ url });
};

export default finalizeHandler;
