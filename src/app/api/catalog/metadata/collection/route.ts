import { NextRequest } from 'next/server';
import validateCatalogUpdateCollectionMetadata from '@/lib/catalog/validateCatalogUpdateCollectionMetadata';
import updateCatalogCollectionMetadataHandler from '@/lib/catalog/updateCatalogCollectionMetadataHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCatalogUpdateCollectionMetadata(req);
    if (validated instanceof Response) return validated;
    return await updateCatalogCollectionMetadataHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to update catalog collection metadata' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
