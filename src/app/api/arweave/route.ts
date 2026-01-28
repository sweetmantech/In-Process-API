import { NextRequest } from 'next/server';
import uploadToArweave from '@/lib/arweave/uploadToArweave';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  const arweaveURI = await uploadToArweave(file);
  return Response.json(arweaveURI, { status: 200 });
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
