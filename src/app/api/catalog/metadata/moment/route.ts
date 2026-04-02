import { NextRequest } from 'next/server';
import validateCatalogUpdateMetadata from '@/lib/catalog/validateCatalogUpdateMetadata';
import updateCatalogMetadataHandler from '@/lib/catalog/updateCatalogMetadataHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCatalogUpdateMetadata(req);
    if (validated instanceof Response) return validated;
    return await updateCatalogMetadataHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to update catalog metadata' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
