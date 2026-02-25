import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fetchUri from '@/lib/arweave/fetchUri';

const CONTENT_TYPES: Record<string, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const imageProxyHandler = async ({
  url,
  width,
  height,
  quality,
  format,
}: {
  url: string;
  width?: number;
  height?: number;
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
}) => {
  const response = await fetchUri(url);

  if (!response.ok) {
    return NextResponse.json(
      { status: 'error', message: `Failed to fetch image: ${response.status}` },
      { status: response.status }
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let pipeline = sharp(buffer).autoOrient();

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to target format
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
  }

  const outputBuffer = await pipeline.toBuffer();

  return new Response(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      'Content-Type': CONTENT_TYPES[format],
      'Content-Length': outputBuffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export default imageProxyHandler;
